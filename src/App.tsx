import React from 'react';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { TaskForm } from './components/TaskForm';
import { ProjectPanel } from './components/ProjectPanel';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { AddTaskModal } from './components/AddTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { QuickAddTaskModal } from './components/QuickAddTaskModal';
import { DesktopNavigation } from './components/DesktopNavigation';
import { LifetimeTracker } from './components/LifetimeTracker';
import { useDarkMode } from './hooks/useDarkMode';
import { CheckSquare, LogOut, Plus } from 'lucide-react';

function App() {
  const { user, loading: authLoading, error: authError, signUp, signIn, signOut } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useProjects(user?.id || null);
  const { tasks, addTask, updateTask, toggleTask, deleteTask } = useTasks(user?.id || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showQuickAddTaskModal, setShowQuickAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <CheckSquare size={48} className="mx-auto text-blue-600 mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen 
        onSignUp={signUp}
        onSignIn={signIn}
        loading={authLoading}
        error={authError}
      />
    );
  }

  const handleAddTask = (taskData: { title: string; deadline: string; project_id: string }) => {
    // Ensure we have a valid project_id, default to Inbox if needed
    let finalProjectId = taskData.project_id;
    if (!finalProjectId) {
      const inboxProject = projects.find(p => p.name === 'Inbox' && !p.parent_id);
      finalProjectId = inboxProject?.id || projects[0]?.id || '';
    }
    
    if (!finalProjectId) {
      console.error('No project available for task');
      return;
    }
    
    addTask(taskData);
    setShowAddTaskModal(false);
  };

  const handleQuickAddTask = (taskData: { title: string; deadline: string; project_id: string }) => {
    addTask(taskData);
    setShowQuickAddTaskModal(false);
  };

  const handleEditTask = (taskId: string, updates: { title: string; deadline: string; project_id: string }) => {
    // Ensure we have a valid project_id, default to Inbox if needed
    let finalProjectId = updates.project_id;
    if (!finalProjectId) {
      const inboxProject = projects.find(p => p.name === 'Inbox' && !p.parent_id);
      finalProjectId = inboxProject?.id || projects[0]?.id || '';
    }
    
    if (!finalProjectId) {
      console.error('No project available for task');
      return;
    }
    
    updateTask(taskId, updates);
    setEditingTask(null);
  };

  const editingTaskData = editingTask ? tasks.find(t => t.id === editingTask) : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            {/* Show lifetime tracker only on desktop */}
            <div className="hidden md:block">
              <LifetimeTracker tasks={tasks} projects={projects} />
            </div>
            <Dashboard
              tasks={tasks}
              projects={projects}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onEditTask={setEditingTask}
            />
          </div>
        );
      case 'projects':
        return (
          <div className="pb-20 md:pb-0">
            <ProjectPanel 
              projects={projects}
              tasks={tasks}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onEditTask={setEditingTask}
              onAddProject={addProject}
              onDeleteProject={deleteProject}
              onSelectProject={(projectId) => {
                // This will be handled by ProjectPanel's internal state
              }}
            />
          </div>
        );
      case 'calendar':
        return (
          <div className="pb-20 md:pb-0">
            <Calendar 
              tasks={tasks}
              projects={projects}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onEditTask={setEditingTask}
              onAddTask={addTask}
              onUpdateTask={updateTask}
            />
          </div>
        );
      case 'settings':
        return (
          <SettingsScreen
            user={user}
            onSignOut={signOut}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <CheckSquare size={32} className="text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Mind the Gap</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700 font-medium">
                  {user.name || user.email}
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          <p className="hidden md:block text-gray-600 dark:text-gray-200 text-lg">
            Bridge the gap between planning and execution with intelligent task management
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <DesktopNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {renderContent()}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTask={() => setShowAddTaskModal(true)}
      />

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          projects={projects}
          onAddTask={handleAddTask}
          onClose={() => setShowAddTaskModal(false)}
        />
      )}

      {/* Quick Add Task Modal */}
      {showQuickAddTaskModal && (
        <QuickAddTaskModal
          projects={projects}
          onAddTask={handleQuickAddTask}
          onClose={() => setShowQuickAddTaskModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && editingTaskData && (
        <EditTaskModal
          task={editingTaskData}
          projects={projects}
          onSave={handleEditTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Floating Action Button - Quick Add Task */}
      <button
        onClick={() => setShowQuickAddTaskModal(true)}
        className="fixed bottom-24 right-6 md:bottom-6 md:right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
        title="Quick add task"
      >
        <Plus size={24} className="group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
}

export default App;