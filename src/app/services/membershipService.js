import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

// Get all project members
const getProjectMembers = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  const response = await fetch(`/api/members?projectId=${projectId}`);
  return handleResponse(response);
};

// Get current user's role in a project
const getCurrentUserRole = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  try {
    const members = await getProjectMembers(projectId);
    // Get current user info from auth
    const currentUserResponse = await fetch('/api/auth/me');
    if (!currentUserResponse.ok) {
      throw new Error("Failed to get current user");
    }
    const currentUser = await currentUserResponse.json();
    
    console.log("Debug - Current user:", currentUser);
    console.log("Debug - Members:", members);
    
    // Find current user in members list - match by id
    const userMembership = members.find(member => member.userId === currentUser.id);
    console.log("Debug - Found membership:", userMembership);
    
    return userMembership ? userMembership.role : null;
  } catch (error) {
    console.error("Error getting current user role:", error);
    return null;
  }
};

// Invite a member to a project
const inviteMember = async (projectId, email, role) => {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, email, role }),
  });
  return handleResponse(response);
};

const membershipService = {
  getProjectMembers,
  getCurrentUserRole,
  inviteMember,

  // Get a specific project member
  async getProjectMember(projectId, userId) {
    try {
      // Then find the membership using the internal ID
      return await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
          status: "ACTIVE",
        },
      });
    } catch (error) {
      console.error("Error in getProjectMember:", error);
      throw error;
    }
  },

  // Invite a user to a project
  async inviteUserToProject(projectId, { email, role, signalPhone, signalApiKey }) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const requestBody = {
        email,
        role: role || "USER",
      };

      // Add Signal data if provided
      if (signalPhone && signalApiKey) {
        requestBody.signalPhone = signalPhone;
        requestBody.signalApiKey = signalApiKey;
      }

      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error in inviteUserToProject:", error);
      throw error;
    }
  },

  // Accept a project invitation
  async acceptInvitation(inviteId) {
    try {
      const response = await fetch(`/api/invites/${inviteId}/accept`, {
        method: "POST",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error in acceptInvitation:", error);
      throw error;
    }
  },

  // Reject a project invitation
  async rejectInvitation(inviteId) {
    try {
      const response = await fetch(`/api/invites/${inviteId}/reject`, {
        method: "POST",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error in rejectInvitation:", error);
      throw error;
    }
  },

  // Update member role in project
  async updateMemberRole(projectId, userId, role) {
    try {
      const response = await fetch(`/api/members/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, role }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error in updateMemberRole:", error);
      throw error;
    }
  },

  // Remove member from project
  async removeMember(projectId, userId) {
    try {
      const response = await fetch(`/api/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error in removeMember:", error);
      throw error;
    }
  },

  // Get pending invitations for a project
  async getProjectInvitations(projectId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/invites`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error in getProjectInvitations:", error);
      throw error;
    }
  },

  // Get user's pending invitations
  async getUserInvitations() {
    try {
      const response = await fetch("/api/user/invites");
      return handleResponse(response);
    } catch (error) {
      console.error("Error in getUserInvitations:", error);
      throw error;
    }
  },
};

export default membershipService;
