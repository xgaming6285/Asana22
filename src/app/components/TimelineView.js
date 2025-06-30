import React, { useMemo, useState, useEffect } from "react";
import { useModal } from "@/app/context/ModalContext";

// Date Utility Functions (can be expanded or moved to a separate utils file)
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay(); // 0 = Sunday, 1 = Monday, ...
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDate = (
  date,
  options = { year: "numeric", month: "short", day: "numeric" }
) => (date ? new Date(date).toLocaleDateString(undefined, options) : "N/A");

// Function to get ISO week number
const getISOWeek = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const DAY_WIDTH = 60; // px, width of a single day column (Increased from 50)
const TASK_HEIGHT = 44; // px, height of a task bar (Increased from 40)
const TASK_GAP = 8; // px, gap between task bars (Increased from 5)
const HEADER_ROW_HEIGHT = 48; // Adjusted for better proportions (Increased from 40)

// Helper component for Assignee Avatar/Initials
const AssigneeAvatar = ({ assignee }) => {
  if (!assignee) return null;

  const initials = `${assignee.firstName?.charAt(0) || ""}${
    assignee.lastName?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <>
      {assignee.imageUrl ? (
        <img
          src={assignee.imageUrl}
          alt={`${assignee.firstName} ${assignee.lastName}`}
          className="w-5 h-5 rounded-full mr-1.5 border border-slate-300"
          title={`Assigned to: ${assignee.firstName} ${assignee.lastName}`}
        />
      ) : initials ? (
        <div
          className="w-5 h-5 rounded-full bg-slate-600 text-white text-[10px] flex items-center justify-center mr-1.5 border border-slate-400"
          title={`Assigned to: ${assignee.firstName} ${assignee.lastName}`}
        >
          {initials}
        </div>
      ) : null}
    </>
  );
};

// Helper for Priority Indicator
const PriorityIndicator = ({ priority }) => {
  let bgColor = "bg-gray-400"; // Default for 'medium' or undefined
  let title = "Medium Priority";
  if (priority === "high") {
    bgColor = "bg-red-500";
    title = "High Priority";
  } else if (priority === "low") {
    bgColor = "bg-green-500";
    title = "Low Priority";
  }
  return (
    <span
      className={`w-2.5 h-2.5 ${bgColor} rounded-full inline-block mr-1.5`}
      title={title}
    ></span>
  );
};

// Helper for Status styling (can be expanded)
const getStatusStyles = (status) => {
  let baseClasses = "bg-indigo-500 hover:bg-indigo-400"; // Default for 'todo'
  if (status === "inprogress") {
    baseClasses = "bg-blue-500 hover:bg-blue-400";
  } else if (status === "done") {
    baseClasses = "bg-emerald-600 hover:bg-emerald-500";
  }
  return baseClasses;
};

const TimelineView = ({ tasks, projectId, onTasksChange }) => {
  const { openModal } = useModal();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState(null); // Stores { task, originalX, taskElementWidth }
  const [hoveredTask, setHoveredTask] = useState(null); // For tooltip
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // For tooltip positioning

  useEffect(() => {
    // When the tasks prop from parent changes (e.g., after save & refetch),
    // update localTasks and reset any ongoing drag operation.
    setLocalTasks(tasks);
    setDraggedTaskInfo(null); // Ensure any drag state is cleared on external task refresh
  }, [tasks]); // Dependency on the parent's tasks prop

  // const [viewMode, setViewMode] = useState('days'); // For future zoom functionality
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0); // Normalize once
    return t;
  }, []);

  // Calculate the overall date range for the timeline
  const { overallMinDate, overallMaxDate } = useMemo(() => {
    if (!localTasks || localTasks.length === 0) {
      return {
        overallMinDate: new Date(today.getFullYear(), today.getMonth(), 1),
        overallMaxDate: addDays(
          new Date(today.getFullYear(), today.getMonth() + 2, 0),
          7
        ), // End of next month + 7 days
      };
    }
    let minDate = localTasks[0]?.startDate
      ? new Date(localTasks[0].startDate)
      : new Date(today);
    let maxDate = localTasks[0]?.dueDate
      ? new Date(localTasks[0].dueDate)
      : addDays(new Date(today), 30);
    localTasks.forEach((task) => {
      if (task.startDate) {
        const sDate = new Date(task.startDate);
        if (sDate < minDate) minDate = sDate;
      }
      if (task.dueDate) {
        const dDate = new Date(task.dueDate);
        if (dDate > maxDate) maxDate = dDate;
      }
    });
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);
    return {
      overallMinDate: addDays(minDate, -7),
      overallMaxDate: addDays(maxDate, 14), // Increased buffer for weeks view
    };
  }, [localTasks, today]);

  // Generate an array of date objects for the timeline header
  const dateHeaders = useMemo(() => {
    const dates = [];
    let currentDate = new Date(overallMinDate);
    while (currentDate <= overallMaxDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    return dates;
  }, [overallMinDate, overallMaxDate]);

  // Generate month headers
  const monthHeaders = useMemo(() => {
    if (dateHeaders.length === 0) return [];
    const months = [];
    let currentMonth = -1,
      currentYear = -1,
      daySpan = 0;
    dateHeaders.forEach((date, index) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      if (month !== currentMonth || year !== currentYear) {
        if (currentMonth !== -1) {
          months.push({
            name: new Date(currentYear, currentMonth).toLocaleDateString(
              undefined,
              { month: "long", year: "numeric" }
            ),
            span: daySpan,
          });
        }
        currentMonth = month;
        currentYear = year;
        daySpan = 1;
      } else {
        daySpan++;
      }
      if (index === dateHeaders.length - 1) {
        months.push({
          name: new Date(currentYear, currentMonth).toLocaleDateString(
            undefined,
            { month: "long", year: "numeric" }
          ),
          span: daySpan,
        });
      }
    });
    return months;
  }, [dateHeaders]);

  const weekHeaders = useMemo(() => {
    if (dateHeaders.length === 0) return [];
    const weeks = [];
    let currentWeek = -1,
      currentYearForWeek = -1,
      daySpan = 0,
      weekStartDate = null;

    dateHeaders.forEach((date, index) => {
      const week = getISOWeek(date);
      const year = date.getFullYear(); // Year for week comparison can be tricky with ISO weeks, simplify for now

      if (week !== currentWeek || year !== currentYearForWeek) {
        if (currentWeek !== -1) {
          weeks.push({
            name: `W${currentWeek} (${formatDate(weekStartDate, {
              month: "short",
              day: "numeric",
            })})`,
            span: daySpan,
          });
        }
        currentWeek = week;
        currentYearForWeek = year;
        weekStartDate = date;
        daySpan = 1;
      } else {
        daySpan++;
      }
      if (index === dateHeaders.length - 1) {
        weeks.push({
          name: `W${currentWeek} (${formatDate(weekStartDate, {
            month: "short",
            day: "numeric",
          })})`,
          span: daySpan,
        });
      }
    });
    return weeks;
  }, [dateHeaders]);

  const totalTimelineWidth = dateHeaders.length * DAY_WIDTH;
  const totalHeaderHeight = HEADER_ROW_HEIGHT * 3; // For Month, Week, Day rows

  const getTaskPositionAndWidth = (taskStartDate, taskDueDate) => {
    const startDate = taskStartDate ? new Date(taskStartDate) : null;
    const dueDate = taskDueDate ? new Date(taskDueDate) : null;
    if (!startDate || !dueDate || startDate > dueDate) {
      const sDate = startDate ? new Date(startDate) : new Date(overallMinDate);
      sDate.setHours(0, 0, 0, 0);
      const startIdx = dateHeaders.findIndex(
        (d) => d.getTime() === sDate.getTime()
      );
      return { left: Math.max(0, startIdx) * DAY_WIDTH, width: DAY_WIDTH * 2 };
    }
    const sDateNorm = new Date(startDate);
    sDateNorm.setHours(0, 0, 0, 0);
    const dDateNorm = new Date(dueDate);
    dDateNorm.setHours(0, 0, 0, 0);

    const startIdx = dateHeaders.findIndex(
      (d) => d.getTime() === sDateNorm.getTime()
    );
    const endIdx = dateHeaders.findIndex(
      (d) => d.getTime() === dDateNorm.getTime()
    );

    if (startIdx === -1 || endIdx === -1)
      return { left: 0, width: DAY_WIDTH * 2 };
    const left = startIdx * DAY_WIDTH;
    const width = (endIdx - startIdx + 1) * DAY_WIDTH;
    return { left, width };
  };

  if (!localTasks) {
    return (
      <p className="text-slate-400 text-center py-10">
        Loading tasks or no tasks to display.
      </p>
    );
  }

  const handleTaskClick = (task) => {
    openModal({
      type: "taskDetail",
      taskId: task.id,
      taskData: task,
      projectId: projectId,
    });
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    setDraggedTaskInfo({
      task,
      taskStartX: e.clientX,
      taskElementId: e.currentTarget.id,
    });
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedTaskInfo) {
      console.warn("handleDrop called but draggedTaskInfo is null.");
      return;
    }

    const taskIdFromDataTransfer = e.dataTransfer.getData("taskId");
    const {
      task: currentDraggedTask,
      taskStartX,
      taskElementId: draggedTaskElementId,
    } = draggedTaskInfo;

    if (
      !currentDraggedTask ||
      currentDraggedTask.id.toString() !== taskIdFromDataTransfer
    ) {
      console.error(
        "Dragged task mismatch or not found.",
        "Task ID from dataTransfer:",
        taskIdFromDataTransfer,
        "Task ID from draggedTaskInfo:",
        currentDraggedTask ? currentDraggedTask.id.toString() : "undefined",
        "Dragged Task Object:",
        currentDraggedTask
      );

      if (draggedTaskElementId) {
        const el = document.getElementById(draggedTaskElementId);
        if (el) el.classList.remove("dragging");
      }
      setDraggedTaskInfo(null);
      return;
    }

    const timelineGrid = e.currentTarget;
    const timelineRect = timelineGrid.getBoundingClientRect();

    const dropXAbsolute = e.clientX;
    const dragDeltaX = dropXAbsolute - taskStartX;

    const taskElement = document.getElementById(draggedTaskElementId);
    if (!taskElement) {
      console.error("Could not find task element for offset calculation.");
      if (draggedTaskElementId) {
        const el = document.getElementById(draggedTaskElementId);
        if (el) el.classList.remove("dragging");
      }
      setDraggedTaskInfo(null);
      return;
    }
    const initialTaskLeft = parseFloat(taskElement.style.left || "0");
    const newVisualLeft = initialTaskLeft + dragDeltaX;

    const dayIndex = Math.max(0, Math.round(newVisualLeft / DAY_WIDTH));

    if (dayIndex >= dateHeaders.length) {
      console.warn("Drop position out of timeline bounds");
      if (draggedTaskElementId) {
        const el = document.getElementById(draggedTaskElementId);
        if (el) el.classList.remove("dragging");
      }
      setDraggedTaskInfo(null);
      return;
    }

    const selectedDateFromGrid = dateHeaders[dayIndex]; // This is a Date object, local timezone, at local midnight from grid construction

    // Create new UTC dates directly from the selected grid date's components
    const newUTCStartDate = new Date(
      Date.UTC(
        selectedDateFromGrid.getFullYear(),
        selectedDateFromGrid.getMonth(),
        selectedDateFromGrid.getDate()
      )
    );

    // Parse original task dates as Date objects. Assuming they are ISO strings (which they should be after fetch/update).
    const originalTaskStartDateObj = new Date(currentDraggedTask.startDate);
    const originalTaskDueDateObj = new Date(currentDraggedTask.dueDate);

    // Calculate duration in UTC to avoid DST or timezone shift issues with direct getTime() difference on potentially local Date objects
    const originalUTCDueDateTime = Date.UTC(
      originalTaskDueDateObj.getUTCFullYear(),
      originalTaskDueDateObj.getUTCMonth(),
      originalTaskDueDateObj.getUTCDate(),
      originalTaskDueDateObj.getUTCHours(),
      originalTaskDueDateObj.getUTCMinutes(),
      originalTaskDueDateObj.getUTCSeconds()
    );
    const originalUTCStartDateTime = Date.UTC(
      originalTaskStartDateObj.getUTCFullYear(),
      originalTaskStartDateObj.getUTCMonth(),
      originalTaskStartDateObj.getUTCDate(),
      originalTaskStartDateObj.getUTCHours(),
      originalTaskStartDateObj.getUTCMinutes(),
      originalTaskStartDateObj.getUTCSeconds()
    );

    const duration = originalUTCDueDateTime - originalUTCStartDateTime;
    const newUTCDueDate = new Date(newUTCStartDate.getTime() + duration);

    const newStartDateISO = newUTCStartDate.toISOString(); // Will be YYYY-MM-DDT00:00:00.000Z
    const newDueDateISO = newUTCDueDate.toISOString(); // Will also be UTC midnight based if original task was aligned

    const updatedLocalTasksArray = localTasks.map((t) =>
      t.id.toString() === taskIdFromDataTransfer
        ? { ...t, startDate: newStartDateISO, dueDate: newDueDateISO }
        : t
    );

    setLocalTasks(updatedLocalTasksArray);

    if (onTasksChange) {
      onTasksChange(updatedLocalTasksArray);
    }

    if (draggedTaskElementId) {
      const el = document.getElementById(draggedTaskElementId);
      if (el) el.classList.remove("dragging");
    }
    setDraggedTaskInfo(null);
  };

  const handleDragEnd = (e) => {
    const draggedElement = e.currentTarget;
    draggedElement.classList.remove("dragging");

    if (draggedTaskInfo) {
      if (
        draggedTaskInfo.taskElementId &&
        draggedTaskInfo.taskElementId !== draggedElement.id
      ) {
        const el = document.getElementById(draggedTaskInfo.taskElementId);
        if (el) el.classList.remove("dragging");
      }
      setDraggedTaskInfo(null);
    }
  };

  const scrollToToday = () => {
    const todayIndex = dateHeaders.findIndex(
      (date) => date.getTime() === today.getTime()
    );
    
    if (todayIndex !== -1) {
      const scrollContainer = document.querySelector('.timeline-view .overflow-x-auto');
      if (scrollContainer) {
        const todayPosition = todayIndex * DAY_WIDTH;
        const containerWidth = scrollContainer.clientWidth;
        const scrollPosition = Math.max(0, todayPosition - containerWidth / 2 + DAY_WIDTH / 2);
        
        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleTaskMouseEnter = (e, task) => {
    setHoveredTask(task);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTaskMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
  };

  return (
    <div className="timeline-view bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl relative border border-slate-700/50">
      {/* Today Button */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={scrollToToday}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today
        </button>
      </div>

      {/* Scrollable Container with Custom Scrollbar */}
      <div className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-indigo-500 scrollbar-thumb-rounded-full hover:scrollbar-thumb-indigo-400">
        {/* Timeline Header */}
        <div
          className="timeline-header-container sticky top-0 z-20 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700/95 border-b-2 border-slate-600/80 shadow-lg backdrop-blur-md"
          style={{ width: totalTimelineWidth, height: totalHeaderHeight }}
        >
          {/* Month Row */}
          <div
            className="timeline-month-row flex border-b border-slate-600/50"
            style={{ width: totalTimelineWidth, height: HEADER_ROW_HEIGHT }}
          >
            {monthHeaders.map((month, index) => (
              <div
                key={`month-${index}`}
                className="month-cell border-r border-slate-600/60 p-3 text-sm font-bold text-slate-100 flex items-center justify-center bg-gradient-to-b from-slate-700/90 to-slate-800/90 backdrop-blur-sm hover:from-slate-600/90 hover:to-slate-700/90 transition-all duration-300"
                style={{
                  width: month.span * DAY_WIDTH,
                  height: HEADER_ROW_HEIGHT,
                }}
              >
                <span className="text-center leading-tight">{month.name}</span>
              </div>
            ))}
          </div>
          {/* Week Row */}
          <div
            className="timeline-week-row flex border-b border-slate-600/40"
            style={{ width: totalTimelineWidth, height: HEADER_ROW_HEIGHT }}
          >
            {weekHeaders.map((week, index) => (
              <div
                key={`week-${index}`}
                className="week-cell border-r border-slate-600/50 p-2 text-xs font-semibold text-slate-300 flex items-center justify-center bg-gradient-to-b from-slate-800/80 to-slate-700/80 backdrop-blur-sm hover:text-slate-200 hover:bg-slate-700/60 transition-all duration-200"
                style={{
                  width: week.span * DAY_WIDTH,
                  height: HEADER_ROW_HEIGHT,
                }}
              >
                <span className="text-center leading-tight">{week.name}</span>
              </div>
            ))}
          </div>
          {/* Day Row */}
          <div
            className="timeline-day-row flex"
            style={{ width: totalTimelineWidth, height: HEADER_ROW_HEIGHT }}
          >
            {dateHeaders.map((date, index) => {
              const isToday = date.getTime() === today.getTime();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={`day-${index}`}
                  className={`timeline-date-cell border-r border-slate-600/50 p-2 text-xs flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 group
                              ${
                                isToday
                                  ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg ring-2 ring-indigo-400/50 scale-105"
                                  : isWeekend
                                  ? "bg-gradient-to-b from-slate-800/70 to-slate-700/70 text-slate-400 hover:from-slate-700/70 hover:to-slate-600/70"
                                  : "bg-gradient-to-b from-slate-800/60 to-slate-700/60 text-slate-300 hover:from-slate-700/60 hover:to-slate-600/60 hover:text-slate-200"
                              }`}
                  style={{
                    width: DAY_WIDTH,
                    textAlign: "center",
                    height: HEADER_ROW_HEIGHT,
                  }}
                >
                  <div
                    className={`font-bold text-lg mb-0.5 ${
                      isToday ? "text-white" : isWeekend ? "text-slate-400" : ""
                    } group-hover:scale-110 transition-transform duration-200`}
                  >
                    {date.getDate()}
                  </div>
                  <div
                    className={`${
                      isToday 
                        ? "text-indigo-100" 
                        : isWeekend 
                        ? "text-slate-500" 
                        : "text-slate-400"
                    } text-[10px] uppercase tracking-wider font-medium`}
                  >
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks Container */}
        <div
          className="timeline-tasks-container relative bg-gradient-to-br from-slate-800/30 to-slate-900/50"
          style={{
            width: totalTimelineWidth,
            minHeight: Math.max(
              localTasks.length * (TASK_HEIGHT + TASK_GAP) + TASK_GAP + 40,
              400 // Minimum height to ensure grid shows even with no tasks
            ),
            // Enhanced background grid pattern that starts immediately
            backgroundImage: `
              linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, transparent 50%, rgba(168, 85, 247, 0.03) 100%)
            `,
            backgroundSize: `
              100% ${TASK_HEIGHT + TASK_GAP}px,
              ${DAY_WIDTH}px 100%,
              200px 200px
            `,
            backgroundPosition: `
              0 0,
              0 0,
              0 0
            `,
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Continuous vertical grid lines */}
          {dateHeaders.map((_, index) => (
            <div
              key={`vertical-line-${index}`}
              className="absolute top-0 bottom-0 border-l border-slate-600/15"
              style={{
                left: index * DAY_WIDTH,
              }}
            ></div>
          ))}

          {/* Continuous horizontal grid lines */}
          {Array.from({ length: Math.max(localTasks.length + 5, 8) }, (_, index) => (
            <div
              key={`horizontal-line-${index}`}
              className="absolute left-0 right-0 border-t border-slate-600/10"
              style={{
                top: index * (TASK_HEIGHT + TASK_GAP),
              }}
            ></div>
          ))}

          {/* Today indicator line */}
          {(() => {
            const todayIndex = dateHeaders.findIndex(
              (date) => date.getTime() === today.getTime()
            );
            if (todayIndex !== -1) {
              return (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 z-10 shadow-lg"
                  style={{
                    left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 - 1,
                  }}
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow-lg border-2 border-white"></div>
                </div>
              );
            }
            return null;
          })()}

          {localTasks.map((task, index) => {
            const { left, width } = getTaskPositionAndWidth(
              task.startDate,
              task.dueDate
            );
            const taskStatusStyles = getStatusStyles(task.status);

            return (
              <div
                key={task.id}
                id={`timeline-task-${task.id}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                onMouseMove={handleTaskMouseMove}
                onMouseLeave={handleTaskMouseLeave}
                className={`timeline-task-item absolute ${taskStatusStyles} rounded-xl text-white text-sm px-4 py-2 overflow-hidden whitespace-nowrap cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 ease-out flex items-center group transform hover:scale-105 hover:z-20 border border-white/10 backdrop-blur-sm`}
                style={{
                  top: index * (TASK_HEIGHT + TASK_GAP) + TASK_GAP,
                  left: left,
                  width: Math.max(width - 4, DAY_WIDTH * 0.8),
                  height: TASK_HEIGHT,
                  background: `linear-gradient(135deg, ${taskStatusStyles.includes('indigo') ? '#4f46e5' : taskStatusStyles.includes('blue') ? '#3b82f6' : '#059669'} 0%, ${taskStatusStyles.includes('indigo') ? '#6366f1' : taskStatusStyles.includes('blue') ? '#60a5fa' : '#10b981'} 100%)`,
                }}
                onClick={() => handleTaskClick(task)}
              >
                <PriorityIndicator priority={task.priority} />
                <AssigneeAvatar assignee={task.assignee} />
                <span className="truncate flex-grow font-medium">{task.title}</span>
                
                {/* Task completion indicator */}
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {task.status === 'done' && (
                    <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {task.status === 'inprogress' && (
                    <svg className="w-4 h-4 text-blue-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced Task Tooltip */}
      {hoveredTask && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 10,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 max-w-80 backdrop-blur-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold text-base leading-tight pr-2">
                {hoveredTask.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <PriorityIndicator priority={hoveredTask.priority} />
                {hoveredTask.status === 'done' && (
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 min-w-16">Status:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  hoveredTask.status === 'done' 
                    ? 'bg-green-900/50 text-green-300' 
                    : hoveredTask.status === 'inprogress'
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-slate-700/50 text-slate-300'
                }`}>
                  {hoveredTask.status || 'To Do'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 min-w-16">Priority:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  hoveredTask.priority === 'high' 
                    ? 'bg-red-900/50 text-red-300' 
                    : hoveredTask.priority === 'low'
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-slate-700/50 text-slate-300'
                }`}>
                  {hoveredTask.priority || 'Medium'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 min-w-16">Start:</span>
                <span className="text-slate-200">{formatDate(hoveredTask.startDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 min-w-16">Due:</span>
                <span className="text-slate-200">{formatDate(hoveredTask.dueDate)}</span>
              </div>
              
              {hoveredTask.assignee && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-16">Assignee:</span>
                  <div className="flex items-center gap-2">
                    <AssigneeAvatar assignee={hoveredTask.assignee} />
                    <span className="text-slate-200">
                      {hoveredTask.assignee.firstName} {hoveredTask.assignee.lastName}
                    </span>
                  </div>
                </div>
              )}
              
              {hoveredTask.description && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-xs">Description:</span>
                  <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                    {hoveredTask.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx global>{`
        .timeline-view .overflow-x-auto::-webkit-scrollbar {
          height: 12px;
        }
        
        .timeline-view .overflow-x-auto::-webkit-scrollbar-track {
          background: linear-gradient(90deg, rgba(51, 65, 85, 0.6), rgba(71, 85, 105, 0.8));
          border-radius: 12px;
          margin: 6px;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }
        
        .timeline-view .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          border-radius: 12px;
          border: 2px solid rgba(51, 65, 85, 0.6);
          transition: all 0.3s ease-in-out;
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }
        
        .timeline-view .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #a855f7, #d946ef);
          border: 2px solid rgba(51, 65, 85, 0.4);
          box-shadow: 0 6px 12px rgba(124, 58, 237, 0.4);
          transform: scaleY(1.1);
        }
        
        .timeline-view .overflow-x-auto::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #5b21b6, #7c2d12, #be185d);
          box-shadow: 0 2px 4px rgba(91, 33, 182, 0.5);
        }
        
        .timeline-view .overflow-x-auto::-webkit-scrollbar-corner {
          background: rgba(51, 65, 85, 0.8);
          border-radius: 6px;
        }
        
        /* Enhanced Firefox scrollbar styling */
        .timeline-view .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 rgba(51, 65, 85, 0.8);
        }

        /* Hide scrollbars on mobile devices while keeping touch scrolling */
        @media (max-width: 768px) {
          .timeline-view .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
          
          .timeline-view .overflow-x-auto {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
          
          /* Ensure touch scrolling still works */
          .timeline-view .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            overflow-x: scroll;
          }
        }
        
        .dragging {
          opacity: 0.7;
          cursor: grabbing !important;
          transform: scale(1.02);
          z-index: 100;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(99, 102, 241, 0.2);
          transition: none;
        }

        /* Task hover glow effect */
        .timeline-task-item:hover {
          filter: brightness(1.1) saturate(1.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 20px rgba(99, 102, 241, 0.3);
        }

        /* Header cell hover effects */
        .timeline-date-cell:hover {
          transform: translateY(-1px);
        }
      `}</style>
      
      {/* TODO: Add section/group headers if needed */}
      {/* TODO: Implement click on task to open details/edit modal - console.log added */}
      {/* TODO: Implement "Add Task" directly on timeline rows or sections */}
      {/* TODO: Implement Week view / Zoom levels (currently shows M/W/D always) */}
    </div>
  );
};

export default TimelineView;

// Consider moving more complex styling to globals.css or a CSS module
// Example CSS for scrollbars if needed:
/*
.timeline-view::-webkit-scrollbar {
  height: 8px;
}
.timeline-view::-webkit-scrollbar-thumb {
  background-color: #4f46e5; // indigo-600
  border-radius: 4px;
}
.timeline-view::-webkit-scrollbar-track {
  background-color: #374151; // gray-700
}
*/

// Helper CSS (can be added to a global CSS file or a <style jsx> block if preferred)
/*
.dragging {
  opacity: 0.6;
  cursor: grabbing !important;
}
*/

// Add a note about the .dragging class, e.g., in globals.css or a style tag.
// For example, in globals.css:
// .dragging {
//   opacity: 0.6;
//   cursor: grabbing !important;
// }
//
// Or within TimelineView.js using styled-jsx:
// <style jsx global>{`
//   .dragging {
//     opacity: 0.6;
//     cursor: grabbing !important;
//   }
// `}</style>

// Make sure the parent component (`ProjectTimelinePage.js`)
// will eventually handle a callback like `onTaskUpdated` to manage the "Save Changes" logic.
// For now, changes are only visual within `TimelineView`.
//
// Also, ensure `task.startDate` and `task.dueDate` are in a format that `new Date()` can parse correctly,
// ideally ISO strings. If they are already Date objects, that's fine.
// The updated dates are set as ISO strings.
