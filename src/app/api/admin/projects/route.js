import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSuperAdmin } from "@/app/utils/auth";
import { decryptProjectsArray, decryptProjectData, encryptProjectData, decryptUserData } from "@/app/utils/encryption";

const prisma = new PrismaClient();

// GET all projects (Super Admin only)
export async function GET(request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Get all projects with their memberships, tasks, goals, etc.
    const projects = await prisma.project.findMany({
      skip,
      take: limit,
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
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assigneeId: true,
            createdById: true,
          }
        },
        linkedGoals: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
              }
            }
          }
        },
        messages: {
          select: {
            id: true,
            text: true,
            userId: true,
          }
        },
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            type: true,
            uploaderId: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalProjects = await prisma.project.count();

    // Decrypt project data
    const decryptedProjects = decryptProjectsArray(projects).map(project => ({
      ...project,
      projectMemberships: project.projectMemberships.map(membership => ({
        ...membership,
        user: decryptUserData(membership.user)
      })),
      tasks: project.tasks,
      linkedGoals: project.linkedGoals,
      messages: project.messages,
      files: project.files,
      _count: project._count,
    }));

    // Filter by search if provided
    const filteredProjects = search ? decryptedProjects.filter(project => 
      project.name?.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase())
    ) : decryptedProjects;

    return NextResponse.json({
      projects: filteredProjects,
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST create new project (Super Admin only)
export async function POST(request) {
  try {
    const adminUserId = await requireSuperAdmin();

    const data = await request.json();
    const { name, description, ownerId } = data;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // If ownerId is provided, check if user exists
    let projectOwnerId = adminUserId; // Default to admin as owner
    if (ownerId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(ownerId) },
      });
      if (!user) {
        return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
      }
      projectOwnerId = parseInt(ownerId);
    }

    // Encrypt project data
    const encryptedProjectData = encryptProjectData({
      name,
      description: description || '',
    });

    // Create project
    const newProject = await prisma.project.create({
      data: {
        name: encryptedProjectData.name,
        description: encryptedProjectData.description,
        projectMemberships: {
          create: {
            userId: projectOwnerId,
            role: 'CREATOR',
            status: 'ACTIVE',
          }
        }
      },
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
    const decryptedProject = decryptProjectData(newProject);

    return NextResponse.json({
      ...decryptedProject,
      projectMemberships: newProject.projectMemberships.map(membership => ({
        ...membership,
        user: decryptUserData(membership.user)
      })),
      _count: newProject._count,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
} 