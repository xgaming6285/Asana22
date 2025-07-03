import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSuperAdmin } from "@/app/utils/auth";
import { decryptUserData, encryptUserData } from "@/app/utils/encryption";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET specific user (Super Admin only)
export async function GET(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectMemberships: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        },
        goalMemberships: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
              }
            }
          }
        },
        ownedGoals: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            status: true,
          }
        },
        createdTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          }
        },
        _count: {
          select: {
            projectMemberships: true,
            goalMemberships: true,
            ownedGoals: true,
            createdTasks: true,
            tasks: true,
            comments: true,
            messages: true,
            files: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decrypt user data
    const decryptedUser = decryptUserData(user);

    return NextResponse.json({
      ...decryptedUser,
      projectMemberships: user.projectMemberships.map(membership => ({
        ...membership,
        project: membership.project
      })),
      goalMemberships: user.goalMemberships,
      ownedGoals: user.ownedGoals,
      createdTasks: user.createdTasks,
      tasks: user.tasks,
      _count: user._count,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT update user (Super Admin only)
export async function PUT(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    const { email, firstName, lastName, password, systemRole } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is being updated, check for conflicts
    if (email && email !== decryptUserData(existingUser).email) {
      const allUsers = await prisma.user.findMany();
      const emailConflict = allUsers.find(u => 
        u.id !== userId && decryptUserData(u).email === email
      );

      if (emailConflict) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {};

    // Encrypt user data if provided
    if (email || firstName || lastName) {
      const currentDecrypted = decryptUserData(existingUser);
      const encryptedData = encryptUserData({
        email: email || currentDecrypted.email,
        firstName: firstName || currentDecrypted.firstName,
        lastName: lastName || currentDecrypted.lastName,
      });
      
      updateData.email = encryptedData.email;
      updateData.firstName = encryptedData.firstName;
      updateData.lastName = encryptedData.lastName;
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update system role if provided
    if (systemRole && ['USER', 'SUPER_ADMIN'].includes(systemRole)) {
      updateData.systemRole = systemRole;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Decrypt user data before returning
    const decryptedUser = decryptUserData(updatedUser);

    return NextResponse.json(decryptedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE user (Super Admin only)
export async function DELETE(request, { params }) {
  try {
    const adminUserId = await requireSuperAdmin();

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting self
    if (userId === adminUserId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// PATCH user project memberships (Super Admin only)
export async function PATCH(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    const { action, projectId, role } = data;

    if (!action || !projectId) {
      return NextResponse.json({ error: "Action and project ID are required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    switch (action) {
      case 'ADD_TO_PROJECT':
        // Check if user is already a member
        const existingMembership = await prisma.projectMembership.findFirst({
          where: {
            userId: userId,
            projectId: parseInt(projectId),
          },
        });

        if (existingMembership) {
          return NextResponse.json({ error: "User is already a member of this project" }, { status: 400 });
        }

        // Add user to project
        await prisma.projectMembership.create({
          data: {
            userId: userId,
            projectId: parseInt(projectId),
            role: role || 'USER',
            status: 'ACTIVE',
          },
        });

        return NextResponse.json({ message: "User added to project successfully" });

      case 'REMOVE_FROM_PROJECT':
        // Check if user is a member
        const membership = await prisma.projectMembership.findFirst({
          where: {
            userId: userId,
            projectId: parseInt(projectId),
          },
        });

        if (!membership) {
          return NextResponse.json({ error: "User is not a member of this project" }, { status: 400 });
        }

        // Remove user from project
        await prisma.projectMembership.delete({
          where: {
            id: membership.id,
          },
        });

        return NextResponse.json({ message: "User removed from project successfully" });

      case 'CHANGE_ROLE':
        // Check if user is a member
        const membershipToUpdate = await prisma.projectMembership.findFirst({
          where: {
            userId: userId,
            projectId: parseInt(projectId),
          },
        });

        if (!membershipToUpdate) {
          return NextResponse.json({ error: "User is not a member of this project" }, { status: 400 });
        }

        if (!role || !['USER', 'ADMIN', 'CREATOR'].includes(role)) {
          return NextResponse.json({ error: "Valid role is required" }, { status: 400 });
        }

        // Update user role in project
        await prisma.projectMembership.update({
          where: {
            id: membershipToUpdate.id,
          },
          data: {
            role: role,
          },
        });

        return NextResponse.json({ message: "User role updated successfully" });

      case 'MOVE_TO_PROJECT':
        const { fromProjectId } = data;
        
        if (!fromProjectId) {
          return NextResponse.json({ error: "From project ID is required for move operation" }, { status: 400 });
        }

        // Check if source project exists
        const fromProject = await prisma.project.findUnique({
          where: { id: parseInt(fromProjectId) },
        });

        if (!fromProject) {
          return NextResponse.json({ error: "Source project not found" }, { status: 404 });
        }

        // Check if user is member of source project
        const sourceMembership = await prisma.projectMembership.findFirst({
          where: {
            userId: userId,
            projectId: parseInt(fromProjectId),
          },
        });

        if (!sourceMembership) {
          return NextResponse.json({ error: "User is not a member of the source project" }, { status: 400 });
        }

        // Check if user is already in target project
        const targetMembership = await prisma.projectMembership.findFirst({
          where: {
            userId: userId,
            projectId: parseInt(projectId),
          },
        });

        if (targetMembership) {
          return NextResponse.json({ error: "User is already a member of the target project" }, { status: 400 });
        }

        // Move user from source to target project
        await prisma.$transaction([
          // Remove from source project
          prisma.projectMembership.delete({
            where: {
              id: sourceMembership.id,
            },
          }),
          // Add to target project
          prisma.projectMembership.create({
            data: {
              userId: userId,
              projectId: parseInt(projectId),
              role: role || sourceMembership.role, // Keep same role or use new one
              status: 'ACTIVE',
            },
          }),
        ]);

        return NextResponse.json({ message: "User moved to project successfully" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing user project membership:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to manage user project membership" }, { status: 500 });
  }
} 