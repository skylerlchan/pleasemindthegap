import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';
import { TaskItem } from './TaskItem';
import { QuickTaskForm } from './QuickTaskForm';
import { EventListModal } from './EventListModal';
import { LiveTimeIndicator } from './LiveTimeIndicator';
import { formatTime, isToday, getTimeSlots, getTasksForTimeSlot, getHoldingTasks, convertTimeStringToHour, formatTimeSlotForDisplay } from '../utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, Menu, X } from 'lucide-react';

type CalendarView = 'day' | '3-day' | 'week';

interface CalendarProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onAddTask: (task: { title: string; deadline: string; project_id: string }) => void;
  onUpdateTask?: (taskId: string, updates: { deadline: string }) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  tasks, 
  projects, 
  onToggleTask, 
  onDeleteTask,
  onEditTask,
  onAddTask,
  onUpdateTask
}) => {
  const [view, setView] = useState<CalendarView>('3-day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showViewSelector, setShowViewSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showJumpToDate, setShowJumpToDate] = useState(false);
  const [eventModal, setEventModal] = useState<{ 
    isOpen: boolean; 
    tasks: Task[]; 
    date: Date; 
    hour: number; 
  }>({
    isOpen: false,
    tasks: [],
    date: new Date(),
    hour: 0
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force day view on mobile
  useEffect(() => {
    if (isMobile && view !== 'day') {
      setView('day');
    }
  }, [isMobile, view]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getViewDays = (): Date[] => {
    const days: Date[] = [];
    
    switch (view) {
      case 'day':
        days.push(new Date(currentDate));
        break;
      
      case '3-day':
        days.push(new Date(currentDate));
        const nextDay1 = new Date(currentDate);
        nextDay1.setDate(currentDate.getDate() + 1);
        days.push(nextDay1);
        const nextDay2 = new Date(currentDate);
        nextDay2.setDate(currentDate.getDate() + 2);
        days.push(nextDay2);
        break;
      
      case 'week':
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = currentDate.getDay();
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          days.push(date);
        }
        break;
    }
    
    return days;
  };

  const viewDays = getViewDays();
  const timeSlots = getTimeSlots();

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    // Always move by one day regardless of view
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const jumpToDate = (dateString: string) => {
    const newDate = new Date(dateString);
    setCurrentDate(newDate);
    setShowJumpToDate(false);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    const slotTasks = hour === -1 ? getHoldingTasks(tasks, date) : getTasksForTimeSlot(tasks, date, hour);
    if (slotTasks.length === 0) {
      setSelectedSlot({ date, hour });
    } else if (slotTasks.length > 2) {
      // Open modal if more than 2 tasks
      setEventModal({
        isOpen: true,
        tasks: slotTasks,
        date,
        hour
      });
    }
  };

  const handleQuickTaskSubmit = (taskData: { title: string; project_id: string }) => {
    if (!selectedSlot) return;
    
    const deadline = new Date(selectedSlot.date);
    deadline.setHours(selectedSlot.hour, 0, 0, 0);
    
    onAddTask({
      ...taskData,
      deadline: deadline.toISOString()
    });
    
    setSelectedSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, hour });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId } = data;
      
      if (taskId && onUpdateTask) {
        let newDeadline: Date;
        if (hour === -1) {
          // Dropping in holding slot
          newDeadline = new Date(date);
          newDeadline.setHours(23, 59, 0, 0);
        } else {
          newDeadline = new Date(date);
          newDeadline.setHours(hour, 0, 0, 0);
        }
        
        onUpdateTask(taskId, { deadline: newDeadline.toISOString() });
      }
    } catch (error) {
      console.error('Error handling task drop:', error);
    }
  };

  const getViewTitle = () => {
    const today = new Date();
    const isCurrentWeek = view === 'week' && 
      viewDays.some(day => day.toDateString() === today.toDateString());
    
    if (view === 'day') {
      if (isToday(currentDate)) {
        return 'Today';
      }
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    if (view === '3-day') {
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      if (isToday(viewDays[0]) && viewDays[2].toDateString() === dayAfterTomorrow.toDateString()) {
        return 'Next 3 Days';
      }
      
      return `${viewDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${viewDays[2].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    
    if (view === 'week') {
      if (isCurrentWeek) {
        return 'This Week';
      }
      
      const startDate = viewDays[0];
      const endDate = viewDays[6];
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()} - ${endDate.getDate()}`;
      } else {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }
    
    return '';
  };

  const isCurrentPeriod = () => {
    const today = new Date();
    return viewDays.some(day => day.toDateString() === today.toDateString());
  };

  return (
    <div className="flex flex-col bg-gray-50 md:bg-white md:rounded-xl md:shadow-lg md:border md:border-gray-200 md:h-auto">
      {/* Mobile Header - Full Width */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 py-2 md:p-6 md:bg-gray-50 md:dark:bg-gray-900">
        <div className="flex items-center justify-between">
          {/* Left: Title and Date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <CalendarIcon size={20} className="text-blue-600 md:hidden" />
              <CalendarIcon size={24} className="text-blue-600 hidden md:block" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">Calendar</h2>
            </div>
            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-200 truncate">{getViewTitle()}</p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2">
            {/* Mobile View Selector */}

            {!isMobile && (
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setView('day')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'day' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView('3-day')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === '3-day' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  3 Days
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'week' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  Week
                </button>
              </div>
            )}


            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-200"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button
                onClick={() => setShowJumpToDate(true)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:px-3 md:py-2 md:text-sm"
              >
                Jump to
              </button>
              
              {!isCurrentPeriod() && (
                <button
                  onClick={goToToday}
                  className="px-2 py-1 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors md:px-3 md:py-2 md:text-sm"
                >
                  Today
                </button>
              )}
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content - Scrollable */}
      <div 
        className="flex-1 overflow-hidden bg-white dark:bg-gray-900"
      >
        <div className={`h-full overflow-auto relative ${view === 'week' ? 'min-w-[800px]' : view === '2-day' ? 'min-w-[400px]' : 'min-w-[300px]'}`}>
          {/* Live Time Indicator */}
          <LiveTimeIndicator
            currentDate={currentDate}
            viewDays={viewDays}
            hourHeight={60}
            timeSlots={timeSlots}
          />
          
            {/* Day Headers - Sticky Top */}
            <div className={`sticky top-0 z-20 grid border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-sm`} style={{
              gridTemplateColumns: view === 'week' ? '60px repeat(7, 1fr)' : 
                                 view === '3-day' ? '60px repeat(3, 1fr)' : 
                                 '60px 1fr'
            }}>
              <div className="sticky left-0 z-30 p-3 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center min-w-0">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm">
                  <Clock size={16} className="text-gray-500 dark:text-gray-300" />
                </div>
              </div>
              {viewDays.map(date => (
                <div 
                  key={date.toISOString()} 
                  className={`p-2 text-center border-r border-gray-200 dark:border-gray-600 ${
                    isToday(date) ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                  style={{ padding: '12px 8px' }}
                >
                  <div className={`text-sm font-medium ${
                    isToday(date) ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {view === 'week' ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 
                     view === '3-day' ? date.toLocaleDateString('en-US', { weekday: 'short' }) :
                     date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className={`text-lg md:text-xl font-bold ${
                    isToday(date) ? 'text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-100'
                  }`}>
                    {date.getDate()}
                  </div>
                  {view !== 'day' && (
                    <div className={`text-sm hidden md:block ${
                      isToday(date) ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-300'
                    }`}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Regular Time Slots */}
            {/* Holding Slot - Above Time Slots */}
            <div className={`grid border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 z-30`} style={{
              gridTemplateColumns: view === 'week' ? '60px repeat(7, 1fr)' : 
                                 view === '3-day' ? '60px repeat(3, 1fr)' : 
                                 '60px 1fr'
            }}>
              <div className="sticky left-0 z-30 px-3 py-4 border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center min-w-0">
                <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold tracking-wide">HOLD</span>
              </div>
              {viewDays.map(date => {
                const holdingTasks = getHoldingTasks(tasks, date).filter(task => !task.completed);
                const isEmpty = holdingTasks.length === 0;
                const isSelected = selectedSlot?.date.toDateString() === date.toDateString() && selectedSlot?.hour === -1;
                const isDragOver = dragOverSlot?.date.toDateString() === date.toDateString() && dragOverSlot?.hour === -1;
                
                return (
                  <div 
                    key={`holding-${date.toISOString()}`}
                    className={`relative p-3 border-r border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-200 ${
                      isToday(date) ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800'
                    } ${isEmpty ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''} ${
                      isSelected ? 'bg-blue-100 dark:bg-blue-900/70 ring-2 ring-blue-300 dark:ring-blue-500' : ''
                    } ${isDragOver ? 'bg-green-100 dark:bg-green-900/70 ring-2 ring-green-300 dark:ring-green-500' : ''}`}
                    onClick={() => isEmpty && handleSlotClick(date, -1)}
                    onDragOver={(e) => handleDragOver(e, date, -1)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date, -1)}
                    style={{ height: '180px' }}
                  >
                    {isEmpty ? (
                      <div className="flex items-center justify-center h-full min-h-[120px]">
                        <div 
                          className="w-full h-10 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot({ date, hour: -1 });
                          }}
                        ></div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 h-full max-h-[168px] overflow-y-auto">
                        {holdingTasks.map(task => {
                          const project = getProjectById(task.project_id);
                          if (!project) return null;
                          
                          return (
                            <div
                              key={task.id}
                              className="w-full bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm flex-shrink-0"
                            >
                              <TaskItem
                                task={task}
                                project={project}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                                onEdit={onEditTask}
                                draggable={true}
                                compact={true}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {timeSlots.map(timeSlot => {
              const hour = convertTimeStringToHour(timeSlot);
              
              return (
                <div key={timeSlot} className="grid border-b border-gray-100 dark:border-gray-700" style={{
                  gridTemplateColumns: view === 'week' ? '60px repeat(7, 1fr)' : 
                                     view === '3-day' ? '60px repeat(3, 1fr)' : 
                                     '60px 1fr'
                }}>
                  {/* Time Label - Sticky */}
                  <div 
                    className="sticky left-0 z-10 px-2 py-3 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm min-w-0"
                    style={{ height: '60px' }}
                  >
                    <div className="text-center w-full">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">{formatTimeSlotForDisplay(timeSlot)}</span>
                    </div>
                  </div>
                  {viewDays.map(date => {
                    const allSlotTasks = getTasksForTimeSlot(tasks, date, hour).filter(task => !task.completed);
                    const maxVisibleTasks = view === 'week' ? 1 : 2; // Fewer tasks visible in week view
                    const slotTasks = allSlotTasks.slice(0, maxVisibleTasks);
                    const isEmpty = slotTasks.length === 0;
                    const hasMoreTasks = allSlotTasks.length > maxVisibleTasks;
                    const isSelected = selectedSlot?.date.toDateString() === date.toDateString() && selectedSlot?.hour === hour;
                    const isDragOver = dragOverSlot?.date.toDateString() === date.toDateString() && dragOverSlot?.hour === hour;
                    
                    return (
                      <div 
                        key={`${date.toISOString()}-${hour}`}
                        className={`relative p-1 border-r border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200 overflow-hidden ${
                          isToday(date) ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                        } ${isEmpty ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/50 ring-2 ring-blue-200 dark:ring-blue-500' : ''
                        } ${isDragOver ? 'bg-green-50 dark:bg-green-900/50 ring-2 ring-green-200 dark:ring-green-500' : ''}`}
                        onClick={() => {
                          if (isEmpty) {
                            handleSlotClick(date, hour);
                          } else if (hasMoreTasks) {
                            setEventModal({
                              isOpen: true,
                              tasks: allSlotTasks,
                              date,
                              hour
                            });
                          }
                        }}
                        onDragOver={(e) => handleDragOver(e, date, hour)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, date, hour)}
                        style={{ height: '60px' }}
                      >
                        <div className="flex h-full gap-2 p-2">
                          {slotTasks.map(task => {
                            const project = getProjectById(task.project_id);
                            if (!project) return null;
                            
                            return (
                              <div
                                key={task.id}
                                className="flex-1 min-w-0 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-500 shadow-sm"
                                style={{ 
                                  width: hasMoreTasks ? `${100 / (maxVisibleTasks + 1)}%` : `${100 / slotTasks.length}%`,
                                  maxWidth: hasMoreTasks ? `${100 / (maxVisibleTasks + 1)}%` : `${100 / slotTasks.length}%`
                                }}
                              >
                                <TaskItem
                                  task={task}
                                  project={project}
                                  onToggle={onToggleTask}
                                  onDelete={onDeleteTask}
                                  onEdit={onEditTask}
                                  draggable={true}
                                  compact={true}
                                />
                              </div>
                            );
                          })}
                          {hasMoreTasks && (
                            <div 
                              className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md border border-blue-200 dark:border-blue-600 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors px-2 py-1 w-fit min-w-[40px]"
                              style={{ 
                                width: 'auto',
                                maxWidth: 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventModal({
                                  isOpen: true,
                                  tasks: allSlotTasks,
                                  date,
                                  hour
                                });
                              }}
                            >
                              <span className="text-xs font-semibold">
                                +{allSlotTasks.length - maxVisibleTasks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Done Piles - One per date column */}
            <div className="grid border-t-2 border-gray-300 dark:border-gray-600" style={{
              gridTemplateColumns: view === 'week' ? '60px repeat(7, 1fr)' : 
                                 view === '3-day' ? '60px repeat(3, 1fr)' : 
                                 '60px 1fr'
            }}>
              {/* Done Pile Label - Sticky */}
              <div className="sticky left-0 z-10 px-2 py-4 border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center min-w-0">
                <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold tracking-wide">DONE</span>
              </div>
              
              {viewDays.map(date => {
                // Get all completed tasks for this specific date
                const completedTasks = tasks.filter(task => {
                  const taskDate = new Date(task.deadline);
                  return task.completed && taskDate.toDateString() === date.toDateString();
                });
                
                return (
                  <div 
                    key={`done-${date.toISOString()}`}
                    className={`p-3 border-r border-gray-300 dark:border-gray-600 min-h-[120px] ${
                      isToday(date) ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    {completedTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <span className="text-sm">No completed tasks</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-2">
                          {completedTasks.length} completed
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {completedTasks.map(task => {
                            const project = getProjectById(task.project_id);
                            if (!project) return null;
                            
                            return (
                              <div
                                key={task.id}
                                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm opacity-75"
                              >
                                <TaskItem
                                  task={task}
                                  project={project}
                                  onToggle={onToggleTask}
                                  onDelete={onDeleteTask}
                                  onEdit={onEditTask}
                                  compact={true}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add bottom padding for mobile */}
            <div className="h-20 md:h-0"></div>
        </div>
      </div>

      {/* Jump to Date Modal */}
      {showJumpToDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Jump to Date</h3>
              <button
                onClick={() => setShowJumpToDate(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  defaultValue={currentDate.toISOString().split('T')[0]}
                  onChange={(e) => jumpToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJumpToDate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={goToToday}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Today
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Task Form Modal */}
      {selectedSlot && (
        <QuickTaskForm
          date={selectedSlot.date}
          hour={selectedSlot.hour}
          projects={projects}
          onSubmit={handleQuickTaskSubmit}
          onCancel={() => setSelectedSlot(null)}
        />
      )}

      {/* Event List Modal */}
      <EventListModal
        isOpen={eventModal.isOpen}
        onClose={() => setEventModal({ ...eventModal, isOpen: false })}
        tasks={eventModal.tasks}
        projects={projects}
        date={eventModal.date}
        hour={eventModal.hour}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
      />
    </div>
  );
};