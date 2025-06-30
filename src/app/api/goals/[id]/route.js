import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request, context) {
  try {
    const url = new URL(request.url);
    const goalId = parseInt(url.pathname.split('/')[3]);

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
                    userId: user.id,
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

    const userMembership = goal.members.find(m => m.userId === user.id);
    
    let canEdit = false;
    
    if (goal.ownerId === user.id) {
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

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: dataToUpdate,
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

    return NextResponse.json(updatedGoal);

  } catch (error) {
    console.error("Goal PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const url = new URL(request.url);
    const goalId = parseInt(url.pathname.split('/')[3]);

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid Goal ID" }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({ 
      where: { id: goalId },
      include: {
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
      }
    });

    let canDelete = false;
    
    if (goal && goal.ownerId === user.id) {
      canDelete = true;
    }
    else if (goal && goal.linkedProjects.length > 0) {
      const hasAdminAccess = goal.linkedProjects.some(linkedProject => 
        linkedProject.project.projectMemberships.some(membership => 
          membership.role === 'ADMIN' || membership.role === 'CREATOR'
        )
      );
      canDelete = hasAdminAccess;
    }

    if (!canDelete) {
      return NextResponse.json({ error: "Goal not found or you don't have permission to delete it" }, { status: 403 });
    }

    await prisma.goal.delete({ where: { id: goalId } });

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("Goal DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}