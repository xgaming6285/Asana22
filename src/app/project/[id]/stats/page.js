// Файл: src/app/project/[id]/stats/page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import projectService from "@/app/services/projectService";

// Увери се, че пътят до компонентите за графики е правилен
// Ако UpcomingTasksChart.js и TasksBySectionChart.js са в src/app/project/[id]/stats/components/
import UpcomingTasksChart from "./components/UpcomingTasksChart";
import TasksBySectionChart from "./components/TasksBySectionChart";
// Ако са в src/app/components/ (глобално)
// import UpcomingTasksChart from '@/app/components/UpcomingTasksChart';
// import TasksBySectionChart from '@/app/components/TasksBySectionChart';

// Enhanced StatCard Component with modern design
function StatCard({ title, value, subtitle, icon, color = "purple", trend, isLoading = false }) {
  const colorClasses = {
    purple: {
      gradient: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/30",
      icon: "text-purple-400",
      accent: "bg-purple-500/20",
      text: "text-purple-300"
    },
    green: {
      gradient: "from-green-500/20 to-green-600/10",
      border: "border-green-500/30",
      icon: "text-green-400",
      accent: "bg-green-500/20",
      text: "text-green-300"
    },
    red: {
      gradient: "from-red-500/20 to-red-600/10",
      border: "border-red-500/30",
      icon: "text-red-400",
      accent: "bg-red-500/20",
      text: "text-red-300"
    },
    blue: {
      gradient: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      accent: "bg-blue-500/20",
      text: "text-blue-300"
    },
    orange: {
      gradient: "from-orange-500/20 to-orange-600/10",
      border: "border-orange-500/30",
      icon: "text-orange-400",
      accent: "bg-orange-500/20",
      text: "text-orange-300"
    },
    indigo: {
      gradient: "from-indigo-500/20 to-indigo-600/10",
      border: "border-indigo-500/30",
      icon: "text-indigo-400",
      accent: "bg-indigo-500/20",
      text: "text-indigo-300"
    }
  };

  const currentColor = colorClasses[color];

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-2xl p-6 border animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-600 rounded w-24"></div>
          <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
        </div>
        <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className={`glass-morphism rounded-2xl border ${currentColor.border} hover-lift group cursor-pointer overflow-hidden animate-scale-in`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-1">
              {title}
            </h3>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${currentColor.accent} rounded-xl flex items-center justify-center ${currentColor.icon} text-xl transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-sm ${currentColor.text} font-medium`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Progress Summary with better visualization
function EnhancedProgressSummary({ cardStats, projectName }) {
  const completionRate = cardStats.totalTasks > 0 
    ? Math.round((cardStats.completedTasks / cardStats.totalTasks) * 100)
    : 0;

  const progressSegments = [
    { label: 'Completed', value: cardStats.completedTasks, color: 'bg-green-500', percentage: (cardStats.completedTasks / cardStats.totalTasks) * 100 },
    { label: 'In Progress', value: cardStats.incompleteTasks - cardStats.overdueTasks, color: 'bg-blue-500', percentage: ((cardStats.incompleteTasks - cardStats.overdueTasks) / cardStats.totalTasks) * 100 },
    { label: 'Overdue', value: cardStats.overdueTasks, color: 'bg-red-500', percentage: (cardStats.overdueTasks / cardStats.totalTasks) * 100 }
  ];

  return (
    <div className="glass-morphism rounded-2xl border border-gray-700/50 p-6 mb-8 animate-slide-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-white">Project Overview</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{completionRate}%</span>
              <span className="text-sm text-gray-400">complete</span>
            </div>
            
            <p className="text-gray-300">
              <span className="font-medium text-green-400">{cardStats.completedTasks}</span> of{' '}
              <span className="font-medium text-white">{cardStats.totalTasks}</span> tasks completed
            </p>

            {/* Progress segments bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                {progressSegments.map((segment, index) => (
                  segment.value > 0 && (
                    <div
                      key={index}
                      className={`${segment.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  )
                ))}
              </div>
            </div>

            {/* Progress legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              {progressSegments.map((segment, index) => (
                segment.value > 0 && (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${segment.color} rounded-full`}></div>
                    <span className="text-gray-300">{segment.label}: {segment.value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Circular progress indicator */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${completionRate * 2.83} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance metrics component
function PerformanceMetrics({ tasks }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTasks = tasks.filter(task => 
      task.updatedAt && new Date(task.updatedAt) >= oneWeekAgo
    );

    const completedThisWeek = tasks.filter(task => 
      task.status === 'done' && 
      task.updatedAt && 
      new Date(task.updatedAt) >= oneWeekAgo
    ).length;

    const averageCompletionTime = tasks
      .filter(task => task.status === 'done' && task.createdAt && task.updatedAt)
      .reduce((acc, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.updatedAt);
        const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / Math.max(tasks.filter(task => task.status === 'done').length, 1);

    const productivityScore = Math.min(100, Math.round(
      (completedThisWeek * 20) + 
      (Math.max(0, 10 - averageCompletionTime) * 5) +
      (Math.min(tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1) * 100, 50))
    ));

    return {
      recentActivity: recentTasks.length,
      completedThisWeek,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      productivityScore
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Recent Activity"
        value={metrics.recentActivity}
        subtitle="tasks updated this week"
        icon="🔥"
        color="orange"
      />
      <StatCard
        title="Weekly Progress"
        value={metrics.completedThisWeek}
        subtitle="tasks completed"
        icon="⚡"
        color="green"
      />
      <StatCard
        title="Avg. Completion"
        value={`${metrics.averageCompletionTime}d`}
        subtitle="average task duration"
        icon="⏱️"
        color="blue"
      />
      <StatCard
        title="Productivity Score"
        value={`${metrics.productivityScore}%`}
        subtitle="team efficiency"
        icon="📈"
        color="indigo"
      />
    </div>
  );
}

// Дефиниция на секциите/статусите и техните имена за показване
// Важно е 'id' да съвпада със статусите от базата данни (малки букви, както обсъдихме).
const taskSections = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function ProjectStatsPage() {
  const params = useParams();
  const projectId = params?.id;

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const [project, setProject] = useState(null);
  const [loadingProjectName, setLoadingProjectName] = useState(true);
  const [projectNameError, setProjectNameError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoadingTasks(false);
      setLoadingProjectName(false);
      setTasks([]);
      setProject(null);
      return;
    }

    setLoadingProjectName(true);
    setProjectNameError(null);
    projectService
      .getProjectById(projectId)
      .then((data) => {
        if (data) {
          setProject(data);
        } else {
          throw new Error("Project data not found or service returned null.");
        }
      })
      .catch((err) => {
        console.error("StatsPage (Client): Error fetching project name:", err);
        setProjectNameError(err.message);
        setProject(null);
      })
      .finally(() => {
        setLoadingProjectName(false);
      });

    const fetchTasksForStats = async () => {
      setLoadingTasks(true);
      setTasksError(null);
      const apiUrl = `/api/tasks?projectId=${projectId}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({
            error: `Request failed with status ${response.status}`,
          }));
          throw new Error(errData.error || `Failed to fetch tasks`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Data received for tasks is not an array");
        }
        setTasks(data);
      } catch (err) {
        console.error("StatsPage (Client): Error fetching tasks:", err);
        setTasksError(err.message);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasksForStats();
  }, [projectId]);

  const { cardStats, upcomingTasksChartData, tasksBySectionData } =
    useMemo(() => {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      now.setHours(0, 0, 0, 0);
      thirtyDaysFromNow.setHours(0, 0, 0, 0);

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (task) => task.status === "done"
      ).length;
      const incompleteTasks = totalTasks - completedTasks;
      const overdueTasks = tasks.filter((task) => {
        if (task.status !== "done" && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < now;
        }
        return false;
      }).length;
      const cardStats = {
        totalTasks,
        completedTasks,
        incompleteTasks,
        overdueTasks,
      };

      const upcomingTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
      });
      const upcomingCompleted = upcomingTasks.filter(
        (t) => t.status === "done"
      ).length;
      const upcomingIncomplete = upcomingTasks.length - upcomingCompleted;

      const localUpcomingTasksChartData = [];
      if (upcomingIncomplete > 0) {
        localUpcomingTasksChartData.push({
          name: "Incomplete",
          value: upcomingIncomplete,
        });
      }
      if (upcomingCompleted > 0) {
        localUpcomingTasksChartData.push({
          name: "Completed",
          value: upcomingCompleted,
        });
      }

      const sectionData = taskSections.map((section) => {
        const count = tasks.filter((task) => task.status === section.id).length;
        return {
          name: section.title,
          id: section.id,
          count: count,
        };
      });

      // Връщаме правилните имена на променливите
      return {
        cardStats,
        upcomingTasksChartData: localUpcomingTasksChartData,
        tasksBySectionData: sectionData,
      };
    }, [tasks]);

  const pageTitle = loadingProjectName
    ? "Loading Project Info..."
    : project?.name
    ? `${project.name}`
    : projectNameError
    ? "Error Loading Project Name"
    : "Project Statistics";

  if (loadingTasks || loadingProjectName) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mb-6"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
        <p className="text-gray-400 text-lg">Preparing your project insights...</p>
        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <div className="glass-morphism border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Unable to Load Data</h2>
          <p className="text-red-300 text-sm leading-relaxed">{tasksError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (projectNameError && !project) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <div className="glass-morphism border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-red-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-3">Project Not Found</h2>
          <p className="text-red-300 text-sm leading-relaxed">{projectNameError}</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <div className="text-gray-500 text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-3">Project ID Missing</h2>
        <p className="text-gray-400">Unable to load project statistics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Enhanced Header Section */}
        <header className="text-center lg:text-left animate-slide-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="curved-header text-4xl sm:text-5xl lg:text-6xl font-black">
                {pageTitle}
              </h1>
              <p className="curved-subtitle text-lg sm:text-xl">
                Project Analytics & Performance Dashboard
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-full border border-gray-700/50">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Live Data</span>
              </div>
              <div className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-full border border-gray-700/50">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Progress Summary */}
        <EnhancedProgressSummary cardStats={cardStats} projectName={project?.name} />

        {/* Performance Metrics */}
        <div className="animate-slide-in-up animate-delay-200">
          <PerformanceMetrics tasks={tasks} />
        </div>

        {/* Main Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-slide-in-up animate-delay-300">
          <StatCard 
            title="Total Tasks" 
            value={cardStats.totalTasks} 
            subtitle="across all sections"
            icon="📋"
            color="blue"
          />
          <StatCard 
            title="Completed" 
            value={cardStats.completedTasks} 
            subtitle={`${cardStats.totalTasks > 0 ? Math.round((cardStats.completedTasks / cardStats.totalTasks) * 100) : 0}% of total`}
            icon="✅"
            color="green"
          />
          <StatCard 
            title="In Progress" 
            value={cardStats.incompleteTasks - cardStats.overdueTasks} 
            subtitle="active tasks"
            icon="🔄"
            color="orange"
          />
          <StatCard 
            title="Overdue" 
            value={cardStats.overdueTasks} 
            subtitle="need attention"
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-in-up animate-delay-400">
          <div className="order-2 xl:order-1">
            <UpcomingTasksChart data={upcomingTasksChartData || []} />
          </div>
          <div className="order-1 xl:order-2">
            <TasksBySectionChart data={tasksBySectionData || []} />
          </div>
        </div>

        {/* Footer with additional info */}
        <footer className="text-center pt-8 border-t border-gray-800 animate-fade-in animate-delay-500">
          <p className="text-gray-500 text-sm">
            Dashboard automatically updates with real-time project data
          </p>
        </footer>
      </div>
    </div>
  );
}
