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
  }
};

export default adminService; 