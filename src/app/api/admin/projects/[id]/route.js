import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSuperAdmin } from "@/app/utils/auth";
import { decryptProjectData, encryptProjectData, decryptUserData } from "@/app/utils/encryption";

const prisma = new PrismaClient();

// GET specific project (Super Admin only)
export async function GET(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectMemberships: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
                systemRole: true,
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        linkedGoals: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                status: true,
                progress: true,
              }
            }
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        files: {
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            projectMemberships: true,
            tasks: true,
            linkedGoals: true,
            messages: true,
            files: true,
          }
        }
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Decrypt project data
    const decryptedProject = decryptProjectData(project);

    return NextResponse.json({
      ...decryptedProject,
      projectMemberships: project.projectMemberships.map(membership => ({
        ...membership,
        user: decryptUserData(membership.user)
      })),
      tasks: project.tasks.map(task => ({
        ...task,
        assignee: task.assignee ? decryptUserData(task.assignee) : null,
        createdBy: task.createdBy ? decryptUserData(task.createdBy) : null,
      })),
      linkedGoals: project.linkedGoals,
      messages: project.messages.map(message => ({
        ...message,
        user: decryptUserData(message.user)
      })),
      files: project.files.map(file => ({
        ...file,
        uploader: decryptUserData(file.uploader)
      })),
      _count: project._count,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT update project (Super Admin only)
export async function PUT(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const data = await request.json();
    const { name, description } = data;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};

    if (name || description !== undefined) {
      const currentDecrypted = decryptProjectData(existingProject);
      const encryptedData = encryptProjectData({
        name: name || currentDecrypted.name,
        description: description !== undefined ? description : currentDecrypted.description,
      });
      
      updateData.name = encryptedData.name;
      updateData.description = encryptedData.description;
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        projectMemberships: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              }
            }
          }
        },
        _count: {
          select: {
            projectMemberships: true,
            tasks: true,
            linkedGoals: true,
            messages: true,
            files: true,
          }
        }
      },
    });

    // Decrypt project data before returning
    const decryptedProject = decryptProjectData(updatedProject);

    return NextResponse.json({
      ...decryptedProject,
      projectMemberships: updatedProject.projectMemberships.map(membership => ({
        ...membership,
        user: decryptUserData(membership.user)
      })),
      _count: updatedProject._count,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE project (Super Admin only)
export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete project (this will cascade to related records based on schema)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting project:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
} 