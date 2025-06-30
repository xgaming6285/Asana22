// src/app/components/BoardColumns.js
"use client";

import React, { useEffect, useState } from "react";
import TaskCard from "./taskCard"; // Import the new TaskCard
import { ChartBarIcon, ClockIcon, CheckCircleIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useModal } from "../../../../context/ModalContext";
import taskService from "../../../../services/taskService";
import membershipService from "../../../../services/membershipService";

const columnTitles = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

const columnStyles = {
  todo: "border-blue-500",
  "in-progress": "border-yellow-500",
  done: "border-green-500",
};

const columnIcons = {
  todo: ClockIcon,
  "in-progress": PlayIcon,
  done: CheckCircleIcon,
};

const columnGradients = {
  todo: "from-blue-500/20 to-blue-600/10",
  "in-progress": "from-yellow-500/20 to-yellow-600/10",
  done: "from-green-500/20 to-green-600/10",
};

const columnAccents = {
  todo: "bg-blue-500/10 border-blue-500/30",
  "in-progress": "bg-yellow-500/10 border-yellow-500/30",
  done: "bg-green-500/10 border-green-500/30",
};

export default function BoardColumns({ projectId, projectMembers = [] }) {
  const { openModal } = useModal();
  const [tasksByStatus, setTasksByStatus] = useState({
    todo: [],
    "in-progress": [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const allTasks = await taskService.getProjectTasks(projectId);

      const categorizedTasks = {
        todo: [],
        "in-progress": [],
        done: [],
      };

      allTasks.forEach((task) => {
        const statusKey =
          task.status?.toLowerCase().replace(" ", "-") || "todo";
        if (categorizedTasks[statusKey]) {
          categorizedTasks[statusKey].push(task);
        } else {
          console.warn(`Unknown task status: ${task.status}`);
          categorizedTasks.todo.push(task); // Default to 'todo' if status is unknown
        }
      });
      setTasksByStatus(categorizedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(err.message || "Could not load tasks for the project.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user info and role
  const fetchCurrentUserInfo = async () => {
    try {
      const [userInfo, userRole] = await Promise.all([
        fetch('/api/auth/me').then(res => res.json()),
        membershipService.getCurrentUserRole(projectId)
      ]);
      
      if (userInfo && !userInfo.error) {
        setCurrentUser(userInfo);
      }
      setCurrentUserRole(userRole);
    } catch (error) {
      console.error("Failed to fetch current user info:", error);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("Project ID is missing.");
      return;
    }
    fetchTasks();
    fetchCurrentUserInfo();
  }, [projectId]);

  const handleTaskUpdated = async () => {
    await fetchTasks();
  };

  const handleTaskDeleted = async (taskId) => {
    // Optimistically remove the task from the UI
    setTasksByStatus((prev) => {
      const newTasksByStatus = { ...prev };
      Object.keys(newTasksByStatus).forEach((status) => {
        newTasksByStatus[status] = newTasksByStatus[status].filter(
          (task) => task.id !== taskId
        );
      });
      return newTasksByStatus;
    });
    // Optionally, you might want to call an API to delete the task from the backend here
    // and then refetch or handle errors. For now, it's optimistic.
  };

  const findAssignee = (assigneeId) => {
    if (!assigneeId || !projectMembers || projectMembers.length === 0)
      return null;
    // Adjust based on how member IDs are structured in projectMembers vs task.assigneeId
    return projectMembers.find(
      (member) => member.id === assigneeId || member.userId === assigneeId
    );
  };

  // Calculate progress statistics
  const totalTasks = Object.values(tasksByStatus).flat().length;
  const completedTasks = tasksByStatus.done.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="relative flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
            <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
          </div>
          <p className="text-gray-400 text-base mt-4 font-medium">Loading your board...</p>
          <div className="mt-3 w-32 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96 p-4">
        <div className="text-center p-8 bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-2xl max-w-md w-full">
          <div className="text-red-300 text-5xl mb-4 animate-bounce">⚠️</div>
          <h3 className="text-xl font-bold text-red-300 mb-3">
            Unable to Load Tasks
          </h3>
          <p className="text-red-400 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={fetchTasks}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full board-columns-container">
      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Modern Board Column Scrollbar Styling */
        .board-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .board-scroll-container::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.4);
          border-radius: 10px;
          margin: 4px;
        }
        
        /* Todo Column - Blue Theme */
        .board-scroll-todo::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .board-scroll-todo::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          transform: scaleX(1.5);
        }
        
        /* In Progress Column - Yellow Theme */
        .board-scroll-in-progress::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .board-scroll-in-progress::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          transform: scaleX(1.5);
        }
        
        /* Done Column - Green Theme */
        .board-scroll-done::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .board-scroll-done::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #34d399, #10b981);
          transform: scaleX(1.5);
        }
        
        /* Hide scrollbars on mobile */
        @media (max-width: 768px) {
          .board-scroll-container::-webkit-scrollbar {
            display: none;
          }
          
          .board-scroll-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Column hover effects */
        .board-column:hover {
          transform: translateY(-2px);
        }
        
        .board-column {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-200">Project Progress</h3>
          </div>
          <span className="text-sm font-bold text-purple-400">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{completedTasks} completed</span>
          <span>{totalTasks} total tasks</span>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:gap-4 xl:gap-6 h-full">
        {Object.entries(tasksByStatus).map(([status, list]) => {
          const IconComponent = columnIcons[status];
          
          return (
            <div
              key={status}
              className={`board-column w-full lg:flex-1 lg:min-w-0 bg-gradient-to-b ${columnGradients[status]} backdrop-blur-sm rounded-2xl shadow-xl border-t-4 ${columnStyles[status]} flex flex-col relative overflow-hidden`}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>

              {/* Column Header */}
              <div className="relative z-10 p-4 lg:p-5 border-b border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 lg:p-2 rounded-xl ${columnAccents[status]} border flex-shrink-0`}>
                      <IconComponent className="w-4 h-4 lg:w-5 lg:h-5 text-current" />
                    </div>
                    <h2 className="text-base lg:text-lg font-bold text-gray-100 truncate">
                      {columnTitles[status] || status.charAt(0).toUpperCase() + status.slice(1)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold bg-gray-700/50 text-gray-300 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full border border-gray-600/50">
                      {list.length}
                    </span>
                  </div>
                </div>
                
                {/* Column Progress Bar */}
                {totalTasks > 0 && (
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        status === 'todo' ? 'bg-blue-500' :
                        status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(list.length / totalTasks) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Column Content */}
              <div className="relative z-10 flex-1 p-4 lg:p-5 overflow-hidden">
                <div className={`h-full overflow-y-auto space-y-3 lg:space-y-4 pr-1 lg:pr-2 board-scroll-container board-scroll-${status}`}>
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 lg:py-12 text-center">
                      <div className="relative mb-4 lg:mb-6">
                        <div className="text-3xl lg:text-4xl opacity-50 animate-pulse">
                          {status === 'todo' ? '📝' : status === 'in-progress' ? '⚡' : '✅'}
                        </div>
                      </div>
                      <h4 className="text-xs lg:text-sm font-semibold text-gray-400 mb-2">
                        No tasks here yet
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xs px-2">
                        {status === 'todo' 
                          ? 'Create new tasks or drag them here to get started'
                          : status === 'in-progress'
                          ? 'Move tasks here when you start working on them'
                          : 'Completed tasks will appear here'
                        }
                      </p>
                    </div>
                  ) : (
                    list.map((task, index) => (
                      <div
                        key={task.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TaskCard
                          task={task}
                          assignee={findAssignee(task.assigneeId)}
                          onTaskUpdated={handleTaskUpdated}
                          onTaskDeleted={handleTaskDeleted}
                          currentUserRole={currentUserRole}
                          currentUserId={currentUser?.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add fade-in animation styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
