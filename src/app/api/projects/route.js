import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, withErrorHandling } from "../../utils/apiOptimizer";
import { encryptGoalData, decryptGoalsArray, encryptProjectData, decryptProjectsArray } from "../../utils/encryption.js";

const prisma = new PrismaClient();

export async function GET(request) {
  return withErrorHandling(async () => {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return createApiResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return createApiResponse({ error: "User not found" }, { status: 401 });
    }

    // Get the internal user ID from Clerk ID
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!dbUser) {
      // Create the user if they don't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // Get all projects where the user is a member with ACTIVE status
    const projects = await prisma.project.findMany({
      where: {
        projectMemberships: {
          some: {
            userId: dbUser.id,
            status: "ACTIVE",
          },
        },
      },
      include: {
        projectMemberships: {
          where: {
            status: "ACTIVE", // Get all active members, not just current user
          },
          select: {
            role: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        // Include linked goals
        linkedGoals: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
                status: true,
                progress: true,
              },
            },
          },
        },
        // Include count for efficient stats
        _count: {
          select: {
            projectMemberships: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Decrypt projects and add current user's role and permissions to each project
    const decryptedProjects = decryptProjectsArray(projects);
    const projectsWithUserRole = decryptedProjects.map(project => {
      const currentUserMembership = project.projectMemberships.find(
        membership => membership.userId === dbUser.id
      );
      
      // Decrypt linked goals
      const decryptedLinkedGoals = project.linkedGoals.map(linkedGoal => ({
        ...linkedGoal,
        goal: decryptGoalsArray([linkedGoal.goal])[0]
      }));
      
      return {
        ...project,
        linkedGoals: decryptedLinkedGoals,
        currentUserRole: currentUserMembership?.role,
        canDelete: currentUserMembership?.role === "CREATOR",
        canEdit: currentUserMembership?.role === "CREATOR" || currentUserMembership?.role === "ADMIN",
      };
    });

    return createApiResponse(projectsWithUserRole, { cachePolicy: 'SHORT' });
  });
}

export async function POST(request) {
  return withErrorHandling(async () => {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return createApiResponse({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return createApiResponse(
        { error: "User not found in the system" },
        { status: 404 }
      );
    }

    // Extract body and destructure goalData
    const body = await request.json();
    const { name, description, goal: goalData } = body;

    if (!name?.trim()) {
      return createApiResponse(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create project, membership, and optionally a goal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Encrypt project data and create the project
      const encryptedProjectData = encryptProjectData({
        name: name.trim(),
        description: description?.trim() || null,
      });
      
      const project = await tx.project.create({
        data: {
          name: encryptedProjectData.name,
          description: encryptedProjectData.description,
        },
      });

      // 2. Create membership for the creator in the project (as CREATOR)
      await tx.projectMembership.create({
        data: {
          projectId: project.id,
          userId: user.id,
          role: "CREATOR",
          status: "ACTIVE",
          invitedBy: user.id,
          joinedAt: new Date(),
        },
      });

      let newGoal = null;
      let newProjectGoalLink = null;
      let newGoalMembershipForOwner = null;

      // 3. Optionally: Create a goal and link it to the project
      if (goalData && goalData.title?.trim()) {
        // Validate Goal Data
        if (!goalData.type || !["COMPANY", "TEAM", "PERSONAL"].includes(goalData.type)) {
          throw new Error("Invalid or missing goal type");
        }
        if (!goalData.privacy || !["public", "private"].includes(goalData.privacy)) {
          throw new Error("Invalid or missing goal privacy");
        }
        if (goalData.startDate && isNaN(new Date(goalData.startDate).getTime())) {
          throw new Error("Invalid goal startDate format");
        }
        if (goalData.endDate && isNaN(new Date(goalData.endDate).getTime())) {
          throw new Error("Invalid goal endDate format");
        }

        // Encrypt goal data before storing
        const encryptedGoalData = encryptGoalData({
          title: goalData.title.trim(),
          description: goalData.description?.trim() || null
        });

        newGoal = await tx.goal.create({
          data: {
            title: encryptedGoalData.title,
            description: encryptedGoalData.description,
            privacy: goalData.privacy,
            type: goalData.type,
            startDate: goalData.startDate ? new Date(goalData.startDate) : null,
            endDate: goalData.endDate ? new Date(goalData.endDate) : null,
            ownerId: user.id, // Project creator is the goal owner
          },
        });

        // 4. Link the new goal with the new project via ProjectGoal
        newProjectGoalLink = await tx.projectGoal.create({
          data: {
            projectId: project.id,
            goalId: newGoal.id,
          },
        });

        // 5. Add the goal owner as a GoalMembership (EDITOR)
        newGoalMembershipForOwner = await tx.goalMembership.create({
          data: {
            goalId: newGoal.id,
            userId: user.id,
            role: "EDITOR", // Goal owner is typically an editor
          },
        });
      }

      // Return the created project and goal (if any) for UI use
      return { project, goal: newGoal };
    });

    return createApiResponse(result);
  });
}