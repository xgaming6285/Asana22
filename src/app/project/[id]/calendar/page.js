"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTaskModal } from "../../../../app/context/TaskModalContext"; // Removed
import taskService from "@/app/services/taskService";
import { useModal } from "@/app/context/ModalContext"; // Corrected import path based on user's change
import membershipService from "@/app/services/membershipService";
import Image from "next/image";

// Placeholder for date utility functions (some can be reused from TimelineView)
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay(); // 0 = Sunday
const formatDate = (date, options) =>
  date ? new Date(date).toLocaleDateString(undefined, options) : "";

const formatDateForComparison = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const CalendarPage = () => {
  const params = useParams();
  const projectId = params.id;
  const { openTaskModal } = useTaskModal(); // Removed
  const { openModal } = useModal(); // Use this for all modal operations
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true); // Added membersLoading state

  useEffect(() => {
    if (projectId) {
      const fetchTasksForCalendar = async () => {
        try {
          setLoading(true);
          const fetchedTasks = await taskService.getProjectTasks(projectId);
          setTasks(fetchedTasks || []);
          setError(null);
        } catch (err) {
          console.error("Error fetching tasks for calendar:", err);
          setError(
            "Failed to load tasks. Ensure a taskService function 'getTasksByProjectId' exists and is correctly implemented."
          );
          setTasks([]);
        } finally {
          setLoading(false);
        }
      };
      fetchTasksForCalendar();
    }
  }, [projectId]);

  // useEffect to fetch project members
  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId);
    }
  }, [projectId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getDayOfWeek(year, month, 1); // 0 (Sun) - 6 (Sat)

  // dateHeaders is used by taskLayoutForMonth, ensure it's defined before
  const dateHeaders = useMemo(() => {
    // Calculate overallMinDate and overallMaxDate for the current month view
    // This needs to be robust to cover the 6 weeks usually displayed in a month view
    const firstVisibleDate = new Date(year, month, 1 - firstDayOfMonth);
    const lastDateOfMonth = new Date(year, month, daysInMonth);
    const cellsToDisplay = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const lastVisibleDate = new Date(firstVisibleDate);
    lastVisibleDate.setDate(firstVisibleDate.getDate() + cellsToDisplay - 1);

    const dates = [];
    let currentCalDate = new Date(firstVisibleDate);
    while (currentCalDate <= lastVisibleDate) {
      dates.push(new Date(currentCalDate));
      currentCalDate.setDate(currentCalDate.getDate() + 1);
    }
    return dates;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const taskLayoutForMonth = useMemo(() => {
    const layout = {}; // { 'YYYY-MM-DD': [taskOrNull, taskOrNull, taskOrNull] }
    const taskCurrentLanes = new Map(); // taskId -> laneIndex (0, 1, 2)
    const MAX_LANES = 3;

    if (!tasks || tasks.length === 0) return {};

    dateHeaders.forEach((dateObj) => {
      const dayKey = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      const daySlots = Array(MAX_LANES).fill(null);
      const currentDayTs = formatDateForComparison(dateObj);

      const tasksOnThisDay = tasks.filter((task) => {
        const taskStart = formatDateForComparison(task.startDate);
        const taskDue = formatDateForComparison(task.dueDate);
        if (!currentDayTs) return false; // Should not happen if dateObj is valid

        if (taskStart && taskDue)
          return currentDayTs >= taskStart && currentDayTs <= taskDue;
        if (taskDue) return currentDayTs === taskDue; // Task ends today
        if (taskStart) return currentDayTs >= taskStart; // Task starts today or started before and has no due date (ongoing)
        return false;
      });

      const continuingTasks = [];
      const newOrUnlanedTasks = [];
      tasksOnThisDay.forEach((t) => {
        if (taskCurrentLanes.has(t.id)) {
          continuingTasks.push(t);
        } else {
          newOrUnlanedTasks.push(t);
        }
      });

      // Prioritize tasks that have an assigned lane from a previous day
      continuingTasks.sort(
        (a, b) =>
          (taskCurrentLanes.get(a.id) ?? MAX_LANES) -
          (taskCurrentLanes.get(b.id) ?? MAX_LANES)
      );
      // Sort new/unlaned tasks by start date, then ID for consistent placement
      newOrUnlanedTasks.sort(
        (a, b) =>
          new Date(a.startDate || 0).getTime() -
            new Date(b.startDate || 0).getTime() ||
          a.id.toString().localeCompare(b.id.toString())
      );

      // Pass 1: Place continuing tasks in their preferred lanes
      for (const task of continuingTasks) {
        const laneIndex = taskCurrentLanes.get(task.id);
        if (laneIndex < MAX_LANES && daySlots[laneIndex] === null) {
          daySlots[laneIndex] = task;
        }
      }

      // Pass 2: Fill remaining slots with new tasks or continuing tasks that lost their preferred lane
      const tasksForPass2 = [
        ...newOrUnlanedTasks,
        ...continuingTasks.filter((t) => !daySlots.includes(t)),
      ];
      // Ensure tasksForPass2 are also sorted to fill deterministically if multiple new tasks compete
      tasksForPass2.sort(
        (a, b) =>
          new Date(a.startDate || 0).getTime() -
            new Date(b.startDate || 0).getTime() ||
          a.id.toString().localeCompare(b.id.toString())
      );

      for (const task of tasksForPass2) {
        if (daySlots.includes(task)) continue; // Already placed in pass 1

        for (let i = 0; i < MAX_LANES; i++) {
          if (daySlots[i] === null) {
            daySlots[i] = task;
            taskCurrentLanes.set(task.id, i); // Assign/Update lane
            break;
          }
        }
      }
      layout[dayKey] = daySlots;

      // Cleanup taskCurrentLanes: remove tasks that are no longer active
      const activeTaskIDsOnThisDay = new Set(tasksOnThisDay.map((t) => t.id));
      for (const taskId of Array.from(taskCurrentLanes.keys())) {
        if (!activeTaskIDsOnThisDay.has(taskId)) {
          taskCurrentLanes.delete(taskId);
        }
      }
    });
    return layout;
  }, [tasks, dateHeaders]);

  const calendarDays = useMemo(() => {
    const days = [];
    // Add padding for days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `prev-${i}`, day: null, isCurrentMonth: false });
    }
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        key: `current-${day}`,
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }
    // Add padding for days from the next month to fill the grid (usually 6 weeks)
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({
        key: `next-${nextMonthDay}`,
        day: null,
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const fetchProjectMembers = async (currentProjectId) => {
    setMembersLoading(true);
    try {
      const members = await membershipService.getProjectMembers(
        currentProjectId
      );
      setProjectMembers(members || []); // Ensure it's an array
    } catch (e) {
      console.error("Failed to load project members:", e);
      setProjectMembers([]); // Set to empty array on error
    } finally {
      setMembersLoading(false);
    }
  };

  const handleOpenCreateTaskModal = () => {
    openTaskModal({
      projectId,
      projectMembers: Array.isArray(projectMembers) ? projectMembers : [],
      onTaskUpdated: () => {
        taskService.getProjectTasks(projectId);
      },
    });
  };
  const handleAddTask = (date) => {
    const initialPayload = { projectId };
    if (date) {
      initialPayload.startDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      initialPayload.dueDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
    }
    // Align with taskCard.js: use type: "taskDetail"
    // The modal should differentiate between create and edit based on presence/absence of taskId.
    openModal({
      type: "taskDetail",
      initialData: initialPayload,
      projectId: projectId,
    });
  };

  if (loading && !tasks.length)
    return (
      <div className="text-center py-10 text-slate-300">
        Loading calendar...
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-400">Error: {error}</div>;

  return (
    <div className="bg-slate-900 text-white p-2 sm:p-4 md:p-6 rounded-lg shadow-xl h-full flex flex-col">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-700 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 order-2 sm:order-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            aria-label="Previous month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-400 w-36 sm:w-48 text-center">
            {currentDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            aria-label="Next month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <button
            onClick={handleToday}
            className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-slate-600 hover:border-slate-500 rounded-md hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          >
            Today
          </button>
        </div>
        <button
          onClick={handleOpenCreateTaskModal}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-3 sm:px-4 rounded-lg shadow-md transition-colors text-xs sm:text-sm flex items-center order-1 sm:order-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-1 sm:mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </header>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-700 border border-slate-700 flex-grow min-h-[calc(100vh_-_250px)] sm:min-h-[calc(100vh_-_200px)]">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div
            key={day}
            className="bg-slate-800 text-xs font-medium text-slate-300 p-1 sm:p-2 text-center border-b border-slate-700 sticky top-0 z-10"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 1)}</span>
          </div>
        ))}
        {/* Calendar Cells */}
        {calendarDays.map((dayInfo) => {
          const dayTimestamp = dayInfo.date
            ? formatDateForComparison(dayInfo.date)
            : null;

          const dayKey = dayInfo.date
            ? `${dayInfo.date.getFullYear()}-${String(
                dayInfo.date.getMonth() + 1
              ).padStart(2, "0")}-${String(dayInfo.date.getDate()).padStart(
                2,
                "0"
              )}`
            : null;
          const tasksToDisplayInSlots = dayKey
            ? taskLayoutForMonth[dayKey] || Array(3).fill(null)
            : Array(3).fill(null);

          // For "+X more" logic, we need the total count of tasks for the day, not just displayed ones
          const allTasksForActualDay =
            dayInfo.isCurrentMonth && dayTimestamp && dayInfo.date
              ? tasks.filter((task) => {
                  const taskStart = formatDateForComparison(task.startDate);
                  const taskDue = formatDateForComparison(task.dueDate);
                  if (!dayTimestamp) return false;
                  if (taskStart && taskDue)
                    return dayTimestamp >= taskStart && dayTimestamp <= taskDue;
                  if (taskDue) return dayTimestamp === taskDue;
                  if (taskStart) return dayTimestamp >= taskStart; // Adjusted for ongoing tasks
                  return false;
                })
              : [];
          const displayedTasksCount = tasksToDisplayInSlots.filter(
            (t) => t
          ).length;
          const moreTasksCount =
            allTasksForActualDay.length - displayedTasksCount;

          const isToday =
            dayInfo.date &&
            formatDateForComparison(new Date()) === dayTimestamp;

          return (
            <div
              key={dayInfo.key}
              className={`bg-slate-800 p-1 sm:p-1.5 relative flex flex-col min-h-[80px] sm:min-h-[120px] overflow-hidden
                ${
                  dayInfo.isCurrentMonth
                    ? "text-slate-200"
                    : "text-slate-600 bg-slate-800/70"
                }
                ${isToday ? "bg-indigo-900/30 border border-indigo-600" : ""}
                border-t border-l border-slate-700 group`}
              onClick={(e) => {
                if (
                  e.currentTarget === e.target && // Check that the click is directly on this element
                  dayInfo.isCurrentMonth
                ) {
                  handleAddTask(dayInfo.date);
                }
              }}
            >
              {dayInfo.isCurrentMonth && (
                <span
                  className={`text-xs font-medium mb-1 self-end ${
                    isToday ? "text-indigo-300 font-bold" : "text-slate-400"
                  }`}
                >
                  {dayInfo.day}
                </span>
              )}
              <div className="task-list space-y-0.5 sm:space-y-1 flex-grow text-[10px] sm:text-[11px] leading-tight">
                {tasksToDisplayInSlots.map((task, slotIndex) => {
                  if (!task) {
                    return (
                      <div
                        key={`empty-slot-${dayInfo.key}-${slotIndex}`}
                        className="h-[18px] sm:h-[22px]"
                      ></div>
                    ); // Placeholder for empty slot
                  }

                  // Copied and adapted rounding logic from previous version
                  const taskStartTs = formatDateForComparison(task.startDate);
                  const taskDueTs = formatDateForComparison(task.dueDate);
                  let roundingClass = "rounded";
                  if (
                    dayInfo.isCurrentMonth &&
                    dayTimestamp &&
                    taskStartTs &&
                    taskDueTs
                  ) {
                    if (taskStartTs === taskDueTs) roundingClass = "rounded";
                    else if (taskStartTs === dayTimestamp)
                      roundingClass = "rounded-l";
                    else if (taskDueTs === dayTimestamp)
                      roundingClass = "rounded-r";
                    else roundingClass = "";
                  } else if (
                    dayInfo.isCurrentMonth &&
                    dayTimestamp &&
                    taskStartTs &&
                    !taskDueTs &&
                    taskStartTs === dayTimestamp
                  ) {
                    roundingClass = "rounded";
                  } else if (
                    dayInfo.isCurrentMonth &&
                    dayTimestamp &&
                    !taskStartTs &&
                    taskDueTs &&
                    taskDueTs === dayTimestamp
                  ) {
                    roundingClass = "rounded";
                  }

                  const statusClass =
                    task.status === "done"
                      ? "bg-emerald-700"
                      : task.status === "inprogress"
                      ? "bg-blue-700"
                      : "bg-slate-600";

                  return (
                    <div
                      key={`${task.id}-${dayInfo.key}`}
                      className={`p-0.5 sm:p-1 ${roundingClass} ${statusClass} text-white truncate cursor-pointer hover:opacity-80`}
                      title={`${task.title}\nStatus: ${
                        task.status
                      }\nPriority: ${task.priority}${
                        task.dueDate
                          ? `\nDue: ${formatDate(task.dueDate, {
                              month: "short",
                              day: "numeric",
                            })}`
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          type: "taskDetail",
                          taskId: task.id,
                          taskData: task,
                          projectId: projectId,
                        });
                      }}
                    >
                      <div className="truncate font-medium">
                        {task.title}
                      </div>
                      {/* Display Assignee Info - Hidden on mobile for more space */}
                      <div className="hidden sm:block">
                        {(() => {
                          if (
                            projectMembers &&
                            projectMembers.length > 0 &&
                            task.assigneeId
                          ) {
                            const assignee = projectMembers.find(
                              (member) => member.id === task.assigneeId
                            );
                            if (assignee) {
                              return (
                                <div
                                  className="flex items-center mt-0.5"
                                  title={`Assigned to: ${assignee.firstName} ${
                                    assignee.lastName || ""
                                  }`}
                                >
                                  {assignee.imageUrl && (
                                    <Image
                                      src={assignee.imageUrl}
                                      alt={assignee.firstName || "Assignee"}
                                      width={12}
                                      height={12}
                                      className="w-3 h-3 rounded-full mr-1"
                                    />
                                  )}
                                  <span className="text-slate-300 text-[9px] overflow-hidden whitespace-nowrap overflow-ellipsis">
                                    {assignee.firstName}
                                  </span>
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  );
                })}
                {moreTasksCount > 0 && (
                  <div className="text-slate-400 text-[9px] sm:text-[10px] text-center mt-0.5 sm:mt-1">
                    + {moreTasksCount} more
                  </div>
                )}
              </div>
              {dayInfo.isCurrentMonth && (
                <button
                  className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-purple-400 p-0.5 rounded bg-slate-700/50 hover:bg-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask(dayInfo.date);
                  }}
                  title="Add task for this day"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* We will integrate the task modal later */}
    </div>
  );
};

export default CalendarPage;
