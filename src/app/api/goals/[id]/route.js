import { NextResponse } from "next/server";
import { getUserIdFromToken, isSuperAdmin } from "@/app/utils/auth";
import { PrismaClient } from "@prisma/client";
import { encryptGoalData, decryptGoalData } from "../../../utils/encryption.js";

const prisma = new PrismaClient();

export async function PATCH(request, context) {
  try {
    const url = new URL(request.url);
    const goalId = parseInt(url.pathname.split('/')[3]);

    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isSuperAdmin(userId);
    const dataToUpdate = await request.json();

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid Goal ID" }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { 
        members: true,
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
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Super admin bypass or regular permission check
    if (!isAdmin) {
      const userMembership = goal.members.find(m => m.userId === userId);
      
      let canEdit = false;
      
      if (goal.ownerId === userId) {
        canEdit = true;
      }
      else if (goal.type === 'TEAM' && userMembership?.role === 'EDITOR') {
        canEdit = true;
      }
      else if (goal.linkedProjects.length > 0) {
        const hasProjectAccess = goal.linkedProjects.some(linkedProject => 
          linkedProject.project.projectMemberships.length > 0
        );
        
        if (hasProjectAccess) {
          canEdit = (goal.type === 'TEAM') || (userMembership?.role === 'EDITOR');
        }
      }

      if (!canEdit) {
        return NextResponse.json({ error: "You don't have permission to edit this goal" }, { status: 403 });
      }
    }

    // Encrypt the data to update if it contains sensitive fields
    const encryptedDataToUpdate = encryptGoalData(dataToUpdate);

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: encryptedDataToUpdate,
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
    const decryptedGoal = decryptGoalData(updatedGoal);

    return NextResponse.json(decryptedGoal);

  } catch (error) {
    console.error("Goal PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const url = new URL(request.url);
    const goalId = parseInt(url.pathname.split('/')[3]);

    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isSuperAdmin(userId);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid Goal ID" }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({ 
      where: { id: goalId },
      include: {
        members: true,
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
      }
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Super admin bypass or regular permission check
    if (!isAdmin) {
      let canDelete = false;
      
      // UPDATED LOGIC: Only goal owner can delete (consistent with task deletion logic)
      // Goal members/editors can only modify, not delete (same as assigned users for tasks)
      if (goal.ownerId === userId) {
        canDelete = true;
      }
      // For linked goals, only project ADMIN/CREATOR can delete (same as task deletion)
      else if (goal.linkedProjects.length > 0) {
        const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
          linkedProject.project.projectMemberships.some(membership => 
            membership.role === 'ADMIN' || membership.role === 'CREATOR'
          )
        );
        canDelete = hasAdminAccess;
      }

      if (!canDelete) {
        return NextResponse.json({ error: "Forbidden: Only goal owner or project admin/creator can delete this goal" }, { status: 403 });
      }
    }

    await prisma.goal.delete({ where: { id: goalId } });

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("Goal DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}