"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useModal } from "../context/ModalContext";
import {
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

// Status mapping to match expected database values
const TASK_STATUSES = {
  TODO: { value: "todo", label: "To Do" },
  IN_PROGRESS: { value: "in-progress", label: "In Progress" },
  DONE: { value: "done", label: "Done" },
};

export default function TaskDetailModal() {
  const { isOpen, closeModal, modalProps, updateTaskOnBoard } = useModal();
  const taskId = modalProps?.taskId;
  const initialTaskData = modalProps?.taskData;
  const isTaskDetailModal = modalProps?.type === "taskDetail";

  const [editableTask, setEditableTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to load task details (status: ${response.status})`
        );
      }
      const data = await response.json();
      setEditableTask(data);
    } catch (err) {
      console.error("Error fetching task details:", err);
      setError(err.message);
      setEditableTask(initialTaskData || null);
    } finally {
      setLoading(false);
    }
  }, [taskId, initialTaskData]);

  useEffect(() => {
    if (isOpen && isTaskDetailModal) {
      if (
        initialTaskData &&
        (!editableTask || editableTask.id !== initialTaskData.id)
      ) {
        setEditableTask({ ...initialTaskData });
      }
      fetchTaskDetails();
    } else if (!isOpen || !isTaskDetailModal) {
      setEditableTask(null);
      setError("");
      setIsSaving(false);
    }
  }, [isOpen, isTaskDetailModal, taskId, initialTaskData, fetchTaskDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (statusKey) => {
    setEditableTask((prev) => ({
      ...prev,
      status: TASK_STATUSES[statusKey]?.value || "todo",
    }));
    setIsStatusOpen(false);
  };

  const getCurrentStatusKey = (status) => {
    return (
      Object.entries(TASK_STATUSES).find(
        ([_, value]) => value.value === status
      )?.[0] || "TODO"
    );
  };

  const handleSaveChanges = async () => {
    if (!editableTask || !editableTask.id) return;
    setIsSaving(true);
    setError("");

    const { id, title, description, status } = editableTask;
    const updateData = { title, description, status };

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to update task (status: ${response.status})`
        );
      }

      const updatedTaskFromServer = await response.json();
      setEditableTask(updatedTaskFromServer);

      if (typeof updateTaskOnBoard === "function") {
        updateTaskOnBoard(updatedTaskFromServer);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving task:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isTaskDetailModal) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeModal}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none p-4 sm:p-6 md:p-8 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl pointer-events-auto transform transition-all duration-300 flex flex-col ${
            isOpen ? "translate-y-0" : "translate-y-8"
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">
              {editableTask?.title ? "Edit Task" : "Task Details"}
            </h2>
            <button
              onClick={closeModal}
              disabled={isSaving}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 invisible-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-slate-300">Loading...</span>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                {error}
              </div>
            ) : editableTask ? (
              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Task Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editableTask.title || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200"
                    placeholder="Enter task title"
                    disabled={isSaving}
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editableTask.description || ""}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200 resize-none"
                    placeholder="Enter task description"
                    disabled={isSaving}
                  />
                </div>

                {/* Status Dropdown */}
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
                      <span>
                        {
                          TASK_STATUSES[
                            getCurrentStatusKey(editableTask.status)
                          ]?.label
                        }
                      </span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    {isStatusOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                        {Object.entries(TASK_STATUSES).map(([key, value]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleStatusChange(key)}
                            className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                          >
                            {value.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee */}
                {editableTask.assignee && (
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">
                      Assignee
                    </h3>
                    <div className="flex items-center space-x-3">
                      {editableTask.assignee.imageUrl && (
                        <img
                          src={editableTask.assignee.imageUrl}
                          alt={editableTask.assignee.firstName || "assignee"}
                          className="w-10 h-10 rounded-full border-2 border-slate-600"
                        />
                      )}
                      <span className="text-slate-200">
                        {editableTask.assignee.firstName}{" "}
                        {editableTask.assignee.lastName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Task Info */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-2">
                  <p className="text-sm">
                    <span className="text-slate-400">Project ID: </span>
                    <span className="text-slate-200">
                      {editableTask.projectId}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-400">Created: </span>
                    <span className="text-slate-200">
                      {new Date(editableTask.createdAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-400">Updated: </span>
                    <span className="text-slate-200">
                      {new Date(editableTask.updatedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No task data selected or found.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving || loading || !editableTask}
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
                {isSaving ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
