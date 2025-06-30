"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation"; // For accessing route parameters
import TimelineView from "@/app/components/TimelineView"; // Adjust path if necessary
import taskService from "@/app/services/taskService"; // Adjust path if necessary
import membershipService from "@/app/services/membershipService"; // Import membershipService
import { useTaskModal } from "@/app/context/TaskModalContext"; // Adjust path if necessary

export default function ProjectTimelinePage() {
  const params = useParams();
  const projectId = params.id;

  const [originalTasks, setOriginalTasks] = useState([]); // Renamed from tasks
  const [displayTasks, setDisplayTasks] = useState([]); // For tasks shown in TimelineView, reflects drag-and-drop changes
  const [changedTaskIds, setChangedTaskIds] = useState(new Set()); // IDs of tasks with date changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // For loading state of save button
  const [timelineViewKey, setTimelineViewKey] = useState(1); // Key for resetting TimelineView

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    searchText: '',
    showOverdue: false,
    dateRange: 'all' // all, thisWeek, thisMonth, nextMonth
  });
  const [showFilters, setShowFilters] = useState(false);

  const { openTaskModal } = useTaskModal();

  const fetchTasksAndMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedMembers] = await Promise.all([
        taskService.getProjectTasks(projectId),
        membershipService.getProjectMembers(projectId),
      ]);

      const tasksWithDateObjects = (fetchedTasks || []).map((task) => ({
        ...task,
        startDate: task.startDate ? new Date(task.startDate) : null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      }));

      setOriginalTasks(tasksWithDateObjects);
      setDisplayTasks(tasksWithDateObjects);
      setChangedTaskIds(new Set());
      setTimelineViewKey((prevKey) => prevKey + 1);

      const membersDetails = fetchedMembers
        ? fetchedMembers
            .map((membership) => membership.user)
            .filter((user) => user != null) // Filter out null/undefined users
        : [];
      setProjectMembers(membersDetails || []);
    } catch (err) {
      console.error("Failed to fetch project data:", err);
      setError(err.message || "Failed to load project data.");
      setOriginalTasks([]);
      setDisplayTasks([]);
      setProjectMembers([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasksAndMembers();
  }, [fetchTasksAndMembers]);

  const handleTimelineTasksUpdate = useCallback(
    (updatedTasksFromTimeline) => {
      // When working with filtered tasks, we need to map the updates back to the full displayTasks array
      const updatedDisplayTasks = [...displayTasks];
      
      updatedTasksFromTimeline.forEach((updatedTask) => {
        const index = updatedDisplayTasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          updatedDisplayTasks[index] = updatedTask;
        }
      });
      
      setDisplayTasks(updatedDisplayTasks);
      const newChangedIds = new Set(changedTaskIds);

      updatedTasksFromTimeline.forEach((updatedTask) => {
        const originalTask = originalTasks.find(
          (ot) => ot.id === updatedTask.id
        );
        if (originalTask) {
          const originalStartDateStr = originalTask.startDate
            ? originalTask.startDate.toISOString()
            : null;
          const originalDueDateStr = originalTask.dueDate
            ? originalTask.dueDate.toISOString()
            : null;

          if (
            updatedTask.startDate !== originalStartDateStr ||
            updatedTask.dueDate !== originalDueDateStr
          ) {
            newChangedIds.add(updatedTask.id);
          } else {
            newChangedIds.delete(updatedTask.id);
          }
        }
      });
      setChangedTaskIds(newChangedIds);
    },
    [originalTasks, changedTaskIds, displayTasks]
  );

  const handleSaveChanges = async () => {
    if (changedTaskIds.size === 0) return;
    setIsSaving(true);
    setError(null);

    const updatePromises = [];
    changedTaskIds.forEach((taskId) => {
      const taskToUpdate = displayTasks.find((t) => t.id === taskId);
      if (taskToUpdate) {
        const updateData = {
          startDate: taskToUpdate.startDate,
          dueDate: taskToUpdate.dueDate,
        };
        updatePromises.push(taskService.updateTask(taskId, updateData));
      }
    });

    try {
      await Promise.all(updatePromises);
      await fetchTasksAndMembers();
    } catch (err) {
      console.error("Failed to save task changes:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = () => {
    openTaskModal({
      projectId,
      projectMembers: Array.isArray(projectMembers) ? projectMembers : [],
      onTaskUpdated: () => {
        fetchTasksAndMembers();
      },
    });
  };

  // Filter tasks based on current filter settings
  const filteredTasks = useMemo(() => {
    if (!displayTasks || displayTasks.length === 0) return [];

    let filtered = [...displayTasks];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned') {
        filtered = filtered.filter(task => !task.assigneeId);
      } else {
        filtered = filtered.filter(task => task.assigneeId === parseInt(filters.assignee));
      }
    }

    // Search text filter
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Overdue filter
    if (filters.showOverdue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && task.status !== 'done';
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      filtered = filtered.filter(task => {
        const taskStart = task.startDate ? new Date(task.startDate) : null;
        const taskDue = task.dueDate ? new Date(task.dueDate) : null;
        
        switch (filters.dateRange) {
          case 'thisWeek':
            return (taskStart && taskStart >= startOfWeek && taskStart <= endOfWeek) ||
                   (taskDue && taskDue >= startOfWeek && taskDue <= endOfWeek);
          case 'thisMonth':
            return (taskStart && taskStart >= startOfMonth && taskStart <= endOfMonth) ||
                   (taskDue && taskDue >= startOfMonth && taskDue <= endOfMonth);
          case 'nextMonth':
            return (taskStart && taskStart >= startOfNextMonth && taskStart <= endOfNextMonth) ||
                   (taskDue && taskDue >= startOfNextMonth && taskDue <= endOfNextMonth);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [displayTasks, filters]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      searchText: '',
      showOverdue: false,
      dateRange: 'all'
    });
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.assignee !== 'all') count++;
    if (filters.searchText.trim()) count++;
    if (filters.showOverdue) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  if (loading && !originalTasks.length) {
    return (
      <p className="text-center text-gray-500 py-10">Loading timeline...</p>
    );
  }

  if (error && !isSaving) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-900 min-h-screen text-white">
        <p className="text-center text-red-500 py-10">Error: {error}</p>
        <button
          onClick={fetchTasksAndMembers}
          className="block mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-900 min-h-screen text-white scroll-smooth">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Project Timeline
        </h1>
        <div className="flex items-center gap-3">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              showFilters || activeFiltersCount > 0
                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-500 text-slate-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white text-purple-600 text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </span>
          </button>

          {changedTaskIds.size > 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                `Save Changes (${changedTaskIds.size})`
              )}
            </button>
          )}
          <button
            onClick={handleAddTask}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Task
            </span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="min-w-32">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="min-w-32">
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div className="min-w-48">
              <select
                value={filters.assignee}
                onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {projectMembers
                  .filter(member => member && member.id) // Safety check
                  .map(member => (
                    <option key={member.id} value={member.id.toString()}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="min-w-36">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="all">All Dates</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="nextMonth">Next Month</option>
              </select>
            </div>
          </div>

          {/* Second Row: Checkboxes and Reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-4">
              {/* Overdue Toggle */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showOverdue}
                  onChange={(e) => setFilters(prev => ({ ...prev, showOverdue: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  filters.showOverdue ? 'bg-red-600' : 'bg-slate-600'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    filters.showOverdue ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-slate-300">Show Overdue Only</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              {/* Results Count */}
              <span className="text-sm text-slate-400">
                {filteredTasks.length} of {displayTasks.length} tasks
              </span>

              {/* Reset Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && isSaving && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg backdrop-blur-sm">
          <p className="text-red-300 text-center">
            <span className="inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Error saving: {error}
            </span>
          </p>
        </div>
      )}
      <div className="bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm border border-slate-700/50">
        <TimelineView
          key={timelineViewKey}
          tasks={filteredTasks}
          projectId={projectId}
          onTasksChange={handleTimelineTasksUpdate}
        />
      </div>
    </div>
  );
}
