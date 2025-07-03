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

    // Prevent self-deletion
    if (userId === adminUserId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (this will cascade to related records based on schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
} 