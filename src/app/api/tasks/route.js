import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encryptTaskData, decryptTasksArray, decryptUserData } from "../../utils/encryption.js";
import { getUserIdFromToken } from "../../utils/auth.js";

const prisma = new PrismaClient();

// GET tasks with optional project filter
export async function GET(request) {
  // This part is from before the conflict, so it remains.
  // Note: 'searchParams' and 'projectId' here are in the outer scope.
  const { searchParams: outerSearchParams } = new URL(request.url);
  const outerProjectId = outerSearchParams.get("projectId");

  const whereClause = {}; // This 'whereClause' is prepared based on outerProjectId
  if (outerProjectId) {
    whereClause.projectId = parseInt(outerProjectId, 10);
    if (isNaN(whereClause.projectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where = {}; // This 'where' object is built using the inner 'projectId'
    if (projectId) {
      where.projectId = Number(projectId); // Uses Number() for conversion
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true, // email is included
            imageUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    // Decrypt tasks and user data before sending to client
    const decryptedTasks = decryptTasksArray(tasks).map(task => ({
      ...task,
      assignee: task.assignee ? decryptUserData(task.assignee) : null,
      createdBy: task.createdBy ? decryptUserData(task.createdBy) : null
    }));

    return NextResponse.json(decryptedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// CREATE a new task
export async function POST(request) {
  try {
    // Authentication check
    const userId = await getUserIdFromToken();

    const data = await request.json();

    // Validate required fields
    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Ensure projectId is provided and valid
    if (!data.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const projectId = Number(data.projectId);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "projectId must be a number" },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectMemberships: true
      }
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is a member of the project
    const isProjectMember = project.projectMemberships.some(
      (member) => member.userId === userId && member.status === "ACTIVE"
    );
    if (!isProjectMember) {
      return NextResponse.json({ error: "Forbidden: Not authorized to create tasks in this project" }, { status: 403 });
    }

    // Encrypt task data before storing
    const encryptedTaskData = encryptTaskData({
      title: data.title,
      description: data.description || ""
    });

    const newTaskData = {
      title: encryptedTaskData.title,
      description: encryptedTaskData.description,
      status: data.status || "todo",
      priority: data.priority || "medium",
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: projectId,
      createdById: userId, // Set the creator of the task
    };

    // Optional: Add assigneeId if provided
    if (data.assigneeId) {
      const assigneeId = Number(data.assigneeId);
      if (isNaN(assigneeId)) {
        return NextResponse.json(
          { error: "assigneeId must be a number" },
          { status: 400 }
        );
      }
      // Optional: Check if user (assignee) exists
      const assigneeExists = await prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (!assigneeExists) {
        return NextResponse.json(
          { error: "Assignee (User) not found" },
          { status: 404 }
        );
      }
      newTaskData.assigneeId = assigneeId;
    }

    console.log("Creating task with data:", newTaskData);

    const newTask = await prisma.task.create({
      data: newTaskData,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    // Decrypt task data and user data before sending response
    const decryptedTask = decryptTasksArray([newTask])[0];
    decryptedTask.assignee = decryptedTask.assignee ? decryptUserData(decryptedTask.assignee) : null;
    decryptedTask.createdBy = decryptedTask.createdBy ? decryptUserData(decryptedTask.createdBy) : null;

    return NextResponse.json(decryptedTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
