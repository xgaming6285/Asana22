"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import projectService from '../../../services/projectService'; // От src/app/services/
import taskService from '../../../services/taskService';       // От src/app/services/
import membershipService from '../../../services/membershipService'; // От src/app/services/
import { useModal } from '../../../context/ModalContext';      // От src/app/context/
import { useTaskModal } from '../../../context/TaskModalContext'; // От src/app/context/
import { Button } from '../../../components/MaterialTailwind'; // От src/app/components/

import { 
    PlusIcon, 
    ChevronDownIcon, 
    UserCircleIcon, 
    CheckCircleIcon, 
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowsUpDownIcon,
    Bars3Icon,
    Squares2X2Icon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const taskSectionsConfig = [
    { id: 'todo', title: 'To Do', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { id: 'in-progress', title: 'In Progress', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400' },
    { id: 'done', title: 'Done', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10', textColor: 'text-green-400' }
];

// Enhanced Priority Badge Component
function PriorityBadge({ priority }) {
    const priorityConfig = {
        low: { 
            bg: 'bg-green-500/20 border-green-500/30', 
            text: 'text-green-400', 
            icon: '●',
            glow: 'shadow-green-500/20'
        },
        medium: { 
            bg: 'bg-yellow-500/20 border-yellow-500/30', 
            text: 'text-yellow-400', 
            icon: '●',
            glow: 'shadow-yellow-500/20'
        },
        high: { 
            bg: 'bg-red-500/20 border-red-500/30', 
            text: 'text-red-400', 
            icon: '●',
            glow: 'shadow-red-500/20'
        },
    };

    if (!priority) return null;

    const config = priorityConfig[priority.toLowerCase()];
    if (!config) return null;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.glow} shadow-lg`}>
            <span className="text-[8px]">{config.icon}</span>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
}

// Enhanced Status Badge Component
function StatusBadge({ status }) {
    const statusConfig = {
        'todo': { 
            bg: 'bg-slate-500/20 border-slate-500/30', 
            text: 'text-slate-400',
            icon: '○'
        },
        'in-progress': { 
            bg: 'bg-blue-500/20 border-blue-500/30', 
            text: 'text-blue-400',
            icon: '◐'
        },
        'done': { 
            bg: 'bg-green-500/20 border-green-500/30', 
            text: 'text-green-400',
            icon: '●'
        },
    };

    const normalizedStatus = status?.toLowerCase().replace(' ', '-') || 'todo';
    const config = statusConfig[normalizedStatus] || statusConfig.todo;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} shadow-lg`}>
            <span className="text-[10px]">{config.icon}</span>
            {status?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'To Do'}
        </span>
    );
}

// Enhanced Task Row Component
function TaskRow({ task, assignee, onTaskClick, isExpanded, onToggleExpand }) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    const isDueSoon = task.dueDate && 
        new Date(task.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && 
        new Date(task.dueDate) > new Date() && 
        task.status !== 'done';

    return (
        <>
            <tr
                className="group hover:bg-gray-800/60 transition-all duration-200 cursor-pointer border-b border-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
                onClick={() => onTaskClick(task)}
            >
                {/* Task Title with Expand/Collapse */}
                <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(task.id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                        >
                            <ChevronRightIcon 
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90' : ''
                                }`} 
                            />
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <CheckCircleIcon 
                                    className={`w-5 h-5 transition-all duration-200 ${
                                        task.status === 'done' 
                                            ? 'text-green-400' 
                                            : 'text-gray-500 group-hover:text-purple-400'
                                    }`} 
                                />
                                {isOverdue && (
                                    <ExclamationTriangleIcon className="w-3 h-3 text-red-400 absolute -top-1 -right-1" />
                                )}
                                {isDueSoon && !isOverdue && (
                                    <ClockIcon className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                                )}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className={`font-semibold transition-colors duration-200 ${
                                    task.status === 'done' 
                                        ? 'text-gray-400 line-through' 
                                        : 'text-gray-200 group-hover:text-white'
                                }`}>
                                    {task.title}
                                </span>
                                {task.description && (
                                    <span className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {task.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Assignee */}
                <td className="py-4 px-6 whitespace-nowrap">
                    {assignee ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {assignee.imageUrl ? (
                                    <Image
                                        src={assignee.imageUrl}
                                        alt={assignee.firstName || ''}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-purple-400 transition-colors"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-600 group-hover:border-purple-400 transition-colors">
                                        {(assignee.firstName?.[0] || '') + (assignee.lastName?.[0] || '')}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-300 font-medium">
                                    {assignee.firstName} {assignee.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {assignee.email}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                            <UserCircleIcon className="w-6 h-6" />
                            <span className="text-sm">Unassigned</span>
                        </div>
                    )}
                </td>

                {/* Due Date */}
                <td className="py-4 px-6 whitespace-nowrap">
                    {task.dueDate ? (
                        <div className="flex items-center gap-2">
                            <CalendarIcon className={`w-4 h-4 ${
                                isOverdue ? 'text-red-400' : 
                                isDueSoon ? 'text-yellow-400' : 
                                'text-gray-500'
                            }`} />
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${
                                    isOverdue ? 'text-red-400' : 
                                    isDueSoon ? 'text-yellow-400' : 
                                    'text-gray-300'
                                }`}>
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                    })}
                                </span>
                                {(isOverdue || isDueSoon) && (
                                    <span className={`text-xs ${
                                        isOverdue ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                        {isOverdue ? 'Overdue' : 'Due soon'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">No due date</span>
                    )}
                </td>

                {/* Priority */}
                <td className="py-4 px-6 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} />
                </td>

                {/* Status */}
                <td className="py-4 px-6 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                </td>

                {/* Actions */}
                <td className="py-4 px-6 whitespace-nowrap text-right">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                </td>
            </tr>

            {/* Expanded Row Details */}
            {isExpanded && (
                <tr className="bg-gray-800/40 border-b border-gray-700/30">
                    <td colSpan={6} className="px-6 py-4">
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {task.description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">{task.description}</p>
                                </div>
                            )}
                            
                            <div className="flex flex-wrap gap-6 text-sm">
                                {task.startDate && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Start:</span>
                                        <span className="text-gray-300">
                                            {new Date(task.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Created:</span>
                                    <span className="text-gray-300">
                                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                
                                {task.updatedAt && task.updatedAt !== task.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Updated:</span>
                                        <span className="text-gray-300">
                                            {new Date(task.updatedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function ProjectListPage() {
    const params = useParams();
    const projectId = params?.id;

    const { openModal } = useModal();
    const { openTaskModal } = useTaskModal();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [taskFetchError, setTaskFetchError] = useState("");
    
    // Enhanced state for UI improvements
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('dueDate');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState({
        status: 'all',
        priority: 'all',
        assignee: 'all',
        overdue: false
    });
    const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'
    const [showFilters, setShowFilters] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [collapsedSections, setCollapsedSections] = useState(new Set());

    async function fetchTasks(currentProjectId) {
        try {
            const res = await fetch(`/api/tasks?projectId=${currentProjectId}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to load tasks");
            }
            const data = await res.json();
            setTasks(data);
            setTaskFetchError("");
        } catch (e) {
            setTaskFetchError(e.message || "Failed to load tasks");
            setTasks([]);
        }
    }

    const handleOpenCreateTaskModal = () => {
        openTaskModal({
            projectId,
            projectMembers: Array.isArray(projectMembers) ? projectMembers : [],
            onTaskUpdated: () => {
                fetchTasks(projectId);
            },
        });
    };

    const fetchPageData = useCallback(async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [projectData, tasksData, membersData] = await Promise.all([
                projectService.getProjectById(projectId),
                taskService.getProjectTasks(projectId),
                membershipService.getProjectMembers(projectId),
            ]);
            setProject(projectData);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setProjectMembers(Array.isArray(membersData) ? membersData : []);
        } catch (err) {
            console.error("Failed to fetch project data for list view:", err);
            setError(err.message || "Could not load project data.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchPageData();
        } else {
            setLoading(false);
            setError("Project ID not available from URL params.");
        }
    }, [projectId, fetchPageData]);

    const findAssignee = useCallback((assigneeId) => {
        if (!assigneeId || !projectMembers || projectMembers.length === 0) return null;
        return projectMembers.find(
            (member) => member.id === assigneeId || member.userId === assigneeId
        );
    }, [projectMembers]);

    const handleOpenTaskDetail = (task) => {
        const assigneeDetails = task.assigneeId
            ? findAssignee(task.assigneeId)
            : null;
        const taskWithAssigneeDetails = { ...task, assignee: assigneeDetails };
        openModal({
            type: "taskDetail",
            taskId: task.id,
            taskData: taskWithAssigneeDetails,
            onTaskUpdate: (updatedTask) => {
                // Update the specific task in the state instead of refetching all data
                setTasks(prevTasks => 
                    prevTasks.map(t => 
                        t.id === updatedTask.id ? updatedTask : t
                    )
                );
            },
        });
    };

    const handleToggleTaskExpand = (taskId) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleToggleSectionCollapse = (sectionId) => {
        setCollapsedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    // Enhanced filtering and sorting logic
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            // Search filter
            if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Status filter
            if (filterBy.status !== 'all' && task.status?.toLowerCase().replace(' ', '-') !== filterBy.status) {
                return false;
            }

            // Priority filter
            if (filterBy.priority !== 'all' && task.priority?.toLowerCase() !== filterBy.priority) {
                return false;
            }

            // Assignee filter
            if (filterBy.assignee !== 'all') {
                if (filterBy.assignee === '') {
                    // Filter for unassigned tasks
                    if (task.assigneeId) return false;
                } else {
                    // Check if task's assigneeId matches the selected member's id
                    // The assigneeId in tasks should match the user id from project members
                    if (task.assigneeId !== parseInt(filterBy.assignee)) {
                        return false;
                    }
                }
            }

            // Overdue filter
            if (filterBy.overdue) {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                if (!isOverdue) return false;
            }

            return true;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'dueDate':
                    aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                    bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority?.toLowerCase()] || 0;
                    bValue = priorityOrder[b.priority?.toLowerCase()] || 0;
                    break;
                case 'assignee':
                    const aAssignee = findAssignee(a.assigneeId);
                    const bAssignee = findAssignee(b.assigneeId);
                    aValue = aAssignee ? `${aAssignee.firstName} ${aAssignee.lastName}`.toLowerCase() : 'zzz';
                    bValue = bAssignee ? `${bAssignee.firstName} ${bAssignee.lastName}`.toLowerCase() : 'zzz';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                default:
                    aValue = a.updatedAt;
                    bValue = b.updatedAt;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [tasks, searchTerm, filterBy, sortBy, sortOrder, findAssignee]);

    const tasksBySection = useMemo(() => {
        if (viewMode === 'flat') {
            return { all: filteredAndSortedTasks };
        }

        const grouped = {};
        taskSectionsConfig.forEach((section) => {
            grouped[section.id] = filteredAndSortedTasks.filter(
                (task) => task.status?.toLowerCase().replace(' ', '-') === section.id
            );
        });
        return grouped;
    }, [filteredAndSortedTasks, viewMode]);

    const taskStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
        const dueSoon = tasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            return dueDate > now && dueDate <= threeDaysFromNow;
        }).length;

        return { total, completed, overdue, dueSoon };
    }, [tasks]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    if (!project && !loading) {
        return (
            <div className="text-center p-10">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Project not found</h3>
                <p className="text-gray-500">The project you&apos;re looking for doesn&apos;t exist or failed to load.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-2 curved-header">
                            {project?.name ? `${project.name}` : "Task List"}
                        </h1>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                {taskStats.total} Total Tasks
                            </span>
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                {taskStats.completed} Completed
                            </span>
                            {taskStats.overdue > 0 && (
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                    {taskStats.overdue} Overdue
                                </span>
                            )}
                            {taskStats.dueSoon > 0 && (
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    {taskStats.dueSoon} Due Soon
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <Button
                        onClick={handleOpenCreateTaskModal}
                        variant="gradient"
                        color="purple"
                        className="flex items-center gap-2 hover-lift"
                    >
                        <PlusIcon className="h-5 w-5" /> Add Task
                    </Button>
                </div>

                {/* Enhanced Search and Filter Bar */}
                <div className="glass-morphism rounded-xl p-6 mb-6 border border-purple-500/20 shadow-xl shadow-purple-500/10">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search with enhanced styling */}
                        <div className="flex-1 relative group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
                            <input
                                type="text"
                                placeholder="Search tasks by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-200 hover:bg-gray-800/90 focus:bg-gray-800"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Enhanced View Mode Toggle */}
                        <div className="flex bg-gray-800/50 rounded-xl p-1.5 border border-gray-600/30">
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'grouped' 
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 transform scale-105' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">Grouped</span>
                            </button>
                            <button
                                onClick={() => setViewMode('flat')}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'flat' 
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 transform scale-105' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <Bars3Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">List</span>
                            </button>
                        </div>

                        {/* Enhanced Filters Toggle with Active Indicator */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 relative ${
                                    showFilters || Object.values(filterBy).some(v => v !== 'all' && v !== false)
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 transform scale-105' 
                                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                                }`}
                            >
                                <FunnelIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                                {Object.values(filterBy).some(v => v !== 'all' && v !== false) && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                                )}
                            </button>
                        </div>

                        {/* Enhanced Sort Controls */}
                        <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1.5 border border-gray-600/30">
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-transparent border-none px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg cursor-pointer pr-8"
                                >
                                    <option value="dueDate" className="bg-gray-800">📅 Due Date</option>
                                    <option value="title" className="bg-gray-800">📝 Title</option>
                                    <option value="priority" className="bg-gray-800">⚡ Priority</option>
                                    <option value="assignee" className="bg-gray-800">👤 Assignee</option>
                                    <option value="createdAt" className="bg-gray-800">🕒 Created</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                <ArrowsUpDownIcon className={`w-4 h-4 text-gray-400 group-hover:text-purple-400 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-all duration-200`} />
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Filter Options */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gradient-to-r from-purple-500/20 to-blue-500/20 animate-slide-in-up">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                                    <FunnelIcon className="w-5 h-5 text-purple-400" />
                                    Filter Options
                                </h3>
                                <button
                                    onClick={() => setFilterBy({ status: 'all', priority: 'all', assignee: 'all', overdue: false })}
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-1"
                                >
                                    <span>Clear all filters</span>
                                    <span className="text-xs">×</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Enhanced Status Filter */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        Status
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={filterBy.status}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full appearance-none bg-gray-800/70 border border-gray-600/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-200 hover:bg-gray-800/90 cursor-pointer"
                                        >
                                            <option value="all" className="bg-gray-800">All Status</option>
                                            <option value="todo" className="bg-gray-800">📋 To Do</option>
                                            <option value="in-progress" className="bg-gray-800">⚡ In Progress</option>
                                            <option value="done" className="bg-gray-800">✅ Done</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-purple-400 transition-colors duration-200" />
                                    </div>
                                </div>

                                {/* Enhanced Priority Filter */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        Priority
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={filterBy.priority}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, priority: e.target.value }))}
                                            className="w-full appearance-none bg-gray-800/70 border border-gray-600/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-200 hover:bg-gray-800/90 cursor-pointer"
                                        >
                                            <option value="all" className="bg-gray-800">All Priorities</option>
                                            <option value="high" className="bg-gray-800">🔴 High Priority</option>
                                            <option value="medium" className="bg-gray-800">🟡 Medium Priority</option>
                                            <option value="low" className="bg-gray-800">🟢 Low Priority</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-purple-400 transition-colors duration-200" />
                                    </div>
                                </div>

                                {/* Enhanced Assignee Filter */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        Assignee
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={filterBy.assignee}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, assignee: e.target.value }))}
                                            className="w-full appearance-none bg-gray-800/70 border border-gray-600/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-200 hover:bg-gray-800/90 cursor-pointer"
                                        >
                                            <option value="all" className="bg-gray-800">All Assignees</option>
                                            <option value="" className="bg-gray-800">👤 Unassigned</option>
                                            {projectMembers.map(member => (
                                                <option key={member.id} value={member.id} className="bg-gray-800">
                                                    👤 {member.firstName} {member.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-purple-400 transition-colors duration-200" />
                                    </div>
                                </div>

                                {/* Enhanced Special Filters */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        Special Filters
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={filterBy.overdue}
                                                    onChange={(e) => setFilterBy(prev => ({ ...prev, overdue: e.target.checked }))}
                                                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded-lg focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                                                />
                                                {filterBy.overdue && (
                                                    <div className="absolute inset-0 bg-purple-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200 flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                                                Show only overdue
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {Object.values(filterBy).some(v => v !== 'all' && v !== false) && (
                                <div className="mt-6 pt-4 border-t border-gray-600/30">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-400">Active filters:</span>
                                        {filterBy.status !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                                                Status: {filterBy.status.replace('-', ' ')}
                                                <button
                                                    onClick={() => setFilterBy(prev => ({ ...prev, status: 'all' }))}
                                                    className="ml-1 hover:text-blue-300 transition-colors duration-200"
                                                >×</button>
                                            </span>
                                        )}
                                        {filterBy.priority !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30">
                                                Priority: {filterBy.priority}
                                                <button
                                                    onClick={() => setFilterBy(prev => ({ ...prev, priority: 'all' }))}
                                                    className="ml-1 hover:text-orange-300 transition-colors duration-200"
                                                >×</button>
                                            </span>
                                        )}
                                        {filterBy.assignee !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                                                Assignee: {filterBy.assignee === '' ? 'Unassigned' : projectMembers.find(m => m.id === filterBy.assignee)?.firstName + ' ' + projectMembers.find(m => m.id === filterBy.assignee)?.lastName}
                                                <button
                                                    onClick={() => setFilterBy(prev => ({ ...prev, assignee: 'all' }))}
                                                    className="ml-1 hover:text-green-300 transition-colors duration-200"
                                                >×</button>
                                            </span>
                                        )}
                                        {filterBy.overdue && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                                                Overdue only
                                                <button
                                                    onClick={() => setFilterBy(prev => ({ ...prev, overdue: false }))}
                                                    className="ml-1 hover:text-red-300 transition-colors duration-200"
                                                >×</button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                {(searchTerm || Object.values(filterBy).some(v => v !== 'all' && v !== false)) && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 mb-6 animate-slide-in-down">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"></div>
                                <span className="text-sm text-gray-300">
                                    Showing <span className="font-semibold text-purple-400">{filteredAndSortedTasks.length}</span> of <span className="font-semibold text-gray-200">{tasks.length}</span> tasks
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterBy({ status: 'all', priority: 'all', assignee: 'all', overdue: false });
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-1"
                            >
                                <span>Clear all</span>
                                <span>×</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {taskFetchError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">Error loading tasks: {taskFetchError}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Task Table */}
            <div className="glass-morphism rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[768px]">
                        <thead className="bg-gray-800/60 backdrop-blur-sm sticky top-0 z-10 border-b border-purple-500/20">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-2/5">
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'title') {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy('title');
                                                setSortOrder('asc');
                                            }
                                        }}
                                        className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200 group"
                                    >
                                        <span>Task</span>
                                        <div className="flex flex-col">
                                            {sortBy === 'title' ? (
                                                sortOrder === 'asc' ? (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400" />
                                                ) : (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400 rotate-180" />
                                                )
                                            ) : (
                                                <ChevronUpDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                            )}
                                        </div>
                                    </button>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/5">
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'assignee') {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy('assignee');
                                                setSortOrder('asc');
                                            }
                                        }}
                                        className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200 group"
                                    >
                                        <span>Assignee</span>
                                        <div className="flex flex-col">
                                            {sortBy === 'assignee' ? (
                                                sortOrder === 'asc' ? (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400" />
                                                ) : (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400 rotate-180" />
                                                )
                                            ) : (
                                                <ChevronUpDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                            )}
                                        </div>
                                    </button>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/5">
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'dueDate') {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy('dueDate');
                                                setSortOrder('asc');
                                            }
                                        }}
                                        className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200 group"
                                    >
                                        <span>Due Date</span>
                                        <div className="flex flex-col">
                                            {sortBy === 'dueDate' ? (
                                                sortOrder === 'asc' ? (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400" />
                                                ) : (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400 rotate-180" />
                                                )
                                            ) : (
                                                <ChevronUpDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                            )}
                                        </div>
                                    </button>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/10">
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'priority') {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy('priority');
                                                setSortOrder('desc');
                                            }
                                        }}
                                        className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200 group"
                                    >
                                        <span>Priority</span>
                                        <div className="flex flex-col">
                                            {sortBy === 'priority' ? (
                                                sortOrder === 'asc' ? (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400" />
                                                ) : (
                                                    <ChevronUpDownIcon className="w-3 h-3 text-purple-400 rotate-180" />
                                                )
                                            ) : (
                                                <ChevronUpDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                            )}
                                        </div>
                                    </button>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/10">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-auto">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {viewMode === 'grouped' ? (
                                // Grouped View - Always show all sections
                                taskSectionsConfig.map((section) => {
                                    const sectionTasks = tasksBySection[section.id] || [];
                                    const isCollapsed = collapsedSections.has(section.id);

                                    return (
                                        <React.Fragment key={section.id}>
                                            {/* Enhanced Section Header */}
                                            <tr className={`${section.bgColor} backdrop-blur-sm border-l-4 border-l-transparent hover:border-l-purple-500 transition-all duration-300`}>
                                                <td colSpan={6} className="py-4 px-6">
                                                    <button
                                                        onClick={() => handleToggleSectionCollapse(section.id)}
                                                        className="flex items-center justify-between w-full text-left hover:opacity-80 transition-all duration-200 group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${section.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}></div>
                                                            <ChevronDownIcon 
                                                                className={`w-5 h-5 ${section.textColor} transition-transform duration-200 ${
                                                                    isCollapsed ? '-rotate-90' : ''
                                                                } group-hover:scale-110`} 
                                                            />
                                                            <h3 className={`text-base font-bold ${section.textColor} flex items-center gap-3 group-hover:text-white transition-colors duration-200`}>
                                                                {section.title}
                                                                <span className={`bg-gradient-to-r ${section.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                                                                    {sectionTasks.length}
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <span className="text-xs text-gray-400">
                                                                {isCollapsed ? 'Expand' : 'Collapse'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </td>
                                            </tr>
                                            
                                            {/* Section Tasks or Empty State */}
                                            {!isCollapsed && (
                                                sectionTasks.length > 0 ? (
                                                    sectionTasks.map((task, index) => (
                                                        <TaskRow
                                                            key={task.id}
                                                            task={task}
                                                            assignee={findAssignee(task.assigneeId)}
                                                            onTaskClick={handleOpenTaskDetail}
                                                            isExpanded={expandedTasks.has(task.id)}
                                                            onToggleExpand={handleToggleTaskExpand}
                                                        />
                                                    ))
                                                ) : (
                                                    <tr className="bg-gray-800/20">
                                                        <td colSpan={6} className="py-8 px-6 text-center">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${section.color} opacity-20 flex items-center justify-center`}>
                                                                    <div className="w-6 h-6 border-2 border-current rounded-full opacity-50"></div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400 font-medium">
                                                                        No tasks in {section.title.toLowerCase()}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {section.id === 'todo' && 'Create a new task to get started'}
                                                                        {section.id === 'in-progress' && 'Move tasks here when you start working on them'}
                                                                        {section.id === 'done' && 'Completed tasks will appear here'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                // Flat View
                                filteredAndSortedTasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        assignee={findAssignee(task.assigneeId)}
                                        onTaskClick={handleOpenTaskDetail}
                                        isExpanded={expandedTasks.has(task.id)}
                                        onToggleExpand={handleToggleTaskExpand}
                                    />
                                ))
                            )}


                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredAndSortedTasks.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                            {searchTerm || Object.values(filterBy).some(v => v !== 'all' && v !== false)
                                ? 'No tasks match your filters'
                                : 'No tasks yet'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || Object.values(filterBy).some(v => v !== 'all' && v !== false)
                                ? 'Try adjusting your search or filters'
                                : 'Get started by creating your first task using the "Add Task" button above'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
