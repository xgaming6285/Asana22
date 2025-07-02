import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encryptGoalData, decryptGoalsArray, decryptUserData } from "../../utils/encryption.js";
import { getUserIdFromToken } from "../../utils/auth.js";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const projectId = searchParams.get("projectId");

    let whereClause = {};

    if (projectId) {
      const projectMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
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
            { ownerId: userId },
            { members: { some: { userId: userId } } }
          ]
        };
      } else if (type === 'TEAM' || type === 'COMPANY') {
        whereClause = {
          type: type,
          OR: [
            { ownerId: userId },
            { members: { some: { userId: userId } } }
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
                    userId: userId,
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
      const userMembership = goal.members.find(m => m.userId === userId);
      
      let canEdit = false;
      let canDelete = false;
      
      if (projectId) {
        canEdit = goal.ownerId === userId || 
                 (userMembership && (userMembership.role === 'EDITOR' || goal.type === 'TEAM'));
        // For deletion: Only goal owner or project admin/creator can delete (consistent with task logic)
        canDelete = goal.ownerId === userId;
        // Check if user is project admin/creator for linked goals
        if (!canDelete && goal.linkedProjects.length > 0) {
          const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
            linkedProject.project.projectMemberships?.some(membership => 
              membership.userId === userId && (membership.role === 'ADMIN' || membership.role === 'CREATOR')
            )
          );
          canDelete = hasAdminAccess;
        }
      } else {
        canEdit = goal.ownerId === userId ||
                 (goal.type === 'TEAM' && userMembership?.role === 'EDITOR');
        // For deletion: Only goal owner can delete (consistent with task logic)
        canDelete = goal.ownerId === userId;
        // Check if user is project admin/creator for any linked goals
        if (!canDelete && goal.linkedProjects.length > 0) {
          const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
            linkedProject.project.projectMemberships?.some(membership => 
              membership.userId === userId && (membership.role === 'ADMIN' || membership.role === 'CREATOR')
            )
          );
          canDelete = hasAdminAccess;
        }
      }

      return { ...goal, canEdit, canDelete };
    });

    // Decrypt goals and user data before sending to client
    const decryptedGoals = decryptGoalsArray(goalsWithPermissions).map(goal => ({
      ...goal,
      owner: goal.owner ? decryptUserData(goal.owner) : null,
      members: goal.members ? goal.members.map(member => ({
        ...member,
        user: decryptUserData(member.user)
      })) : []
    }));

    return NextResponse.json(decryptedGoals);

  } catch (error) {
    console.error("Goals GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();

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
          userId: userId,
          status: 'ACTIVE'
        }
      });

      if (!projectMembership) {
        return NextResponse.json({ error: "Access denied to project" }, { status: 403 });
      }
    }

    const finalOwnerId = ownerId ? parseInt(ownerId) : userId;
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

    // Decrypt goal data and user data before sending response
    const decryptedGoal = decryptGoalsArray([newGoal])[0];
    decryptedGoal.owner = decryptedGoal.owner ? decryptUserData(decryptedGoal.owner) : null;
    decryptedGoal.members = decryptedGoal.members ? decryptedGoal.members.map(member => ({
      ...member,
      user: decryptUserData(member.user)
    })) : [];

    return NextResponse.json(decryptedGoal, { status: 201 });

  } catch (error) {
    console.error("Goals POST Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}