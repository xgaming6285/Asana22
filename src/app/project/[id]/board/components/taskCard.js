// src/app/components/TaskCard.js
"use client";

import React from "react";
import {
  ChatBubbleLeftEllipsisIcon,
  PaperClipIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FireIcon,
  BoltIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useModal } from "../../../../context/ModalContext";
import taskService from "../../../../services/taskService";

const priorityConfig = {
  low: {
    icon: ArrowDownIcon,
    classes: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    badgeClasses: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glowClasses: "shadow-emerald-500/20",
  },
  medium: {
    icon: ArrowUpIcon,
    classes: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    badgeClasses: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    glowClasses: "shadow-amber-500/20",
  },
  high: {
    icon: ExclamationTriangleIcon,
    classes: "border-red-500/50 bg-red-500/10 text-red-300",
    badgeClasses: "bg-red-500/20 text-red-300 border-red-500/30",
    glowClasses: "shadow-red-500/20",
  },
};

const TaskCard = ({ task, assignee, onTaskUpdated, onTaskDeleted, currentUserRole, currentUserId }) => {
  const { openModal } = useModal();
  const {
    id,
    title,
    description,
    priority = "medium",
    dueDate,
    commentsCount = 0,
    attachmentsCount = 0,
    status,
    createdBy,
  } = task;

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Check if due date is overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date();
  const isDueSoon = dueDate && !isOverdue && new Date(dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Due within 3 days

  const priorityInfo = priorityConfig[priority.toLowerCase()] || priorityConfig.medium;
  const PriorityIcon = priorityInfo.icon;

  // Check if current user can delete this task
  const isProjectAdminOrCreator = currentUserRole === 'ADMIN' || currentUserRole === 'CREATOR';
  const isTaskCreator = createdBy && createdBy.id === currentUserId;
  const canDeleteTask = isProjectAdminOrCreator || isTaskCreator;
  
  // Debug logging
  console.log(`Debug TaskCard - Task ${id}: currentUserRole=${currentUserRole}, currentUserId=${currentUserId}, createdById=${createdBy?.id}, isTaskCreator=${isTaskCreator}, canDeleteTask=${canDeleteTask}`);

  const handleTaskClick = () => {
    openModal({
      type: "taskDetail",
      taskId: id,
      taskData: task,
    });
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        onTaskDeleted?.(id);
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  // Get status-specific styling
  const getStatusStyling = () => {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-600/5';
      case 'in-progress':
        return 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5';
      default:
        return 'border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/5';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden bg-gray-800/80 backdrop-blur-sm border ${getStatusStyling()} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]`}
      onClick={handleTaskClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Priority accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        priority === 'high' ? 'from-red-500 to-red-400' :
        priority === 'medium' ? 'from-amber-500 to-amber-400' :
        'from-emerald-500 to-emerald-400'
      } opacity-60`}></div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 gap-3">
          <h3 className="text-sm font-bold text-gray-100 break-words leading-tight flex-1 min-w-0 group-hover:text-white transition-colors duration-200">
            {title}
          </h3>
          {canDeleteTask && (
            <Menu as="div" className="relative inline-block text-left flex-shrink-0">
              <div onClick={handleMenuClick}>
                <MenuButton className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-gray-800/95 backdrop-blur-sm shadow-2xl ring-1 ring-gray-700/50 border border-gray-600/50 transition focus:outline-none">
                <div className="py-2">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={handleDeleteClick}
                        className={`block w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 transition-colors duration-200 ${
                          focus ? "bg-red-500/10" : ""
                        }`}
                      >
                        🗑️ Delete Task
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-400 mb-4 break-words leading-relaxed line-clamp-2">
            {description.length > 100
              ? `${description.substring(0, 97)}...`
              : description}
          </p>
        )}

        {/* Priority Badge */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border ${priorityInfo.badgeClasses} ${priorityInfo.glowClasses} shadow-lg`}>
            <PriorityIcon className="h-3 w-3" />
            <span className="capitalize">{priority}</span>
            {priority === 'high' && <FireIcon className="h-3 w-3 animate-pulse" />}
            {priority === 'medium' && <BoltIcon className="h-3 w-3" />}
            {priority === 'low' && <CheckBadgeIcon className="h-3 w-3" />}
          </div>
        </div>

        {/* Due Date */}
        {formattedDueDate && (
          <div className="flex items-center mb-3">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${
              isOverdue 
                ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                : isDueSoon
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
            }`}>
              <CalendarIcon className="h-3 w-3 flex-shrink-0" />
              <span>{formattedDueDate}</span>
              {isOverdue && <span className="font-bold">⚠️</span>}
              {isDueSoon && <span>⏰</span>}
            </div>
          </div>
        )}

        {/* Assignee and Creator */}
        <div className="flex items-center mb-4 gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-700/30 rounded-lg border border-gray-600/30">
            <UserCircleIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-300 font-medium truncate">
              {assignee
                ? `${assignee.firstName} ${assignee.lastName || ""}`.trim()
                : "Unassigned"}
            </span>
          </div>
          {createdBy && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <span className="text-xs text-purple-300 font-medium">
                Created by {createdBy.firstName} {createdBy.lastName || ""}
              </span>
            </div>
          )}
        </div>

        {/* Footer with Stats */}
        {(commentsCount > 0 || attachmentsCount > 0) && (
          <div className="flex items-center justify-start gap-3 pt-3 border-t border-gray-700/50">
            {commentsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <ChatBubbleLeftEllipsisIcon className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">{commentsCount}</span>
              </div>
            )}
            {attachmentsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <PaperClipIcon className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">{attachmentsCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className={`w-2 h-2 rounded-full ${
            status?.toLowerCase() === 'done' ? 'bg-green-500' :
            status?.toLowerCase() === 'in-progress' ? 'bg-yellow-500' :
            'bg-blue-500'
          } animate-pulse`}></div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${priorityInfo.glowClasses} -z-10`}></div>
    </div>
  );
};

export default TaskCard;
