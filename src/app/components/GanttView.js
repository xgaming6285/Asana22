import React, { useMemo, useState, useEffect, useRef } from "react";
import { useModal } from "@/app/context/ModalContext";

// Date Utility Functions
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDate = (
  date,
  options = { year: "numeric", month: "short", day: "numeric" }
) => (date ? new Date(date).toLocaleDateString(undefined, options) : "N/A");

// Constants for layout
const DAY_WIDTH = 60; // Increased for better visibility
const TASK_ROW_HEIGHT = 72; // Increased for better spacing
const LIST_WIDTH = 480; // Increased width for better task info display

// Helper component for Assignee Avatar
const AssigneeAvatar = ({ assignee, size = "small" }) => {
  if (!assignee) return null;

  const initials = `${assignee.firstName?.charAt(0) || ""}${
    assignee.lastName?.charAt(0) || ""
  }`.toUpperCase();

  const sizeClasses = size === "small" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";

  return (
    <>
      {assignee.imageUrl ? (
        <img
          src={assignee.imageUrl}
          alt={`${assignee.firstName} ${assignee.lastName}`}
          className={`${sizeClasses} rounded-full border-2 border-white shadow-md`}
          title={`${assignee.firstName} ${assignee.lastName}`}
        />
      ) : initials ? (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center border-2 border-white shadow-md font-semibold`}
          title={`${assignee.firstName} ${assignee.lastName}`}
        >
          {initials}
        </div>
      ) : null}
    </>
  );
};

// Priority Indicator
const PriorityIndicator = ({ priority }) => {
  let gradientClasses = "from-gray-400 to-gray-600";
  let title = "Medium Priority";
  if (priority === "high") {
    gradientClasses = "from-red-400 to-red-600";
    title = "High Priority";
  } else if (priority === "low") {
    gradientClasses = "from-green-400 to-green-600";
    title = "Low Priority";
  }
  return (
    <div
      className={`w-4 h-4 bg-gradient-to-br ${gradientClasses} rounded-full shadow-sm`}
      title={title}
    ></div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  let gradientClasses = "from-slate-500 to-slate-700";
  let statusText = "To Do";

  switch (status) {
    case "in-progress":
      gradientClasses = "from-blue-500 to-blue-700";
      statusText = "In Progress";
      break;
    case "done":
      gradientClasses = "from-emerald-500 to-emerald-700";
      statusText = "Completed";
      break;
    default:
      statusText = "To Do";
  }

  return (
    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r ${gradientClasses} text-white shadow-sm`}>
      {statusText}
    </span>
  );
};

// Get task bar color based on view options
const getTaskBarColor = (task, viewOptions, assigneeColors) => {
  switch (viewOptions.colorBy) {
    case "priority":
      switch (task.priority) {
        case "high":
          return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500";
        case "low":
          return "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500";
        default:
          return "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500";
      }
    case "assignee":
      if (task.assigneeId && assigneeColors[task.assigneeId]) {
        return assigneeColors[task.assigneeId];
      }
      return "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500";
    case "status":
    default:
      switch (task.status) {
        case "in-progress":
          return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500";
        case "done":
          return "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500";
        default:
          return "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500";
      }
  }
};

// Generate assignee colors with gradients
const generateAssigneeColors = (projectMembers) => {
  const colors = [
    "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500",
    "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500",
    "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500",
    "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500",
    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500",
    "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500",
    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500",
    "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500",
  ];
  
  const assigneeColors = {};
  projectMembers.forEach((member, index) => {
    if (member?.id) {
      assigneeColors[member.id] = colors[index % colors.length];
    }
  });
  
  return assigneeColors;
};

const GanttView = ({ tasks, projectMembers, projectId, viewOptions, onTasksChange }) => {
  const { openModal } = useModal();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dateRange, setDateRange] = useState({ start: 0, end: 30 }); // Show 30 days at a time
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
  // Mouse drag scrolling state for timeline (horizontal)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollStart: 0 });
  const timelineRef = useRef(null);

  // Mouse drag scrolling state for task list (vertical)
  const [isTaskListDragging, setIsTaskListDragging] = useState(false);
  const [taskListDragStart, setTaskListDragStart] = useState({ y: 0, scrollStart: 0 });
  const taskListRef = useRef(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Generate assignee colors
  const assigneeColors = useMemo(() => 
    generateAssigneeColors(projectMembers), [projectMembers]
  );

  // Calculate the overall date range for the timeline
  const { overallMinDate, overallMaxDate, allDates } = useMemo(() => {
    if (!localTasks || localTasks.length === 0) {
      const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const maxDate = addDays(new Date(today.getFullYear(), today.getMonth() + 2, 0), 7);
      
      const dates = [];
      let currentDate = new Date(minDate);
      while (currentDate <= maxDate) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
      
      return {
        overallMinDate: minDate,
        overallMaxDate: maxDate,
        allDates: dates
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
    const adjustedMinDate = addDays(minDate, -14);
    const adjustedMaxDate = addDays(maxDate, 14);
    
    const dates = [];
    let currentDate = new Date(adjustedMinDate);
    while (currentDate <= adjustedMaxDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return {
      overallMinDate: adjustedMinDate,
      overallMaxDate: adjustedMaxDate,
      allDates: dates
    };
  }, [localTasks, today]);

  // Get visible dates based on current range
  const visibleDates = useMemo(() => {
    const daysToShow = viewOptions.zoom === "days" ? 21 : 
                      viewOptions.zoom === "weeks" ? 14 : 7;
    
    const startIndex = Math.max(0, currentDateIndex);
    const endIndex = Math.min(allDates.length, startIndex + daysToShow);
    
    return allDates.slice(startIndex, endIndex);
  }, [allDates, currentDateIndex, viewOptions.zoom]);

  // Get task position and width for the chart
  const getTaskPositionAndWidth = (taskStartDate, taskDueDate) => {
    if (!taskStartDate || !taskDueDate) return { left: 0, width: 0, visible: false };

    const startDate = new Date(taskStartDate);
    const endDate = new Date(taskDueDate);
    
    const startDayIndex = allDates.findIndex(date => 
      date.toDateString() === startDate.toDateString()
    );
    const endDayIndex = allDates.findIndex(date => 
      date.toDateString() === endDate.toDateString()
    );
    
    if (startDayIndex === -1 && endDayIndex === -1) {
      return { left: 0, width: 0, visible: false };
    }
    
    const visibleStartIndex = Math.max(startDayIndex - currentDateIndex, 0);
    const visibleEndIndex = Math.min(endDayIndex - currentDateIndex, visibleDates.length - 1);
    
    if (visibleStartIndex >= visibleDates.length || visibleEndIndex < 0) {
      return { left: 0, width: 0, visible: false };
    }
    
    const duration = Math.max(visibleEndIndex - visibleStartIndex + 1, 1);
    
    return {
      left: visibleStartIndex * DAY_WIDTH,
      width: duration * DAY_WIDTH,
      visible: true
    };
  };

  // Handle task click to open modal
  const handleTaskClick = (task) => {
    if (isDragging || isTaskListDragging) return; // Prevent task modal from opening during drag
    
    openModal("taskDetail", {
      taskId: task.id,
      projectId,
      onTaskUpdated: () => {
        window.location.reload();
      },
    });
  };

  // Task hover handlers for detailed tooltip
  const handleTaskMouseEnter = (e, task) => {
    const assignee = projectMembers.find(m => m.id === task.assigneeId);
    setHoveredTask({ ...task, assignee }); // Store full task object with assignee info
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTaskMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
  };

  // Timeline mouse drag scrolling handlers (horizontal)
  const handleTimelineMouseDown = (e) => {
    if (e.target.closest('.task-bar')) return; // Don't start drag on task bars
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      scrollStart: currentDateIndex
    });
    e.preventDefault();
  };

  const handleTimelineMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const scrollSensitivity = 0.5; // Adjust this to change scroll speed
    const scrollDelta = Math.round(-deltaX * scrollSensitivity / DAY_WIDTH);
    const newScrollIndex = Math.max(0, Math.min(
      allDates.length - visibleDates.length,
      dragStart.scrollStart + scrollDelta
    ));
    
    setCurrentDateIndex(newScrollIndex);
  };

  const handleTimelineMouseUp = () => {
    setIsDragging(false);
  };

  // Task list mouse drag scrolling handlers (vertical)
  const handleTaskListMouseDown = (e) => {
    if (e.target.closest('.task-item')) return; // Don't start drag on task items
    
    setIsTaskListDragging(true);
    setTaskListDragStart({
      y: e.clientY,
      scrollStart: taskListRef.current ? taskListRef.current.scrollTop : 0
    });
    e.preventDefault();
  };

  const handleTaskListMouseMove = (e) => {
    if (!isTaskListDragging || !taskListRef.current) return;
    
    const deltaY = e.clientY - taskListDragStart.y;
    const scrollSensitivity = 1; // Adjust this to change scroll speed
    const newScrollTop = Math.max(0, taskListDragStart.scrollStart - deltaY * scrollSensitivity);
    
    taskListRef.current.scrollTop = newScrollTop;
  };

  const handleTaskListMouseUp = () => {
    setIsTaskListDragging(false);
  };

  // Add global mouse event listeners for timeline drag functionality
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleTimelineMouseMove);
      document.addEventListener('mouseup', handleTimelineMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleTimelineMouseMove);
        document.removeEventListener('mouseup', handleTimelineMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, dragStart, allDates.length, visibleDates.length]);

  // Add global mouse event listeners for task list drag functionality
  useEffect(() => {
    if (isTaskListDragging) {
      document.addEventListener('mousemove', handleTaskListMouseMove);
      document.addEventListener('mouseup', handleTaskListMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleTaskListMouseMove);
        document.removeEventListener('mouseup', handleTaskListMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isTaskListDragging, taskListDragStart]);

  // Auto-navigate to today's date when component mounts or dates change
  useEffect(() => {
    if (allDates.length > 0) {
      const todayIndex = allDates.findIndex(date => 
        date.toDateString() === today.toDateString()
      );
      if (todayIndex !== -1) {
        // Position today's date about 1/3 from the left instead of centered
        const leftSidedIndex = Math.max(0, todayIndex - Math.floor(visibleDates.length / 3));
        setCurrentDateIndex(leftSidedIndex);
      }
    }
  }, [allDates, today, visibleDates.length]); // Only run when these dependencies change

  // Navigation functions
  const goToPrevious = () => {
    setCurrentDateIndex(prev => Math.max(0, prev - 7));
  };

  const goToNext = () => {
    setCurrentDateIndex(prev => Math.min(allDates.length - visibleDates.length, prev + 7));
  };

  const goToToday = () => {
    const todayIndex = allDates.findIndex(date => 
      date.toDateString() === today.toDateString()
    );
    if (todayIndex !== -1) {
      // Position today's date about 1/3 from the left instead of centered
      const leftSidedIndex = Math.max(0, todayIndex - Math.floor(visibleDates.length / 3));
      setCurrentDateIndex(leftSidedIndex);
    }
  };

  if (!localTasks || localTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tasks to display</h3>
          <p className="text-slate-400">Create your first task to see it in the Gantt chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Add CSS to hide scrollbars */}
      <style jsx>{`
        .hide-scrollbar {
          /* Hide scrollbar for Chrome, Safari and Opera */
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>

      {/* Header with Navigation */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border-b-2 border-slate-500">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white">Gantt Timeline</h3>
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={goToPrevious}
                disabled={currentDateIndex === 0}
                className="p-2 rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-md transition-all duration-200 shadow-lg"
              >
                Today
              </button>
              <button
                onClick={goToNext}
                disabled={currentDateIndex >= allDates.length - visibleDates.length}
                className="p-2 rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            {visibleDates.length > 0 && (
              <span>
                {formatDate(visibleDates[0], { month: 'short', day: 'numeric' })} - {formatDate(visibleDates[visibleDates.length - 1], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Task List */}
        <div
          className="flex-shrink-0 bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-sm border-r-2 border-slate-500 flex flex-col"
          style={{ width: LIST_WIDTH }}
        >
          {/* Task List Header */}
          <div className="p-6 border-b border-slate-600/50 flex-shrink-0">
            <h4 className="text-lg font-semibold text-white">Tasks Overview</h4>
            <p className="text-sm text-slate-400 mt-1">{localTasks.length} tasks total</p>
          </div>

          {/* Task List Content with Drag Scrolling */}
          <div 
            ref={taskListRef}
            className={`flex-1 overflow-y-auto hide-scrollbar relative ${isTaskListDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleTaskListMouseDown}
          >
            {localTasks.map((task, index) => (
              <div
                key={task.id}
                className="task-item group border-b border-slate-700/30 p-6 hover:bg-slate-700/20 cursor-pointer transition-all duration-300"
                style={{ minHeight: TASK_ROW_HEIGHT }}
                onClick={() => handleTaskClick(task)}
                onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                onMouseMove={handleTaskMouseMove}
                onMouseLeave={handleTaskMouseLeave}
              >
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <PriorityIndicator priority={task.priority} />
                      <h5 className="font-semibold text-white text-base truncate group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h5>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge status={task.status} />
                    </div>
                    
                    {task.startDate && task.dueDate && (
                      <div className="text-sm text-slate-400">
                        <span className="font-medium">
                          {formatDate(task.startDate, { month: 'short', day: 'numeric' })} → {formatDate(task.dueDate, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {task.assigneeId && projectMembers.find(m => m.id === task.assigneeId) && (
                      <AssigneeAvatar 
                        assignee={projectMembers.find(m => m.id === task.assigneeId)} 
                        size="small"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Task list drag instruction overlay */}
            {!isTaskListDragging && localTasks.length > 5 && (
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm text-slate-300 px-3 py-2 rounded-lg text-xs pointer-events-none opacity-60">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
                  </svg>
                  Drag to scroll
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-800/40 to-slate-900/40">
          {/* Date Headers */}
          <div className="flex-shrink-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-b border-slate-600/50">
            <div className="flex">
              {visibleDates.map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 px-3 py-4 text-center border-r border-slate-600/30 transition-all duration-200 ${
                      isToday ? 'bg-gradient-to-b from-indigo-500/30 to-indigo-600/30 text-indigo-200' : 'text-slate-300'
                    }`}
                    style={{ width: DAY_WIDTH }}
                  >
                    <div className={`text-xs font-semibold ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${isToday ? 'text-white' : 'text-slate-200'}`}>
                      {date.getDate()}
                    </div>
                    {isToday && (
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mx-auto mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Content */}
          <div 
            ref={timelineRef}
            className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleTimelineMouseDown}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {visibleDates.map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 border-r transition-all duration-200 ${
                      isToday 
                        ? 'border-indigo-400/60 bg-indigo-500/5' 
                        : 'border-slate-700/40'
                    }`}
                    style={{ width: DAY_WIDTH }}
                  />
                );
              })}
            </div>

            {/* Task Bars */}
            <div className="relative h-full overflow-y-auto hide-scrollbar">
              {localTasks.map((task, index) => {
                if (!task.startDate || !task.dueDate) return null;
                
                const { left, width, visible } = getTaskPositionAndWidth(task.startDate, task.dueDate);
                if (!visible) return null;
                
                const isHovered = hoveredTask?.id === task.id;
                const assignee = projectMembers.find(m => m.id === task.assigneeId);
                
                return (
                  <div
                    key={task.id}
                    className={`task-bar absolute rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                      getTaskBarColor(task, viewOptions, assigneeColors)
                    } ${isHovered ? 'z-10 transform scale-105 shadow-2xl' : 'shadow-lg'} border border-white/10 flex flex-col justify-center`}
                    style={{
                      left: left + 8, // Add some padding from the left edge of the cell
                      width: Math.max(width - 16, 60), // Ensure a minimum width, reduce width for padding
                      top: index * TASK_ROW_HEIGHT + 12, // Adjust top position for vertical centering
                      height: TASK_ROW_HEIGHT - 24, // Reduce height for vertical padding and to make it look more like a bar
                    }}
                    onClick={() => handleTaskClick(task)}
                    onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                    onMouseMove={handleTaskMouseMove}
                    onMouseLeave={handleTaskMouseLeave}
                  >
                    <div className="px-3 py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-semibold truncate flex-1 mr-2">
                          {task.title}
                        </span>
                        {assignee && (
                          <div className="flex-shrink-0">
                            <AssigneeAvatar 
                              assignee={assignee} 
                              size="small"
                            />
                          </div>
                        )}
                      </div>
                      {task.description && width > 150 && (
                        <p className="text-white/70 text-xs mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Progress indicator */}
                    {task.status === 'done' && (
                      <div className="absolute inset-0 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Today indicator line */}
            {(() => {
              const todayIndex = visibleDates.findIndex(date => 
                date.toDateString() === today.toDateString()
              );
              if (todayIndex !== -1) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 z-20 shadow-lg pointer-events-none"
                    style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 }}
                  >
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-400 rounded-full shadow-lg animate-pulse" />
                  </div>
                );
              }
              return null;
            })()}

            {/* Timeline drag instruction overlay (shows when not dragging) */}
            {!isDragging && (
              <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm text-slate-300 px-3 py-2 rounded-lg text-xs pointer-events-none opacity-60">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                  </svg>
                  Click & drag to scroll
                </div>
              </div>
            )}
          </div>
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
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 min-w-16">Status:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  hoveredTask.status === 'done' 
                    ? 'bg-green-900/50 text-green-300' 
                    : hoveredTask.status === 'in-progress'
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-slate-700/50 text-slate-300'
                }`}>
                  {hoveredTask.status === 'in-progress' ? 'In Progress' : 
                   hoveredTask.status === 'done' ? 'Completed' : 
                   hoveredTask.status || 'To Do'}
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
                  {hoveredTask.priority?.charAt(0).toUpperCase() + hoveredTask.priority?.slice(1) || 'Medium'}
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
                    <AssigneeAvatar assignee={hoveredTask.assignee} size="small" />
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
    </div>
  );
};

export default GanttView;