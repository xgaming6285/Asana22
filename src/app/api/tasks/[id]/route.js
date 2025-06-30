import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Import Clerk auth
import { PrismaClient } from "@prisma/client";
import { encryptTaskData, decryptTaskData } from "../../../utils/encryption.js";

const prisma = new PrismaClient();

// Асинхронна функция за изчисляване и актуализиране на прогреса на цел
async function updateGoalProgress(goalId) {
  const goalWithProjects = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      linkedProjects: {
        include: {
          project: {
            include: {
              tasks: true,
            },
          },
        },
      },
    },
  });

  if (!goalWithProjects) {
    console.warn(`Goal with ID ${goalId} not found for progress update.`);
    return;
  }

  let totalTasksForGoal = 0;
  let completedTasksForGoal = 0;

  for (const projectGoal of goalWithProjects.linkedProjects) {
    const project = projectGoal.project;
    if (project && project.tasks) {
      for (const task of project.tasks) {
        totalTasksForGoal++;
        if (task.status === "done") { // Assuming "done" is the completed status
          completedTasksForGoal++;
        }
      }
    }
  }

  const newProgress = totalTasksForGoal > 0
    ? Math.round((completedTasksForGoal / totalTasksForGoal) * 100)
    : 0;

  let newStatus = goalWithProjects.status;
  if (newProgress === 100 && newStatus !== "completed") {
    newStatus = "completed";
  } else if (newProgress > 0 && newProgress < 100 && newStatus === "not_started") {
    newStatus = "in_progress";
  } else if (newProgress === 0 && newStatus !== "not_started" && newStatus !== "completed") {
    // Ако е 0% и не е била завършена, връщаме към "not_started"
    newStatus = "not_started";
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      progress: newProgress,
      status: newStatus,
    },
  });

  console.log(`Goal ${goalId} updated: progress=${newProgress}%, status=${newStatus}`);
}


// GET a specific task by ID
export async function GET(request, { params }) {
  const { id } = await params; // Fixed: await params
  try {
    // АУТЕНТИКАЦИЯ - ДОБАВЕНА
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: { // Включваме проекта, за да можем да проверим членство
          include: {
            projectMemberships: true
          }
        },
        assignee: true, // Може да се използва за проверка на права
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

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // АВТОРИЗАЦИЯ - ДОБАВЕНА: Проверка дали потребителят е член на проекта или assignee
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found in system" }, { status: 404 });
    }

    const isProjectMember = task.project?.projectMemberships.some(
      (member) => member.userId === user.id && member.status === "ACTIVE"
    );
    const isAssignee = task.assigneeId === user.id;

    if (!isProjectMember && !isAssignee) {
      return NextResponse.json({ error: "Forbidden: Not authorized to view this task" }, { status: 403 });
    }

    // Decrypt task data before sending response
    const decryptedTask = decryptTaskData(task);

    return NextResponse.json(decryptedTask);
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// UPDATE a specific task by ID
// Преименувано на PATCH за по-добра семантика
export async function PATCH(request, { params }) {
  return await updateTask(request, params);
}

// Also support PUT method for updates (same functionality as PATCH)
export async function PUT(request, { params }) {
  return await updateTask(request, params);
}

// Common update logic for both PATCH and PUT
async function updateTask(request, params) {
  const { id } = await params; // Fixed: await params
  try {
    // АУТЕНТИКАЦИЯ - ДОБАВЕНА
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    // Get the task before update to check permissions and original project
    const originalTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          include: {
            projectMemberships: true,
            linkedGoals: true, // Включваме свързаните цели на проекта
          },
        },
        assignee: true,
      },
    });

    if (!originalTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // АВТОРИЗАЦИЯ - ДОБАВЕНА: Проверка дали потребителят има право да актуализира
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found in system" }, { status: 404 });
    }

    const isProjectAdminOrCreator = originalTask.project?.projectMemberships.some(
      (member) => member.userId === user.id && (member.role === "ADMIN" || member.role === "CREATOR")
    );
    const isAssignee = originalTask.assigneeId === user.id;

    // Например: Само admin/creator на проекта или assignee може да актуализира задачата
    if (!isProjectAdminOrCreator && !isAssignee) {
      return NextResponse.json({ error: "Forbidden: Not authorized to update this task" }, { status: 403 });
    }

    // Попълване на updateData
    if (data.hasOwnProperty("title")) updateData.title = data.title;
    if (data.hasOwnProperty("description")) updateData.description = data.description;
    if (data.hasOwnProperty("status")) updateData.status = data.status;
    if (data.hasOwnProperty("priority")) updateData.priority = data.priority;

    // Валидация и форматиране на дати
    if (data.hasOwnProperty("startDate")) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.hasOwnProperty("dueDate")) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.hasOwnProperty("projectId")) {
      if (data.projectId === null || data.projectId === undefined) {
        // Ако projectId е задължително в Prisma schema, това ще предизвика грешка, освен ако не е Int?
        // updateData.projectId = null;
        return NextResponse.json({ error: "Project ID cannot be null/undefined for tasks" }, { status: 400 });
      } else {
        const projectExists = await prisma.project.findUnique({
          where: { id: data.projectId },
        });
        if (!projectExists) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          );
        }
        updateData.projectId = data.projectId;
      }
    }

    if (data.hasOwnProperty("assigneeId")) {
      if (data.assigneeId === null || data.assigneeId === undefined) {
        updateData.assigneeId = null; // Позволява unassigning
      } else {
        const assigneeExists = await prisma.user.findUnique({
          where: { id: data.assigneeId },
        });
        if (!assigneeExists) {
          return NextResponse.json(
            { error: "Assignee (User) not found" },
            { status: 404 }
          );
        }
        updateData.assigneeId = data.assigneeId;
      }
    }

    // Encrypt the sensitive fields if they are being updated
    if (updateData.title || updateData.description) {
      const encryptedData = encryptTaskData({
        title: updateData.title,
        description: updateData.description
      });
      if (updateData.title) updateData.title = encryptedData.title;
      if (updateData.description) updateData.description = encryptedData.description;
    }

    if (Object.keys(updateData).length === 0) {
      // Ако няма подадени полета за актуализация
      return NextResponse.json(originalTask); // Връщаме оригиналната задача
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // **КЛЮЧОВАТА ЧАСТ: Задействане на актуализацията на целите**
    // Проверяваме дали статусът на задачата е променен или дали проектът е сменен,
    // за да задействаме актуализация на целите.
    // Използваме originalTask, за да разберем старите връзки, ако projectId се променя.
    const projectIdsToCheck = new Set();
    if (originalTask.projectId) {
      projectIdsToCheck.add(originalTask.projectId); // Старият проект на задачата
    }
    if (updateData.projectId && updateData.projectId !== originalTask.projectId) {
      projectIdsToCheck.add(updateData.projectId); // Новият проект, ако е променен
    } else if (updateData.status && updateData.status !== originalTask.status) {
      // Ако само статусът се е променил, но projectId не, проверяваме текущия проект
      projectIdsToCheck.add(originalTask.projectId);
    }


    // Намираме всички цели, свързани с тези проекти
    const goalsToUpdate = new Set();
    for (const pId of Array.from(projectIdsToCheck)) {
      const project = await prisma.project.findUnique({
        where: { id: pId },
        include: { linkedGoals: true }
      });
      if (project && project.linkedGoals) {
        project.linkedGoals.forEach(pg => goalsToUpdate.add(pg.goalId));
      }
    }

    // Задействаме актуализацията за всяка уникална цел
    const updatePromises = Array.from(goalsToUpdate).map(goalId =>
      updateGoalProgress(goalId)
    );
    await Promise.all(updatePromises); // Изчакваме всички актуализации да приключат

    // Decrypt task data before sending response
    const decryptedTask = decryptTaskData(updatedTask);

    return NextResponse.json(decryptedTask);
  } catch (error) {
    console.error(
      `[API UPDATE /api/tasks/${id}] Error updating task:`,
      error.message
    );
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to update task", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE a specific task by ID
export async function DELETE(request, { params }) {
  const { id } = await params; // Fixed: await params
  try {
    // АУТЕНТИКАЦИЯ - ДОБАВЕНА
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Вземете задачата, за да проверите права и да получите projectId за актуализация на цели
    const taskToDelete = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          include: {
            projectMemberships: true,
            linkedGoals: true // Включваме свързаните цели на проекта
          }
        },
        assignee: true,
        createdBy: true
      }
    });

    if (!taskToDelete) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // АВТОРИЗАЦИЯ - ДОБАВЕНА: Проверка дали потребителят има право да изтрие
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found in system" }, { status: 404 });
    }

    const isProjectAdminOrCreator = taskToDelete.project?.projectMemberships.some(
      (member) => member.userId === user.id && (member.role === "ADMIN" || member.role === "CREATOR")
    );
    const isTaskCreator = taskToDelete.createdById === user.id;

    // Allow deletion if user is project admin/creator OR if user created the task
    if (!isProjectAdminOrCreator && !isTaskCreator) {
      return NextResponse.json({ error: "Forbidden: Not authorized to delete this task" }, { status: 403 });
    }

    // Изтриване на задачата
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });

    // **КЛЮЧОВАТА ЧАСТ: Задействане на актуализацията на целите след изтриване**
    if (taskToDelete.project && taskToDelete.project.linkedGoals.length > 0) {
      const goalIdsToUpdate = new Set();
      taskToDelete.project.linkedGoals.forEach(projectGoal => {
        goalIdsToUpdate.add(projectGoal.goalId);
      });

      const updatePromises = Array.from(goalIdsToUpdate).map(goalId =>
        updateGoalProgress(goalId)
      );
      await Promise.all(updatePromises);
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}