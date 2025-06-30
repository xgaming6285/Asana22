import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET a specific project by ID
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// UPDATE a specific project by ID
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in the system" },
        { status: 404 }
      );
    }

    // Check if user has permission to update (ADMIN or CREATOR)
    const membership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: user.id,
        status: "ACTIVE",
        role: { in: ["ADMIN", "CREATOR"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update this project" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE a specific project by ID
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const { userId: clerkUserId } = await auth();
    console.log('Auth result - clerkUserId:', clerkUserId);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, clerkId: true, email: true },
    });

    if (!user) {
      console.log('User lookup failed for clerkUserId:', clerkUserId);
      return NextResponse.json(
        { error: "User not found in the system" },
        { status: 404 }
      );
    }

    // Check if user is the CREATOR of the project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: user.id,
        status: "ACTIVE",
        role: "CREATOR",
      },
    });

    // Debug logging
    console.log('DELETE PROJECT DEBUG:');
    console.log('Project ID:', parseInt(id));
    console.log('User ID:', user.id);
    console.log('User Clerk ID:', user.clerkId);
    console.log('Found membership:', membership);

    // Also check all memberships for this project and user for debugging
    const allMemberships = await prisma.projectMembership.findMany({
      where: {
        projectId: parseInt(id),
        userId: user.id,
      },
    });
    console.log('All memberships for user in this project:', allMemberships);

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: Only the project creator can delete this project" },
        { status: 403 }
      );
    }

    // Delete the project and all related records in a transaction
    await prisma.$transaction(async (tx) => {
      const projectId = parseInt(id);

      // Delete all comments on tasks in this project
      await tx.comment.deleteMany({
        where: {
          task: {
            projectId: projectId
          }
        }
      });

      // Delete all tasks in this project
      await tx.task.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Delete all messages in this project
      await tx.message.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Delete all files in this project
      await tx.file.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Delete all project invitations
      await tx.projectInvitation.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Delete all project memberships
      await tx.projectMembership.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Delete all project-goal links
      await tx.projectGoal.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // Finally, delete the project itself
      await tx.project.delete({
        where: { id: projectId }
      });
    });

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
