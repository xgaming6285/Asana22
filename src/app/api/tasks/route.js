import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
      },
    });
    return NextResponse.json(tasks);
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

    // Optional: Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const newTaskData = {
      title: data.title,
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: projectId,
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
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
