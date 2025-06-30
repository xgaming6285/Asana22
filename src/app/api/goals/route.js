import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { encryptGoalData, decryptGoalsArray } from "../../utils/encryption.js";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const projectId = searchParams.get("projectId");

    let whereClause = {};

    if (projectId) {
      const projectMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: user.id,
          status: 'ACTIVE'
        }
      });

      if (!projectMembership) {
        return NextResponse.json({ error: "Access denied to project" }, { status: 403 });
      }

      whereClause = {
        linkedProjects: {
          some: {
            projectId: parseInt(projectId)
          }
        }
      };
    } else {
      if (type === 'PERSONAL') {
        whereClause = {
          type: 'PERSONAL',
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        };
      } else if (type === 'TEAM' || type === 'COMPANY') {
        whereClause = {
          type: type,
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        };
      }
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        },
        linkedProjects: {
          include: {
            project: {
              include: {
                projectMemberships: {
                  where: {
                    userId: user.id,
                    status: 'ACTIVE'
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const goalsWithPermissions = goals.map(goal => {
      const userMembership = goal.members.find(m => m.userId === user.id);
      
      let canEdit = false;
      let canDelete = false;
      
      if (projectId) {
        canEdit = goal.ownerId === user.id || 
                 (userMembership && (userMembership.role === 'EDITOR' || goal.type === 'TEAM'));
        // For deletion: Only goal owner or project admin/creator can delete (consistent with task logic)
        canDelete = goal.ownerId === user.id;
        // Check if user is project admin/creator for linked goals
        if (!canDelete && goal.linkedProjects.length > 0) {
          const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
            linkedProject.project.projectMemberships?.some(membership => 
              membership.userId === user.id && (membership.role === 'ADMIN' || membership.role === 'CREATOR')
            )
          );
          canDelete = hasAdminAccess;
        }
      } else {
        canEdit = goal.ownerId === user.id ||
                 (goal.type === 'TEAM' && userMembership?.role === 'EDITOR');
        // For deletion: Only goal owner can delete (consistent with task logic)
        canDelete = goal.ownerId === user.id;
        // Check if user is project admin/creator for any linked goals
        if (!canDelete && goal.linkedProjects.length > 0) {
          const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
            linkedProject.project.projectMemberships?.some(membership => 
              membership.userId === user.id && (membership.role === 'ADMIN' || membership.role === 'CREATOR')
            )
          );
          canDelete = hasAdminAccess;
        }
      }

      return { ...goal, canEdit, canDelete };
    });

    // Decrypt goals before sending to client
    const decryptedGoals = decryptGoalsArray(goalsWithPermissions);

    return NextResponse.json(decryptedGoals);

  } catch (error) {
    console.error("Goals GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { 
      title, 
      description, 
      type, 
      ownerId, 
      privacy, 
      startDate, 
      endDate, 
      memberIds = [],
      projectId
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (projectId) {
      const projectMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: user.id,
          status: 'ACTIVE'
        }
      });

      if (!projectMembership) {
        return NextResponse.json({ error: "Access denied to project" }, { status: 403 });
      }
    }

    const finalOwnerId = ownerId ? parseInt(ownerId) : user.id;
    const finalType = type || (projectId ? 'TEAM' : 'PERSONAL');

    // Encrypt goal data before storing
    const encryptedData = encryptGoalData({ title, description });

    const newGoal = await prisma.goal.create({
      data: {
        title: encryptedData.title,
        description: encryptedData.description,
        type: finalType,
        ownerId: finalOwnerId,
        privacy: privacy || "public",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        members: {
          create: [
            {
              userId: finalOwnerId,
              role: finalType === 'TEAM' ? 'EDITOR' : 'MEMBER'
            },
            ...memberIds
              .filter(id => id !== finalOwnerId)
              .map(id => ({
                userId: id,
                role: 'MEMBER'
              }))
          ]
        },
        ...(projectId && {
          linkedProjects: {
            create: {
              projectId: parseInt(projectId)
            }
          }
        })
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        },
        linkedProjects: {
          include: {
            project: true
          }
        }
      }
    });

    // Decrypt goal data before sending response
    const decryptedGoal = decryptGoalsArray([newGoal])[0];

    return NextResponse.json(decryptedGoal, { status: 201 });

  } catch (error) {
    console.error("Goals POST Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}