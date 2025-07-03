"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon,
  ArrowRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectAction, setProjectAction] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRole, setSelectedRole] = useState('USER');
  const [selectedFromProject, setSelectedFromProject] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    systemRole: 'USER'
  });

  useEffect(() => {
    // Check if user is super admin
    if (user && user.systemRole !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      loadUsers();
      loadProjects();
    }
  }, [user, router, currentPage, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(currentPage, 20, search);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await adminService.getProjects(1, 100); // Get all projects
      setProjects(data.projects);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ email: '', firstName: '', lastName: '', password: '', systemRole: 'USER' });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editingUser.id, editingUser);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUser(userId, { systemRole: newRole });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await adminService.getUser(userId);
      setViewingUser(userData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProjectAction = (action, userId) => {
    setProjectAction({ action, userId });
    setShowProjectModal(true);
    setSelectedProject('');
    setSelectedRole('USER');
    setSelectedFromProject('');
  };

  const handleProjectManagement = async (e) => {
    e.preventDefault();
    try {
      const { action, userId } = projectAction;
      
      switch (action) {
        case 'ADD_TO_PROJECT':
          await adminService.addUserToProject(userId, selectedProject, selectedRole);
          break;
        case 'REMOVE_FROM_PROJECT':
          await adminService.removeUserFromProject(userId, selectedProject);
          break;
        case 'CHANGE_ROLE':
          await adminService.changeUserRoleInProject(userId, selectedProject, selectedRole);
          break;
        case 'MOVE_TO_PROJECT':
          await adminService.moveUserToProject(userId, selectedFromProject, selectedProject, selectedRole);
          break;
      }
      
      setShowProjectModal(false);
      setProjectAction(null);
      loadUsers();
      if (viewingUser && viewingUser.id === userId) {
        handleViewUser(userId); // Refresh user details
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  if (user.systemRole !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-gray-400">Manage all users in the system</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-300 hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.systemRole === 'SUPER_ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <ShieldCheckIcon className="w-3 h-3" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user._count?.projectMemberships || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-green-400 hover:text-green-300"
                            title="View User Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit User"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProjectAction('ADD_TO_PROJECT', user.id)}
                            className="text-purple-400 hover:text-purple-300"
                            title="Add to Project"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProjectAction('REMOVE_FROM_PROJECT', user.id)}
                            className="text-orange-400 hover:text-orange-300"
                            title="Remove from Project"
                          >
                            <UserMinusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProjectAction('MOVE_TO_PROJECT', user.id)}
                            className="text-cyan-400 hover:text-cyan-300"
                            title="Move to Project"
                          >
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                          {user.id !== user.id && ( // Don't allow deleting self
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete User"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Showing {users.length} users
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={newUser.systemRole}
                    onChange={(e) => setNewUser({...newUser, systemRole: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={editingUser.systemRole}
                    onChange={(e) => setEditingUser({...editingUser, systemRole: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {viewingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                  User Details: {viewingUser.firstName} {viewingUser.lastName}
                </h3>
                <button
                  onClick={() => setViewingUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-white">User Information</h4>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{viewingUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Name</label>
                      <p className="text-white">{viewingUser.firstName} {viewingUser.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">System Role</label>
                      <p className="text-white">
                        {viewingUser.systemRole === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Created</label>
                      <p className="text-white">{new Date(viewingUser.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Project Memberships */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium text-white">Project Memberships</h4>
                    <button
                      onClick={() => handleProjectAction('ADD_TO_PROJECT', viewingUser.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Add to Project
                    </button>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    {viewingUser.projectMemberships && viewingUser.projectMemberships.length > 0 ? (
                      <div className="space-y-3">
                        {viewingUser.projectMemberships.map((membership) => (
                          <div key={membership.id} className="flex justify-between items-center bg-gray-600 rounded-lg p-3">
                            <div>
                              <p className="text-white font-medium">{getProjectName(membership.projectId)}</p>
                              <p className="text-sm text-gray-400">
                                Role: {membership.role} | Status: {membership.status}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setProjectAction({ action: 'CHANGE_ROLE', userId: viewingUser.id });
                                  setSelectedProject(membership.projectId);
                                  setSelectedRole(membership.role);
                                  setShowProjectModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300"
                                title="Change Role"
                              >
                                <Cog6ToothIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setProjectAction({ action: 'REMOVE_FROM_PROJECT', userId: viewingUser.id });
                                  setSelectedProject(membership.projectId);
                                  setShowProjectModal(true);
                                }}
                                className="text-red-400 hover:text-red-300"
                                title="Remove from Project"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No project memberships</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Management Modal */}
        {showProjectModal && projectAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">
                {projectAction.action === 'ADD_TO_PROJECT' && 'Add User to Project'}
                {projectAction.action === 'REMOVE_FROM_PROJECT' && 'Remove User from Project'}
                {projectAction.action === 'CHANGE_ROLE' && 'Change User Role'}
                {projectAction.action === 'MOVE_TO_PROJECT' && 'Move User to Project'}
              </h3>
              
              <form onSubmit={handleProjectManagement} className="space-y-4">
                {projectAction.action === 'MOVE_TO_PROJECT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      From Project
                    </label>
                    <select
                      required
                      value={selectedFromProject}
                      onChange={(e) => setSelectedFromProject(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select project to move from</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(projectAction.action === 'ADD_TO_PROJECT' || projectAction.action === 'REMOVE_FROM_PROJECT' || projectAction.action === 'CHANGE_ROLE' || projectAction.action === 'MOVE_TO_PROJECT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {projectAction.action === 'MOVE_TO_PROJECT' ? 'To Project' : 'Project'}
                    </label>
                    <select
                      required
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(projectAction.action === 'ADD_TO_PROJECT' || projectAction.action === 'CHANGE_ROLE' || projectAction.action === 'MOVE_TO_PROJECT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="CREATOR">Creator</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectModal(false);
                      setProjectAction(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-white ${
                      projectAction.action === 'REMOVE_FROM_PROJECT' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {projectAction.action === 'ADD_TO_PROJECT' && 'Add to Project'}
                    {projectAction.action === 'REMOVE_FROM_PROJECT' && 'Remove from Project'}
                    {projectAction.action === 'CHANGE_ROLE' && 'Change Role'}
                    {projectAction.action === 'MOVE_TO_PROJECT' && 'Move User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 