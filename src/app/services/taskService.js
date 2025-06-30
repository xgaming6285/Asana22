// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

// Get all tasks for a specific project
const getProjectTasks = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  const response = await fetch(`/api/tasks?projectId=${projectId}`);
  return handleResponse(response);
};

// Get a single task by ID
const getTaskById = async (taskId) => {
  const response = await fetch(`/api/tasks/${taskId}`);
  return handleResponse(response);
};

// Create a new task
const createTask = async (taskData) => {
  try {
    console.log("Creating task with data:", taskData);
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create task:", errorData);
      throw new Error(errorData.error || "Failed to create task");
    }

    return response.json();
  } catch (error) {
    console.error("Task creation error:", error);
    throw error;
  }
};

// Update an existing task
const updateTask = async (taskId, taskData) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

// Delete a task
const deleteTask = async (taskId) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return { success: true, message: "Task deleted successfully" };
  }
};

// Get project members (this could also be in a separate userService, but for now we'll keep it here)
const getProjectMembers = async (projectId) => {
  const response = await fetch(`/api/members?projectId=${projectId}`);
  return handleResponse(response);
};

const taskService = {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getProjectMembers,
};

export default taskService;
