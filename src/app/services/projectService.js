import { getFromCache, setInCache, invalidateCache, CACHE_DURATION } from '../utils/cache';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    // ПРОМЯНАТА Е ТУК: Първо търсим 'error.error', след това 'error.message'
    throw new Error(error.error || error.message || 'Something went wrong');
  }
  return response.json();
};

// Get all projects with caching
const getAllProjects = async () => {
  const cacheKey = 'all_projects';
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const response = await fetch('/api/projects', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  const data = await handleResponse(response);
  
  // Data is already decrypted in the API route
  setInCache(cacheKey, data, CACHE_DURATION.MEDIUM);
  return data;
};

// Get a single project by ID with caching
const getProjectById = async (id) => {
  const cacheKey = `project_${id}`;
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(`/api/projects/${id}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  const data = await handleResponse(response);
  
  // Data is already decrypted in the API route
  setInCache(cacheKey, data, CACHE_DURATION.MEDIUM);
  return data;
};

// Create a new project
const createProject = async (projectData) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  const data = await handleResponse(response);

  // Invalidate cache for projects list
  invalidateCache('all_projects');

  return data;
};

// Update an existing project
const updateProject = async (id, projectData) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  const data = await handleResponse(response);

  // Invalidate related caches
  invalidateCache(`project_${id}`);
  invalidateCache('all_projects');

  return data;
};

// Delete a project
const deleteProject = async (id) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  // For DELETE, we might not always get a JSON body back on success,
  // so we handle the response slightly differently.
  if (!response.ok) {
    const error = await response.json();
    // ПРОМЯНАТА Е И ТУК: За консистентност
    throw new Error(error.error || error.message || 'Something went wrong');
  }
  // Invalidate related caches
  invalidateCache(`project_${id}`);
  invalidateCache('all_projects');
  // If response.ok is true and there's no content, return a success indication.
  // If there is content, parse it as JSON.
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return { success: true, message: "Project deleted successfully" };
  }
};

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;