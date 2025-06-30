"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import taskService from "../services/taskService";

// Update status mapping to match expected database values
const TASK_STATUSES = {
  TODO: { value: "todo", label: "To Do" },
  IN_PROGRESS: { value: "in-progress", label: "In Progress" },
  DONE: { value: "done", label: "Done" },
};

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function CreateTaskModal({ isOpen, onClose, modalProps }) {
  const projectId = modalProps?.projectId;
  const taskToEdit = modalProps?.taskToEdit;
  const projectMembers = modalProps?.projectMembers || [];
  const onTaskUpdated = modalProps?.onTaskUpdated;

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Status dropdown state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTaskName(taskToEdit.title || "");
        setTaskDescription(taskToEdit.description || "");
        setStatus(taskToEdit.status?.toUpperCase() || "TODO");
        setPriority(taskToEdit.priority || "medium");
        setAssigneeId(taskToEdit.assigneeId || "");
        setDueDate(taskToEdit.dueDate || "");
        setStartDate(taskToEdit.startDate || "");
      } else {
        setTaskName("");
        setTaskDescription("");
        setStatus("TODO");
        setPriority("medium");
        setAssigneeId("");
        setDueDate("");
        setStartDate("");
      }
      setIsSubmitting(false);
      setError("");
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const taskData = {
        title: taskName.trim(),
        description: taskDescription.trim(),
        status: TASK_STATUSES[status]?.value || "todo",
        priority: priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
      };

      if (taskToEdit) {
        await taskService.updateTask(taskToEdit.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }

      onTaskUpdated?.();
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
      setError(err.message || "Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all duration-300">
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-semibold text-slate-100">
                    {taskToEdit ? "Edit Task" : "Create New Task"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 invisible-scrollbar">
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Task Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Task Name <span className="text-slate-400">*</span>
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200"
                  placeholder="e.g., Design the new dashboard"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Description <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200 resize-none"
                  placeholder="Add more details about the task..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-left text-slate-100 flex items-center justify-between hover:border-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    >
                      <span>{TASK_STATUSES[status]?.label}</span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    {isStatusOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                        {Object.entries(TASK_STATUSES).map(([key, value]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setStatus(key);
                              setIsStatusOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                          >
                            {value.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Priority
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-left text-slate-100 flex items-center justify-between hover:border-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    >
                      <span className="capitalize">{priority}</span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    {isPriorityOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                        {PRIORITIES.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setPriority(value);
                              setIsPriorityOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Assignee
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-left text-slate-100 flex items-center justify-between hover:border-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    >
                      <span>
                        {assigneeId
                          ? projectMembers.find((m) => m.id === assigneeId)
                              ?.firstName || "Unknown"
                          : "Unassigned"}
                      </span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    {isAssigneeOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setAssigneeId("");
                            setIsAssigneeOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                        >
                          Unassigned
                        </button>
                        {projectMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              setAssigneeId(member.id);
                              setIsAssigneeOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                          >
                            {member.firstName} {member.lastName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 rounded-lg
                    bg-gradient-to-r from-indigo-600 to-indigo-700
                    hover:from-indigo-500 hover:to-indigo-600
                    active:from-indigo-700 active:to-indigo-800
                    text-white font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    min-w-[100px]
                    flex items-center justify-center
                  `}
                >
                  {isSubmitting ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : taskToEdit ? (
                    "Save Changes"
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
