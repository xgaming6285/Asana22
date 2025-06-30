"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import projectService from "@/app/services/projectService";
import { useModal } from "../../../context/ModalContext";
import { useTaskModal } from "@/app/context/TaskModalContext";
import { Button } from "@/app/components/MaterialTailwind";
import membershipService from "@/app/services/membershipService";
import {
  PlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ChevronRightIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import InviteMemberModal from "@/app/components/InviteMemberModal";

// Quick Stats Card Component
const QuickStatsCard = ({ title, value, subtitle, icon, color = "purple", trend = null }) => {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600 bg-purple-500/10 border-purple-500/20 text-purple-300",
    green: "from-green-500 to-green-600 bg-green-500/10 border-green-500/20 text-green-300",
    blue: "from-blue-500 to-blue-600 bg-blue-500/10 border-blue-500/20 text-blue-300",
    orange: "from-orange-500 to-orange-600 bg-orange-500/10 border-orange-500/20 text-orange-300",
    red: "from-red-500 to-red-600 bg-red-500/10 border-red-500/20 text-red-300",
    teal: "from-teal-500 to-teal-600 bg-teal-500/10 border-teal-500/20 text-teal-300",
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]} ${colorClasses[color].split(' ')[3]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className="text-purple-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{progress}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity Item Component
const ActivityItem = ({ type, title, user, timestamp, status }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_created':
        return <PlusIcon className="h-4 w-4 text-blue-400" />;
      case 'task_completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'member_joined':
        return <UserGroupIcon className="h-4 w-4 text-purple-400" />;
      case 'goal_updated':
        return <TrophyIcon className="h-4 w-4 text-teal-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_created':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'task_completed':
        return 'border-green-500/20 bg-green-500/5';
      case 'member_joined':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'goal_updated':
        return 'border-teal-500/20 bg-teal-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(type)}`}>
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 font-medium">{title}</p>
        {user && <p className="text-xs text-gray-400">by {user}</p>}
        <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
      </div>
      {status && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'completed' ? 'bg-green-500/20 text-green-300' :
          status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {status}
        </span>
      )}
    </div>
  );
};

// Main Component
const ProjectOverviewPage = () => {
  const params = useParams();
  const { id: projectId } = params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Goals state
  const [goals, setGoals] = useState(null);
  const [goalFetchError, setGoalFetchError] = useState("");
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });

  const { openModal } = useModal();
  const { openTaskModal } = useTaskModal();

  // Fetch Goals
  const fetchGoals = useCallback(async (currentProjectId) => {
    try {
      const res = await fetch(`/api/goals?projectId=${currentProjectId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setGoals(null);
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load goals");
      }

      setGoals(data[0] || null);
      setGoalFetchError("");
    } catch (e) {
      setGoalFetchError(e.message || "Failed to load goals");
      setGoals(null);
    }
  }, []);

  // Fetch Tasks
  const fetchTasks = async (currentProjectId) => {
    setTasksLoading(true);
    try {
      const response = await fetch(`/api/tasks?projectId=${currentProjectId}`);
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch Project Members
  const fetchProjectMembers = async (currentProjectId) => {
    setMembersLoading(true);
    try {
      const members = await membershipService.getProjectMembers(currentProjectId);
      setProjectMembers(members);
    } catch (e) {
      console.error("Failed to load project members:", e);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const projectData = await projectService.getProjectById(projectId);
          setProject(projectData);
          await Promise.all([
            fetchGoals(projectId),
            fetchProjectMembers(projectId),
            fetchTasks(projectId)
          ]);
          setError(null);
        } catch (err) {
          setError(err.message);
          setProject(null);
          setGoals(null);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId, fetchGoals]);

  // Calculate project statistics
  const projectStats = React.useMemo(() => {
    if (!tasks.length) return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0, completionRate: 0, overdueTasks: 0 };
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      if (task.status !== 'done' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      }
      return false;
    }).length;

    return { totalTasks, completedTasks, inProgressTasks, todoTasks, completionRate, overdueTasks };
  }, [tasks]);

  // Generate recent activity (mock data for now)
  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    // Add recent tasks
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 3);
    
    recentTasks.forEach(task => {
      activities.push({
        type: task.status === 'done' ? 'task_completed' : 'task_created',
        title: task.title,
        user: task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName || 'Unknown',
        timestamp: new Date(task.updatedAt || task.createdAt).toLocaleDateString(),
        status: task.status
      });
    });

    // Add recent members
    const recentMembers = projectMembers
      .sort((a, b) => new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0))
      .slice(0, 2);
    
    recentMembers.forEach(member => {
      activities.push({
        type: 'member_joined',
        title: `${member.firstName} ${member.lastName} joined the project`,
        timestamp: new Date(member.joinedAt || Date.now()).toLocaleDateString(),
      });
    });

    return activities.slice(0, 5);
  }, [tasks, projectMembers]);

  const handleOpenInviteModal = () => {
    openModal({ type: "invite", projectId });
  };

  const handleOpenCreateTaskModal = () => {
    openTaskModal({
      projectId,
      projectMembers: Array.isArray(projectMembers) ? projectMembers : [],
      onTaskUpdated: () => {
        fetchGoals(projectId);
        fetchTasks(projectId);
      },
    });
  };

  const handleCreateGoal = async () => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newGoal.title,
          description: newGoal.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create goal");
      }

      await fetchGoals(projectId);
      setIsCreatingGoal(false);
      setNewGoal({ title: "", description: "" });
    } catch (error) {
      setGoalFetchError(error.message);
    }
  };

  const handleUpdateGoalStatus = async (goalId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "not_started"
          ? "in_progress"
          : currentStatus === "in_progress"
            ? "completed"
            : "not_started";

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal status");
      }

      await fetchGoals(projectId);
    } catch (error) {
      setGoalFetchError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-300">Loading project overview...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we gather your project data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 p-6">
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-100 mb-2">Error Loading Project</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-2xl text-gray-400">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <header className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                    {project.name || "Project Overview"}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-400">
                      {projectMembers.length} member{projectMembers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              {project.description && (
                <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleOpenCreateTaskModal}
                variant="gradient"
                color="purple"
                className="px-6 py-3 text-base font-semibold shadow-lg transition duration-150 ease-in-out flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Create Task
              </Button>
              <Button
                onClick={handleOpenInviteModal}
                variant="outlined"
                color="purple"
                className="px-6 py-3 text-base font-semibold flex items-center gap-2"
              >
                <UserGroupIcon className="h-5 w-5" />
                Invite Member
              </Button>
            </div>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStatsCard
            title="Total Tasks"
            value={projectStats.totalTasks}
            subtitle="All project tasks"
            icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
            color="blue"
          />
          <QuickStatsCard
            title="Completed"
            value={projectStats.completedTasks}
            subtitle={`${projectStats.completionRate}% complete`}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="green"
          />
          <QuickStatsCard
            title="In Progress"
            value={projectStats.inProgressTasks}
            subtitle="Active tasks"
            icon={<PlayIcon className="h-6 w-6" />}
            color="orange"
          />
          <QuickStatsCard
            title="Overdue"
            value={projectStats.overdueTasks}
            subtitle="Need attention"
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
            color="red"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Progress & Goals */}
          <div className="xl:col-span-2 space-y-8">
            {/* Project Progress Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <ChartBarIcon className="h-7 w-7 text-purple-400" />
                  Project Progress
                </h2>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                  <ProgressRing progress={projectStats.completionRate} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Completed</span>
                    </div>
                    <span className="text-white font-semibold">{projectStats.completedTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-300">In Progress</span>
                    </div>
                    <span className="text-white font-semibold">{projectStats.inProgressTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">To Do</span>
                    </div>
                    <span className="text-white font-semibold">{projectStats.todoTasks}</span>
                  </div>
                  
                  {projectStats.overdueTasks > 0 && (
                    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-300">Overdue</span>
                      </div>
                      <span className="text-red-400 font-semibold">{projectStats.overdueTasks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <TrophyIcon className="h-7 w-7 text-teal-400" />
                  Project Goals
                </h2>
                {!goals && !isCreatingGoal && (
                  <Button
                    onClick={() => setIsCreatingGoal(true)}
                    variant="gradient"
                    color="teal"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" /> Set Goals
                  </Button>
                )}
              </div>

              {goalFetchError && !goals && (
                <div className="mb-6 text-red-400 bg-red-900/20 border border-red-500/20 p-4 rounded-lg text-sm font-medium">
                  {goalFetchError}
                </div>
              )}

              {!goals && !isCreatingGoal ? (
                <div className="text-center py-12">
                  <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-xl text-gray-400 mb-2">No goals set yet</p>
                  <p className="text-gray-500 mb-6">Define clear objectives to track your project's success</p>
                  <Button
                    onClick={() => setIsCreatingGoal(true)}
                    variant="gradient"
                    color="teal"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Create Your First Goal
                  </Button>
                </div>
              ) : isCreatingGoal ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter goal title..."
                        className="w-full bg-gray-600/50 text-white rounded-lg p-4 border border-gray-500/50 focus:border-teal-400 focus:outline-none transition-colors"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                      <textarea
                        placeholder="Describe your goal in detail..."
                        className="w-full bg-gray-600/50 text-white rounded-lg p-4 border border-gray-500/50 focus:border-teal-400 focus:outline-none transition-colors min-h-[120px] resize-none"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="text"
                        color="gray"
                        onClick={() => {
                          setIsCreatingGoal(false);
                          setNewGoal({ title: "", description: "" });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="gradient"
                        color="teal"
                        onClick={handleCreateGoal}
                        disabled={!newGoal.title.trim()}
                        className="flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Save Goal
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                goals && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg border border-teal-500/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{goals.title}</h3>
                          {goals.description && (
                            <p className="text-gray-300 text-sm leading-relaxed">{goals.description}</p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${
                            goals.status === "completed"
                              ? "bg-green-700/20 border-green-500/50 text-green-300"
                              : goals.status === "in_progress"
                                ? "bg-yellow-700/20 border-yellow-500/50 text-yellow-300"
                                : "bg-gray-600/20 border-gray-500/50 text-gray-300"
                          }`}
                        >
                          {goals.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{goals.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${goals.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            variant="gradient"
                            color="teal"
                            size="sm"
                            onClick={() => handleUpdateGoalStatus(goals.id, goals.status)}
                            className="flex items-center gap-2"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Column - Team & Activity */}
          <div className="space-y-8">
            {/* Team Members Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserGroupIcon className="h-6 w-6 text-purple-400" />
                  Team Members
                </h2>
                <Button
                  onClick={handleOpenInviteModal}
                  variant="text"
                  color="purple"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Invite
                </Button>
              </div>

              {membersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-200 text-sm">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300"
                            : member.role === "CREATOR"
                              ? "bg-teal-500/20 text-teal-300"
                              : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))}

                  {projectMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <UserGroupIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm mb-2">No team members yet</p>
                      <p className="text-xs">Invite people to collaborate</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClockIcon className="h-6 w-6 text-orange-400" />
                  Recent Activity
                </h2>
                <div className="text-xs text-gray-500">
                  Last 7 days
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FireIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2">No recent activity</p>
                    <p className="text-xs">Project activity will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewPage;