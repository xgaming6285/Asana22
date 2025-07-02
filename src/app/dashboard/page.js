"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import LoadingSpinner, { SkeletonLoader } from "../components/LoadingSpinner";
import PendingInvitations from "../components/PendingInvitations";
import DashboardCustomizer from "../components/DashboardCustomizer";
import WelcomeTour from "../components/WelcomeTour";
import ClientOnly from "../components/ClientOnly";

// Lazy loaded components
const ProjectFormComponent = lazy(() => import("../components/ProjectForm"));

// Icons
const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const TaskIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const StatsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Enhanced Project Card Component
const ProjectCard = ({ project, viewMode = 'grid', onProjectDeleted }) => {
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await fetch(`/api/tasks?projectId=${project.id}`);
        if (response.ok) {
          const tasks = await response.json();
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.status === 'done').length;
          const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          setProjectStats({
            totalTasks,
            completedTasks,
            inProgressTasks,
            completionRate
          });
        }
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, [project.id]);

  const getStatusColor = (rate) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleDeleteProject = async () => {
    if (!project.canDelete) {
      alert('You do not have permission to delete this project.');
      return;
    }

    // Debug logging
    console.log('DELETE PROJECT FRONTEND DEBUG:');
    console.log('Project:', project);
    console.log('Project ID:', project.id);
    console.log('Can Delete:', project.canDelete);
    console.log('Current User Role:', project.currentUserRole);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone and will remove all tasks, files, and other project data.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to delete project');
      }

      // Call the callback to refresh the projects list
      if (onProjectDeleted) {
        onProjectDeleted(project.id);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(`Failed to delete project: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="relative bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/30 group overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FolderIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-gray-400 text-sm truncate mt-1">
                  {project.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>Updated {formatDate(project.updatedAt)}</span>
                {project.linkedGoals && project.linkedGoals.length > 0 && (
                  <span>• {project.linkedGoals.length} goals</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="flex space-x-4">
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : projectStats ? (
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-white font-medium">{projectStats.totalTasks}</div>
                  <div className="text-gray-400 text-xs">Tasks</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${getStatusColor(projectStats.completionRate)}`}>
                    {projectStats.completionRate}%
                  </div>
                  <div className="text-gray-400 text-xs">Complete</div>
                </div>
                <div className="w-20">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(projectStats.completionRate)}`}
                      style={{ width: `${projectStats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No data</div>
            )}
            
            <div className="flex space-x-2">
              <Link 
                href={`/project/${project.id}/overview`}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Open
              </Link>
              {project.canDelete && (
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  title="Delete Project"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <TrashIcon />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default) - More compact
  return (
    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:border-purple-500/30 group hover-lift overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FolderIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 text-truncate-2">
                {project.name}
              </h3>
            </div>
            {project.description && (
              <p className="text-gray-400 text-xs text-truncate-2 mb-2 group-hover:text-gray-300 transition-colors duration-300">
                {project.description}
              </p>
            )}
          </div>
        </div>

      {/* Project Statistics - More compact */}
      {loading ? (
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-1.5 bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : projectStats ? (
        <div className="space-y-3 mb-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className={`text-xs font-semibold ${getStatusColor(projectStats.completionRate)}`}>
                {projectStats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(projectStats.completionRate)}`}
                style={{ width: `${projectStats.completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-base font-bold text-white">{projectStats.totalTasks}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-base font-bold text-green-400">{projectStats.completedTasks}</div>
              <div className="text-xs text-gray-400">Done</div>
            </div>
            <div>
              <div className="text-base font-bold text-yellow-400">{projectStats.inProgressTasks}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 mb-3">
          <p className="text-gray-500 text-xs">No tasks yet</p>
        </div>
      )}

      {/* Goals Preview - More compact */}
      {project.linkedGoals && project.linkedGoals.length > 0 && (
        <div className="mb-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Goals</span>
            <span className="text-xs text-purple-400">{project.linkedGoals.length}</span>
          </div>
          <div className="space-y-1">
            {project.linkedGoals.slice(0, 1).map((linkedGoal) => (
              <div key={linkedGoal.goal.id} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-gray-300 truncate">{linkedGoal.goal.title}</span>
                <span className="text-xs text-teal-400">{linkedGoal.goal.progress}%</span>
              </div>
            ))}
            {project.linkedGoals.length > 1 && (
              <div className="text-xs text-gray-500">+{project.linkedGoals.length - 1} more</div>
            )}
          </div>
        </div>
      )}

      {/* Project Meta - More compact */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="truncate">{formatDate(project.updatedAt)}</span>
        <div className="flex items-center space-x-2">
          {project.projectMemberships && (
            <span className="flex items-center space-x-1">
              <UsersIcon className="w-3 h-3" />
              <span>{project.projectMemberships.length}</span>
            </span>
          )}
        </div>
      </div>

        {/* Quick Actions - More compact */}
        <div className="flex space-x-1.5">
          <Link 
            href={`/project/${project.id}/overview`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium py-2.5 px-3 rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Open
          </Link>
          <Link 
            href={`/project/${project.id}/board`}
            className="flex items-center justify-center bg-gray-700/50 hover:bg-purple-600 text-gray-300 hover:text-white p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-600/50 hover:border-purple-500/50"
            title="Board View"
          >
            <TaskIcon className="w-4 h-4" />
          </Link>
          <Link 
            href={`/project/${project.id}/stats`}
            className="flex items-center justify-center bg-gray-700/50 hover:bg-purple-600 text-gray-300 hover:text-white p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-600/50 hover:border-purple-500/50"
            title="Statistics"
          >
            <StatsIcon className="w-4 h-4" />
          </Link>
          {project.canDelete && (
            <button
              onClick={handleDeleteProject}
              disabled={deleting}
              className="flex items-center justify-center bg-red-600/50 hover:bg-red-600 disabled:bg-red-400/50 text-red-300 hover:text-white disabled:text-red-200 p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-600/50 hover:border-red-500/50 disabled:border-red-400/50 disabled:cursor-not-allowed"
              title="Delete Project"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TrashIcon />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Empty State - More compact
const EmptyState = ({ onCreateProjectClick }) => (
  <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
    {/* Background decorative elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-float-reverse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>
    
    <div className="relative z-10 text-center py-12 max-w-2xl mx-auto px-6">
      {/* Animated Icon */}
      <div className="relative mb-6 animate-slide-in-up">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
          <FolderIcon className="w-12 h-12" />
        </div>
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce animate-delay-500"></div>
        <div className="absolute top-6 -left-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animate-delay-1000"></div>
      </div>
      
      {/* Enhanced Typography */}
      <div className="space-y-4 animate-slide-in-up animate-delay-200">
        <h1 className="curved-header text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
          Welcome! Let&apos;s Build Something Great.
        </h1>
        <p className="curved-subtitle text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
          Start by creating your first project. Give it a name, add a description, and you&apos;ll be on your way to organizing your work like never before.
        </p>
      </div>
      
      {/* Enhanced CTA */}
      <div className="mt-8 animate-slide-in-up animate-delay-400">
        <button
          onClick={onCreateProjectClick}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shimmer-effect"
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-3">
            <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            <span className="text-lg">Create Your First Project</span>
          </div>
        </button>
        
        {/* Additional helpful text */}
        <p className="mt-4 text-gray-500 text-sm animate-fade-in animate-delay-600">
          It only takes a few seconds to get started
        </p>
      </div>
      
      {/* Feature highlights - More compact */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-in-up animate-delay-800">
        <div className="flex flex-col items-center space-y-2 p-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <TaskIcon className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-sm">Task Management</h3>
          <p className="text-gray-400 text-xs text-center">Organize and track tasks with powerful boards</p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 p-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-sm">Team Collaboration</h3>
          <p className="text-gray-400 text-xs text-center">Work together seamlessly with your team</p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 p-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <StatsIcon className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-sm">Progress Tracking</h3>
          <p className="text-gray-400 text-xs text-center">Monitor progress with detailed analytics</p>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Projects List Component
const ProjectsListComponent = ({ projects, viewMode, searchTerm, sortBy, onProjectDeleted }) => {
  const filteredAndSortedProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (filteredAndSortedProjects.length === 0 && searchTerm) {
    return (
      <div className="text-center py-8">
        <SearchIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects found</h3>
        <p className="text-gray-500">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6" 
      : "space-y-3"
    }>
      {filteredAndSortedProjects.map((project, index) => (
        <div 
          key={project.id}
          className="animate-slide-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProjectCard project={project} viewMode={viewMode} onProjectDeleted={onProjectDeleted} />
        </div>
      ))}
    </div>
  );
};

// New Quick Actions Component
const QuickActionsPanel = () => (
  <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 shadow-xl">
    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mr-2">
        ⚡
      </div>
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <Link href="/goals" className="flex items-center space-x-2 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          🎯
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white">Goals</span>
      </Link>
      <Link href="/dashboard" className="flex items-center space-x-2 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          📊
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white">Dashboard</span>
      </Link>
      <Link href="/pricing" className="flex items-center space-x-2 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          💎
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white">Upgrade</span>
      </Link>
      <button className="flex items-center space-x-2 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          ❤️
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white">Support</span>
      </button>
    </div>
  </div>
);

// New Recent Activity Component
const RecentActivityPanel = ({ projects }) => {
  const getRecentActivity = () => {
    const activities = [];
    projects.forEach(project => {
      activities.push({
        type: 'project_updated',
        project: project.name,
        time: project.updatedAt,
        icon: '📝'
      });
    });
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  };

  const formatTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      if (isNaN(now.getTime()) || isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Unknown';
    }
  };

  const activities = getRecentActivity();

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-2">
          🕒
        </div>
        Recent Activity
      </h3>
      <div className="space-y-2">
        {activities.length > 0 ? activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/20 rounded-lg">
            <div className="text-lg">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">
                <span className="text-white font-medium">{activity.project}</span> was updated
              </p>
              <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
            </div>
          </div>
        )) : (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

// New Tips & Insights Component
const TipsPanel = () => {
  const tips = [
    { icon: '💡', text: 'Use keyboard shortcuts: Ctrl+N for new project', color: 'from-yellow-500 to-orange-500' },
    { icon: '🎯', text: 'Set clear goals to track project success', color: 'from-teal-500 to-blue-500' },
    { icon: '👥', text: 'Invite team members to collaborate effectively', color: 'from-purple-500 to-pink-500' },
    { icon: '📊', text: 'Check project stats regularly for insights', color: 'from-green-500 to-emerald-500' },
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-2">
          💡
        </div>
        Pro Tips
      </h3>
      <div className="relative overflow-hidden rounded-lg bg-gray-700/20 p-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${tips[currentTip].color} rounded-lg flex items-center justify-center text-lg`}>
            {tips[currentTip].icon}
          </div>
          <p className="text-sm text-gray-300 flex-1">{tips[currentTip].text}</p>
        </div>
        <div className="flex space-x-1 mt-3">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentTip ? 'bg-purple-500 w-6' : 'bg-gray-600 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Collapsible Widget Component
const CollapsibleWidget = ({ title, icon, iconColor, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors duration-200 rounded-t-xl"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 bg-gradient-to-r ${iconColor} rounded-lg flex items-center justify-center text-sm`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

// Recent Activity Content Component
const RecentActivityContent = ({ projects }) => {
  const getRecentActivity = () => {
    const activities = [];
    projects.forEach(project => {
      activities.push({
        type: 'project_updated',
        project: project.name,
        time: project.updatedAt,
        icon: '📝'
      });
    });
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 3);
  };

  const formatTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      if (isNaN(now.getTime()) || isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Unknown';
    }
  };

  const activities = getRecentActivity();

  return (
    <div className="space-y-2">
      {activities.length > 0 ? activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/20 rounded-lg">
          <div className="text-lg">{activity.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate">
              <span className="text-white font-medium">{activity.project}</span> was updated
            </p>
            <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
          </div>
        </div>
      )) : (
        <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
      )}
    </div>
  );
};

// Pro Tips Content Component
const ProTipsContent = () => {
  const tips = [
    { icon: '💡', text: 'Use keyboard shortcuts: Ctrl+N for new project', color: 'from-yellow-500 to-orange-500' },
    { icon: '🎯', text: 'Set clear goals to track project success', color: 'from-teal-500 to-blue-500' },
    { icon: '👥', text: 'Invite team members to collaborate effectively', color: 'from-purple-500 to-pink-500' },
    { icon: '📊', text: 'Check project stats regularly for insights', color: 'from-green-500 to-emerald-500' },
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg bg-gray-700/20 p-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${tips[currentTip].color} rounded-lg flex items-center justify-center text-lg`}>
            {tips[currentTip].icon}
          </div>
          <p className="text-sm text-gray-300 flex-1">{tips[currentTip].text}</p>
        </div>
        <div className="flex space-x-1 mt-3">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentTip ? 'bg-purple-500 w-6' : 'bg-gray-600 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component (from dashboard)
const QuickActionCard = ({ title, description, icon, href, color = "purple" }) => {
  const colorClasses = {
    purple: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    blue: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700", 
    green: "from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700",
    orange: "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
  };

  return (
    <Link href={href}>
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4 hover:shadow-xl transition-all duration-300 hover:border-gray-600 group cursor-pointer">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white text-center py-2 rounded-lg font-medium transition-all duration-300`}>
          Go →
        </div>
      </div>
    </Link>
  );
};

// Overview Stats Component (from dashboard)
const OverviewStats = ({ projects }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    overallProgress: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      if (!projects || projects.length === 0) return;

      let totalTasks = 0;
      let completedTasks = 0;
      let activeProjects = 0;

      for (const project of projects) {
        try {
          const response = await fetch(`/api/tasks?projectId=${project.id}`);
          if (response.ok) {
            const tasks = await response.json();
            totalTasks += tasks.length;
            completedTasks += tasks.filter(task => task.status === 'done').length;
            if (tasks.some(task => task.status === 'in-progress')) {
              activeProjects++;
            }
          }
        } catch (error) {
          console.error('Error fetching project stats:', error);
        }
      }

      const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        activeProjects,
        overallProgress
      });
    };

    calculateStats();
  }, [projects]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
        <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
        <div className="text-purple-300 text-sm">Total Projects</div>
      </div>
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
        <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
        <div className="text-blue-300 text-sm">Total Tasks</div>
      </div>
      <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-4 border border-green-500/30">
        <div className="text-2xl font-bold text-white">{stats.completedTasks}</div>
        <div className="text-green-300 text-sm">Completed</div>
      </div>
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-500/30">
        <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
        <div className="text-orange-300 text-sm">Active Projects</div>
      </div>
      <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 rounded-xl p-4 border border-yellow-500/30">
        <div className="text-2xl font-bold text-white">{stats.overallProgress}%</div>
        <div className="text-yellow-300 text-sm">Overall Progress</div>
      </div>
    </div>
  );
};

// Enhanced Activity Feed Component
const ActivityFeed = ({ projects }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchActivities = async () => {
      try {
        const allActivities = [];
        
        // Fetch recent activities from all projects
        for (const project of projects || []) {
          try {
            const tasksResponse = await fetch(`/api/tasks?projectId=${project.id}`);
            if (tasksResponse.ok) {
              const tasks = await tasksResponse.json();
              
              // Add task-based activities
              tasks.forEach(task => {
                allActivities.push({
                  id: `task-${task.id}`,
                  type: 'task_update',
                  title: task.title,
                  project: project.name,
                  projectId: project.id,
                  status: task.status,
                  time: task.updatedAt,
                  icon: task.status === 'done' ? '✅' : task.status === 'in-progress' ? '🔄' : '📝',
                  priority: task.priority || 'medium'
                });
              });
            }
          } catch (error) {
            console.error(`Error fetching tasks for project ${project.id}:`, error);
          }
        }

        // Sort by most recent and take top 10
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 10);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projects && projects.length > 0) {
      fetchActivities();
    }
  }, [projects, mounted]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Activity Feed
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      // Ensure we have valid dates
      if (isNaN(now.getTime()) || isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      // Use a consistent date format
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Activity Feed
        </h3>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="group flex items-start space-x-3 p-3 bg-gray-700/20 hover:bg-gray-700/40 rounded-xl transition-all duration-200">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-sm">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    <span className="font-medium text-white">{activity.title}</span>
                    <span className="text-gray-500 mx-2">in</span>
                    <Link 
                      href={`/project/${activity.projectId}/overview`}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {activity.project}
                    </Link>
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
                    {activity.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'done' ? 'bg-green-500/20 text-green-400' :
                    activity.status === 'in-progress' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {activity.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activities will appear here as you work on tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Smart Notifications Component
const SmartNotifications = ({ projects, themeColors }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Default theme colors if not provided
  const defaultThemeColors = {
    primary: 'from-purple-500 to-pink-500',
    text: 'text-purple-300'
  };
  const currentTheme = themeColors || defaultThemeColors;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const generateNotifications = async () => {
      try {
        const allNotifications = [];
        const now = new Date();
        
        for (const project of projects || []) {
          try {
            const tasksResponse = await fetch(`/api/tasks?projectId=${project.id}`);
            if (tasksResponse.ok) {
              const tasks = await tasksResponse.json();
              
              // Check for overdue tasks
              const overdueTasks = tasks.filter(task => {
                if (task.status !== 'done' && task.dueDate) {
                  const dueDate = new Date(task.dueDate);
                  return dueDate < now;
                }
                return false;
              });

              if (overdueTasks.length > 0) {
                allNotifications.push({
                  id: `overdue-${project.id}`,
                  type: 'warning',
                  title: 'Overdue Tasks',
                  message: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} overdue in ${project.name}`,
                  project: project.name,
                  projectId: project.id,
                  priority: 'high',
                  icon: '⚠️',
                  action: 'View Tasks'
                });
              }

              // Check for tasks due soon (next 3 days)
              const soonDueTasks = tasks.filter(task => {
                if (task.status !== 'done' && task.dueDate) {
                  const dueDate = new Date(task.dueDate);
                  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                  return dueDate >= now && dueDate <= threeDaysFromNow;
                }
                return false;
              });

              if (soonDueTasks.length > 0) {
                allNotifications.push({
                  id: `due-soon-${project.id}`,
                  type: 'info',
                  title: 'Tasks Due Soon',
                  message: `${soonDueTasks.length} task${soonDueTasks.length > 1 ? 's' : ''} due within 3 days in ${project.name}`,
                  project: project.name,
                  projectId: project.id,
                  priority: 'medium',
                  icon: '📅',
                  action: 'Schedule'
                });
              }

              // Check for completed projects (100% completion)
              const completedTasks = tasks.filter(task => task.status === 'done').length;
              const totalTasks = tasks.length;
              if (totalTasks > 0 && completedTasks === totalTasks) {
                allNotifications.push({
                  id: `completed-${project.id}`,
                  type: 'success',
                  title: 'Project Completed! 🎉',
                  message: `All tasks completed in ${project.name}`,
                  project: project.name,
                  projectId: project.id,
                  priority: 'high',
                  icon: '🎉',
                  action: 'Celebrate'
                });
              }
            }
          } catch (error) {
            console.error(`Error checking notifications for project ${project.id}:`, error);
          }
        }

        setNotifications(allNotifications.slice(0, 5)); // Show top 5 notifications
      } catch (error) {
        console.error('Error generating notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projects && projects.length > 0) {
      generateNotifications();
    }
  }, [projects, mounted]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            Smart Alerts
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-700/20 rounded-xl animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          Smart Alerts
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          )}
        </h3>
        <button className={`text-sm ${currentTheme.text.replace('text-', 'text-')} hover:${currentTheme.text.replace('text-', 'text-').replace('300', '200')} transition-colors`}>
          Settings
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-700/20 rounded-xl animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${getNotificationStyle(notification.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{notification.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{notification.title}</h4>
                    <p className="text-sm opacity-90">{notification.message}</p>
                  </div>
                </div>
                <Link
                  href={`/project/${notification.projectId}/list`}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
                >
                  {notification.action}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-gray-400">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No notifications at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Task Creation Component
const QuickTaskCreation = ({ projects, themeColors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: ''
  });
  const [creating, setCreating] = useState(false);

  // Default theme colors if not provided
  const defaultThemeColors = {
    primary: 'from-purple-500 to-pink-500',
    primaryHover: 'from-purple-600 to-pink-600'
  };
  const currentTheme = themeColors || defaultThemeColors;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim() || !taskData.projectId) return;

    setCreating(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          status: 'todo'
        }),
      });

      if (response.ok) {
        setTaskData({
          title: '',
          description: '',
          projectId: '',
          priority: 'medium',
          dueDate: ''
        });
        setIsExpanded(false);
        // You might want to trigger a refresh of the dashboard here
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          Quick Add Task
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isExpanded ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}
        >
          {isExpanded ? '×' : '+'}
        </button>
      </div>

      {isExpanded ? (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Task title..."
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <textarea
              placeholder="Description (optional)..."
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 resize-none"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={taskData.projectId}
              onChange={(e) => setTaskData({...taskData, projectId: e.target.value})}
              className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              required
            >
              <option value="">Select Project</option>
              {projects?.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
              className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={creating || !taskData.title.trim() || !taskData.projectId}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-400">Click to add a new task quickly</p>
          <p className="text-sm text-gray-500 mt-1">No need to navigate to project pages</p>
        </div>
      )}
    </div>
  );
};

// Project Health Overview Component
const ProjectHealthOverview = ({ projects }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !projects || projects.length === 0) return;
    
    const calculateHealthData = async () => {
      try {
        let totalProjects = projects.length;
        let healthyProjects = 0;
        let atRiskProjects = 0;
        let criticalProjects = 0;

        for (const project of projects) {
          try {
            const response = await fetch(`/api/tasks?projectId=${project.id}`);
            if (response.ok) {
              const tasks = await response.json();
              const totalTasks = tasks.length;
              const completedTasks = tasks.filter(task => task.status === 'done').length;
              const overdueTasks = tasks.filter(task => {
                if (task.dueDate && task.status !== 'done') {
                  return new Date(task.dueDate) < new Date();
                }
                return false;
              }).length;

              const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
              const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

              if (completionRate >= 80 && overdueRate <= 10) {
                healthyProjects++;
              } else if (completionRate >= 50 && overdueRate <= 25) {
                atRiskProjects++;
              } else {
                criticalProjects++;
              }
            }
          } catch (error) {
            console.error('Error fetching project health:', error);
          }
        }

        setHealthData({
          totalProjects,
          healthyProjects,
          atRiskProjects,
          criticalProjects,
          healthScore: totalProjects > 0 ? Math.round((healthyProjects / totalProjects) * 100) : 0
        });
      } catch (error) {
        console.error('Error calculating health data:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateHealthData();
  }, [projects, mounted]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Project Health
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-xl animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading || !healthData) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Project Health
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-white">--</div>
            <div className="text-xs text-gray-400">Health Score</div>
          </div>
        </div>
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getHealthColor = (type) => {
    switch (type) {
      case 'healthy': return 'text-green-400';
      case 'at-risk': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (type) => {
    switch (type) {
      case 'healthy': return '●';
      case 'at-risk': return '●';
      case 'critical': return '●';
      default: return '●';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Project Health
        </h3>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{healthData.healthScore}%</div>
          <div className="text-xs text-gray-400">Health Score</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center space-x-3">
            <span className={`${getHealthColor('healthy')} text-lg`}>{getHealthIcon('healthy')}</span>
            <span className="text-white font-medium">Healthy Projects</span>
          </div>
          <span className="text-green-400 font-bold">{healthData.healthyProjects}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center space-x-3">
            <span className={`${getHealthColor('at-risk')} text-lg`}>{getHealthIcon('at-risk')}</span>
            <span className="text-white font-medium">At Risk</span>
          </div>
          <span className="text-yellow-400 font-bold">{healthData.atRiskProjects}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <div className="flex items-center space-x-3">
            <span className={`${getHealthColor('critical')} text-lg`}>{getHealthIcon('critical')}</span>
            <span className="text-white font-medium">Critical</span>
          </div>
          <span className="text-red-400 font-bold">{healthData.criticalProjects}</span>
        </div>
      </div>
    </div>
  );
};

// Upcoming Deadlines Component
const UpcomingDeadlines = ({ projects }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !projects || projects.length === 0) return;
    
    const fetchUpcomingDeadlines = async () => {
      try {
        let allDeadlines = [];

        for (const project of projects) {
          try {
            const response = await fetch(`/api/tasks?projectId=${project.id}`);
            if (response.ok) {
              const tasks = await response.json();
              const upcomingTasks = tasks
                .filter(task => task.dueDate && task.status !== 'done')
                .map(task => ({
                  ...task,
                  projectName: project.name,
                  projectId: project.id,
                  daysUntilDue: Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                }))
                .filter(task => task.daysUntilDue >= -7 && task.daysUntilDue <= 30) // Show overdue up to 7 days and upcoming up to 30 days
                .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

              allDeadlines = [...allDeadlines, ...upcomingTasks];
            }
          } catch (error) {
            console.error('Error fetching deadlines:', error);
          }
        }

        setDeadlines(allDeadlines.slice(0, 5)); // Show top 5 deadlines
      } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDeadlines();
  }, [projects, mounted]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Upcoming Deadlines
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-gray-700/20 rounded-xl animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-600 rounded w-32"></div>
                <div className="h-3 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-600 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getDaysUntilDueColor = (days) => {
    if (days < 0) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (days <= 3) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    if (days <= 7) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const formatDaysUntilDue = (days) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days}d left`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Upcoming Deadlines
        </h3>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-gray-700/20 rounded-xl animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-600 rounded w-32"></div>
                <div className="h-3 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-600 rounded w-24"></div>
            </div>
          ))
        ) : deadlines.length > 0 ? (
          deadlines.map((task, index) => (
            <div key={index} className={`p-3 rounded-xl border ${getDaysUntilDueColor(task.daysUntilDue)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm truncate flex-1 mr-2">{task.title}</h4>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
                  {formatDaysUntilDue(task.daysUntilDue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 truncate">{task.projectName}</span>
                {task.priority && (
                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
                         <p className="text-gray-400 text-sm">No upcoming deadlines!</p>
             <p className="text-gray-500 text-xs">You&apos;re all caught up</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Team Collaboration Hub Component


// Team Performance Metrics Component
const TeamPerformanceMetrics = ({ projects }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const calculateMetrics = async () => {
      try {
        let totalTasks = 0;
        let completedTasks = 0;
        let overdueTasks = 0;
        let tasksThisWeek = 0;
        let completedThisWeek = 0;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        for (const project of projects || []) {
          try {
            const tasksResponse = await fetch(`/api/tasks?projectId=${project.id}`);
            if (tasksResponse.ok) {
              const tasks = await tasksResponse.json();
              totalTasks += tasks.length;
              
              tasks.forEach(task => {
                if (task.status === 'done') completedTasks++;
                
                if (task.status !== 'done' && task.dueDate) {
                  const dueDate = new Date(task.dueDate);
                  if (dueDate < now) overdueTasks++;
                }

                const taskDate = new Date(task.createdAt);
                if (taskDate >= oneWeekAgo) {
                  tasksThisWeek++;
                  if (task.status === 'done') completedThisWeek++;
                }
              });
            }
          } catch (error) {
            console.error(`Error fetching tasks for project ${project.id}:`, error);
          }
        }

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const weeklyCompletionRate = tasksThisWeek > 0 ? Math.round((completedThisWeek / tasksThisWeek) * 100) : 0;
        const productivityScore = Math.min(100, Math.round(
          (completionRate * 0.4) + 
          (weeklyCompletionRate * 0.3) + 
          (Math.max(0, 100 - (overdueTasks / Math.max(totalTasks, 1)) * 100) * 0.3)
        ));

        setMetrics({
          totalTasks,
          completedTasks,
          completionRate,
          overdueTasks,
          tasksThisWeek,
          completedThisWeek,
          weeklyCompletionRate,
          productivityScore,
          activeProjects: projects?.length || 0
        });
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projects && projects.length > 0) {
      calculateMetrics();
    }
  }, [projects, mounted]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Performance Analytics
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">--</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Productivity Score</div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-700/20 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-600 rounded mb-3"></div>
              <div className="h-6 bg-gray-600 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`bg-gradient-to-r ${color} rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-300 mb-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Performance Analytics
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{metrics?.productivityScore || 0}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Productivity Score</div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-700/20 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-600 rounded mb-3"></div>
              <div className="h-6 bg-gray-600 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Tasks"
              value={metrics.totalTasks}
              subtitle="across all projects"
              icon="📋"
              color="from-blue-500/10 to-blue-600/10"
            />
            <MetricCard
              title="Completion Rate"
              value={`${metrics.completionRate}%`}
              subtitle={`${metrics.completedTasks} completed`}
              icon="✅"
              color="from-green-500/10 to-green-600/10"
            />
            <MetricCard
              title="Weekly Progress"
              value={`${metrics.weeklyCompletionRate}%`}
              subtitle={`${metrics.completedThisWeek}/${metrics.tasksThisWeek} this week`}
              icon="📈"
              color="from-purple-500/10 to-purple-600/10"
            />
            <MetricCard
              title="Overdue Tasks"
              value={metrics.overdueTasks}
              subtitle="need attention"
              icon="⚠️"
              color="from-red-500/10 to-red-600/10"
            />
          </div>

          {/* Progress visualization */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span>{metrics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${metrics.completionRate}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Weekly Performance</span>
                <span>{metrics.weeklyCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out"
                  style={{ width: `${metrics.weeklyCompletionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">No data available</p>
          <p className="text-sm text-gray-500 mt-1">Create some projects and tasks to see analytics</p>
        </div>
      )}
    </div>
  );
};

// Theme utility function
const getThemeColors = (theme = 'default') => {
  const themes = {
    default: {
      primary: 'from-purple-500 to-pink-500',
      primaryHover: 'from-purple-600 to-pink-600',
      primaryDark: 'from-purple-700 to-pink-700',
      accent: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-300',
      shadow: 'shadow-purple-500/25'
    },
    blue: {
      primary: 'from-blue-500 to-cyan-500',
      primaryHover: 'from-blue-600 to-cyan-600',
      primaryDark: 'from-blue-700 to-cyan-700',
      accent: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-300',
      shadow: 'shadow-blue-500/25'
    },
    green: {
      primary: 'from-green-500 to-teal-500',
      primaryHover: 'from-green-600 to-teal-600',
      primaryDark: 'from-green-700 to-teal-700',
      accent: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-300',
      shadow: 'shadow-green-500/25'
    },
    orange: {
      primary: 'from-orange-500 to-red-500',
      primaryHover: 'from-orange-600 to-red-600',
      primaryDark: 'from-orange-700 to-red-700',
      accent: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-300',
      shadow: 'shadow-orange-500/25'
    },
    indigo: {
      primary: 'from-indigo-500 to-purple-600',
      primaryHover: 'from-indigo-600 to-purple-700',
      primaryDark: 'from-indigo-700 to-purple-800',
      accent: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-300',
      shadow: 'shadow-indigo-500/25'
    }
  };
  
  return themes[theme] || themes.default;
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth(); // Replaced Clerk's useUser
  const [isFormVisible, setFormVisible] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", goal: {} });
  const [projectError, setProjectError] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [mounted, setMounted] = useState(false);
  const [dashboardPreferences, setDashboardPreferences] = useState({
    widgets: {
      overview: true,
      activity: true,
      notifications: true,
      quickTask: true,
      performance: true,
      quickActions: true
    },
    theme: 'default',
    compactMode: false
  });

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load dashboard preferences on mount (client-side only)
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('dashboardPreferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setDashboardPreferences(prev => ({ ...prev, ...prefs }));
        } catch (error) {
          console.error('Error loading dashboard preferences:', error);
        }
      }
    }
  }, [mounted]);

  const handleLayoutChange = (preferences) => {
    setDashboardPreferences(preferences);
  };

  const isWidgetEnabled = (widgetId) => {
    if (!dashboardPreferences?.widgets) return true;
    return dashboardPreferences.widgets[widgetId] !== false;
  };

  // Use our custom hook for data fetching
  const { data: fetchedProjects, error: projectsError, isLoading: loadingProjects } = useFetch(
    user ? '/api/projects' : null,
    {
      revalidateOnFocus: true,
      onError: (error) => {
        console.error("Error loading projects:", error);
        setProjectError(error.message || "Failed to load projects");
      }
    }
  );

  // Local state for projects to handle real-time updates
  const [projects, setProjects] = useState(null);

  // Update local projects state when fetchedProjects changes
  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects);
    }
  }, [fetchedProjects]);

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleCreateProject(e) {
    e.preventDefault();
    setCreatingProject(true);
    setProjectError("");

    try {
      const trimmedName = projectForm.name.trim();
      if (!trimmedName) {
        throw new Error("Project name is required");
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description: projectForm.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      router.push(`/project/${data.project.id}/overview`);
    } catch (error) {
      console.error("Project creation error:", error);
      setProjectError(error.message);
      setCreatingProject(false);
    }
  }

  const handleProjectDeleted = (deletedProjectId) => {
    // Remove the deleted project from the local state
    if (projects) {
      const updatedProjects = projects.filter(project => project.id !== deletedProjectId);
      setProjects(updatedProjects);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get current theme colors
  const themeColors = getThemeColors(dashboardPreferences?.theme);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Dynamic breathing background overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        {/* Multiple breathing brightness layers with theme colors for wave effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.primary}/8 animate-breathe`}></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}/6 animate-breathe-slow`}></div>
        <div className={`absolute inset-0 bg-gradient-to-tl ${themeColors.primary}/4 animate-breathe-fast`}></div>
        <div className={`absolute inset-0 bg-gradient-to-bl ${themeColors.primary}/5 animate-breathe-reverse`}></div>
        <div className={`absolute top-0 left-0 w-full h-full animate-breathe-slow`} style={{
          background: `radial-gradient(ellipse at center, ${themeColors.primary.includes('purple') ? 'rgba(168, 85, 247, 0.04)' : 
                                                              themeColors.primary.includes('blue') ? 'rgba(59, 130, 246, 0.04)' :
                                                              themeColors.primary.includes('green') ? 'rgba(16, 185, 129, 0.04)' :
                                                              themeColors.primary.includes('orange') ? 'rgba(249, 115, 22, 0.04)' :
                                                              themeColors.primary.includes('indigo') ? 'rgba(99, 102, 241, 0.04)' :
                                                              'rgba(168, 85, 247, 0.04)'} 0%, transparent 70%)`
        }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-3 max-w-7xl">
        {loadingProjects ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : (
          <>
            {!isFormVisible && projects?.length === 0 && (
              <EmptyState onCreateProjectClick={() => setFormVisible(true)} />
            )}

            {!isFormVisible && projects?.length > 0 && (
              <div className="space-y-3">
                {/* Enhanced Hero Header - Reduced spacing */}
                <div className="space-y-2 py-2">
                  {/* Welcome Message */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight animate-slide-in-up flex items-center gap-3">
                      <span className="curved-header">
                        Welcome back, {user?.firstName || 'there'}!
                      </span>
                      <span className="text-4xl animate-pulse-slow">👋</span>
                    </h1>
                    <div className="relative">
                      <p className="curved-subtitle text-base sm:text-lg lg:text-xl font-medium leading-relaxed animate-slide-in-up animate-delay-200">
                        Here&apos;s what&apos;s happening with your projects today
                      </p>
                      {/* Decorative underline */}
                      <div className={`absolute -bottom-1 left-0 w-20 h-0.5 bg-gradient-to-r ${themeColors.primary} rounded-full animate-scale-in animate-delay-500`}></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Dashboard Grid */}
                {projects && projects.length > 0 && (
                  <div className={`space-y-6 ${dashboardPreferences?.compactMode ? 'space-y-4' : ''}`}>
                    {/* Overview Stats Section */}
                    {isWidgetEnabled('overview') && (
                      <div className="animate-slide-in-up animate-delay-400">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
                          <button
                            onClick={() => setFormVisible(true)}
                            className={`group relative overflow-hidden glass-morphism bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 hover:${themeColors.border.replace('border-', 'border-')} text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:${themeColors.shadow} focus:outline-none focus:ring-2 focus:${themeColors.border.replace('border-', 'ring-')} flex items-center space-x-2 h-fit`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                            
                            <div className="relative flex items-center space-x-2">
                              <div className={`w-5 h-5 bg-gradient-to-r ${themeColors.primary} rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shadow-lg`}>
                                <PlusIcon className="w-3 h-3" />
                              </div>
                              <span className="text-sm relative z-10 font-medium">New Project</span>
                            </div>
                          </button>
                        </div>
                        <OverviewStats projects={projects} />
                      </div>
                    )}

                    {/* Smart Notifications and Quick Task Creation */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-slide-in-up animate-delay-450">
                      {isWidgetEnabled('notifications') && (
                        <SmartNotifications projects={projects} themeColors={themeColors} />
                      )}
                      {isWidgetEnabled('quickTask') && (
                        <QuickTaskCreation projects={projects} themeColors={themeColors} />
                      )}
                    </div>

                    {/* Team Performance Metrics */}
                    {isWidgetEnabled('performance') && (
                      <div className="animate-slide-in-up animate-delay-500">
                        <TeamPerformanceMetrics projects={projects} />
                      </div>
                    )}

                    {/* Activity Feed and Additional Widgets */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-in-up animate-delay-550">
                      {isWidgetEnabled('activity') && (
                        <div className="xl:col-span-2 space-y-6">
                          {/* Activity Feed */}
                          <ActivityFeed projects={projects} />
                          
                          {/* Additional Content Row */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Health Overview */}
                            <ProjectHealthOverview projects={projects} />
                            
                            {/* Upcoming Deadlines */}
                            <UpcomingDeadlines projects={projects} />
                          </div>
                          

                        </div>
                      )}
                      {isWidgetEnabled('quickActions') && (
                        <div className="space-y-6">
                          {/* Quick Actions Section */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <QuickActionCard
                                title="View Goals"
                                description="Track your objectives"
                                icon="🎯"
                                href="/goals"
                                color="blue"
                              />
                              <QuickActionCard
                                title="Team Calendar"
                                description="Schedule & deadlines"
                                icon="📅"
                                href="/calendar"
                                color="green"
                              />
                              <QuickActionCard
                                title="Pricing Plans"
                                description="Upgrade your account"
                                icon="💎"
                                href="/pricing"
                                color="orange"
                              />
                              <QuickActionCard
                                title="Test Signal"
                                description="Test functionality"
                                icon="🔧"
                                href="/test-signal"
                                color="purple"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Controls Section - More compact */}
                <div className="animate-slide-in-up animate-delay-500">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gradient-to-r from-gray-800/80 to-gray-800/60 backdrop-blur-sm p-3 rounded-2xl border border-gray-700/50 shadow-xl">
                    {/* Search with enhanced styling */}
                    <div className="relative flex-1 max-w-md group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className={`text-gray-400 group-focus-within:${themeColors.text.replace('text-', 'text-')} transition-colors duration-200`} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:${themeColors.border.replace('border-', 'ring-')}/50 focus:${themeColors.border}/50 focus:bg-gray-700 transition-all duration-200 backdrop-blur-sm text-sm`}
                      />
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${themeColors.primary}/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none`}></div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Enhanced Sort Dropdown */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="appearance-none bg-gray-700/50 border border-gray-600/50 rounded-xl px-3 py-2 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm cursor-pointer hover:bg-gray-700"
                        >
                          <option value="updatedAt_desc">Recent</option>
                          <option value="createdAt_asc">Created</option>
                          <option value="name">Name</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Enhanced View Mode Toggle */}
                      <div className="flex bg-gray-700/50 rounded-xl p-0.5 border border-gray-600/50 backdrop-blur-sm">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'grid' 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                          }`}
                          title="Grid View"
                        >
                          <GridIcon />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'list' 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                          }`}
                          title="List View"
                        >
                          <ListIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 animate-slide-in-up animate-delay-600">
                  {/* Projects List - Takes more space */}
                  <div className="xl:col-span-3">
                    <ProjectsListComponent 
                      projects={projects} 
                      viewMode={viewMode}
                      searchTerm={searchTerm}
                      sortBy={sortBy}
                      onProjectDeleted={handleProjectDeleted}
                    />
                  </div>

                  {/* Collapsible Sidebar Widgets */}
                  <div className="xl:col-span-1 space-y-3">
                    {/* Pending Invitations Widget */}
                    <div className="animate-slide-in-right animate-delay-700">
                      <CollapsibleWidget
                        title="Pending Invitations"
                        icon="📧"
                        iconColor="from-blue-500 to-cyan-500"
                        defaultExpanded={false}
                      >
                        <PendingInvitations />
                      </CollapsibleWidget>
                    </div>

                    {/* Quick Actions Widget */}
                    <div className="animate-slide-in-right animate-delay-750">
                      <CollapsibleWidget
                        title="Quick Actions"
                        icon="⚡"
                        iconColor="from-orange-500 to-yellow-500"
                        defaultExpanded={false}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/goals" className="flex flex-col items-center space-y-1 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              🎯
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-white">Goals</span>
                          </Link>
                          <Link href="/dashboard" className="flex flex-col items-center space-y-1 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              📊
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-white">Dashboard</span>
                          </Link>
                          <Link href="/pricing" className="flex flex-col items-center space-y-1 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              💎
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-white">Upgrade</span>
                          </Link>
                          <button className="flex flex-col items-center space-y-1 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              ❤️
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-white">Support</span>
                          </button>
                        </div>
                      </CollapsibleWidget>
                    </div>

                    {/* Recent Activity Widget */}
                    <div className="animate-slide-in-right animate-delay-800">
                      <CollapsibleWidget
                        title="Recent Activity"
                        icon="🕒"
                        iconColor="from-blue-500 to-cyan-500"
                        defaultExpanded={false}
                      >
                        <RecentActivityContent projects={projects} />
                      </CollapsibleWidget>
                    </div>

                    {/* Pro Tips Widget */}
                    <div className="animate-slide-in-right animate-delay-900">
                      <CollapsibleWidget
                        title="Pro Tips"
                        icon="💡"
                        iconColor="from-yellow-500 to-orange-500"
                        defaultExpanded={false}
                      >
                        <ProTipsContent />
                      </CollapsibleWidget>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isFormVisible && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">Create New Project</h1>
                  <button
                    onClick={() => {
                      setFormVisible(false);
                      setProjectForm({ name: "", description: "" });
                      setProjectError("");
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Suspense fallback={<LoadingSpinner className="my-8" />}>
                  <ProjectFormComponent
                    projectFormState={projectForm}
                    onFormChange={handleProjectFormChange}
                    onSubmit={handleCreateProject}
                    error={projectError}
                    isCreating={creatingProject}
                  />
                </Suspense>
              </div>
            )}
          </>
        )}

        {/* Dashboard Customizer */}
        <ClientOnly>
          <DashboardCustomizer 
            onLayoutChange={handleLayoutChange}
            currentLayout={dashboardPreferences}
          />
        </ClientOnly>

        {/* Welcome Tour for new users */}
        <ClientOnly>
          <WelcomeTour />
        </ClientOnly>
      </div>
    </div>
  );
}