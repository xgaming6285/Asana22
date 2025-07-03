// Admin Service for Super Admin functionality

const adminService = {
  // Dashboard
  async getDashboard() {
    const response = await fetch('/api/admin/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch admin dashboard');
    }
    return response.json();
  },

  // Users Management
  async getUsers(page = 1, limit = 50, search = '') {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response = await fetch(`/api/admin/users?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  async getUser(userId) {
    const response = await fetch(`/api/admin/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  async updateUser(userId, userData) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  },

  async deleteUser(userId) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  // Projects Management
  async getProjects(page = 1, limit = 50, search = '') {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response = await fetch(`/api/admin/projects?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async getProject(projectId) {
    const response = await fetch(`/api/admin/projects/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  async createProject(projectData) {
    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  async updateProject(projectId, projectData) {
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },

  async deleteProject(projectId) {
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },

  // Check if current user is super admin
  async checkSuperAdminStatus() {
    try {
      const response = await fetch('/api/admin/dashboard');
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // User project membership management
  async addUserToProject(userId, projectId, role = 'USER') {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ADD_TO_PROJECT',
        projectId,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add user to project');
    }

    return response.json();
  },

  async removeUserFromProject(userId, projectId) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'REMOVE_FROM_PROJECT',
        projectId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove user from project');
    }

    return response.json();
  },

  async changeUserRoleInProject(userId, projectId, role) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'CHANGE_ROLE',
        projectId,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change user role');
    }

    return response.json();
  },

  async moveUserToProject(userId, fromProjectId, toProjectId, role = null) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'MOVE_TO_PROJECT',
        fromProjectId,
        projectId: toProjectId,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to move user to project');
    }

    return response.json();
  }
};

export default adminService; 