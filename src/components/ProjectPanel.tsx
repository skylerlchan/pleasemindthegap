import React, { useState } from 'react';
import { Project, Task } from '../types';
import { getProjectStatus, getDisplayStatus, getStatusTextColorForDisplay } from '../utils';
import { Calendar, CheckCircle, Clock, Plus, Edit3, Trash2, FolderOpen, Archive, AlertTriangle, Palette, MoreVertical, Flag, RotateCcw } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { ProjectDetailView } from './ProjectDetailView';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ProjectPanelProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: { name: string; color: string; parent_id?: string }) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddTask?: (task: { title: string; deadline: string; project_id: string }) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({ 
  projects, 
  tasks, 
  onAddProject, 
  onUpdateProject, 
  onDeleteProject,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onSelectProject
}) => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectParentId, setNewProjectParentId] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [showProjectActions, setShowProjectActions] = useState<string | null>(null);

  const projectColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
  ];

  const getProjectStats = (project: Project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const totalTasks = projectTasks.length;
    
    return { completed: completedTasks, total: totalTasks };
  };

  const getStatusLabel = (status: string | 'finished') => {
    switch (status) {
      case 'live':
        return 'Active';
      case 'unreported':
        return 'Review';
      case 'done':
        return 'Completed';
      case 'finished':
        return 'Finished';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string | 'finished') => {
    switch (status) {
      case 'live':
        return <Calendar size={16} />;
      case 'unreported':
        return <AlertTriangle size={16} />;
      case 'done':
        return <CheckCircle size={16} />;
      case 'finished':
        return <Flag size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const randomColor = projectColors[Math.floor(Math.random() * projectColors.length)];
    onAddProject({
      name: newProjectName.trim(),
      color: randomColor,
      parent_id: newProjectParentId || undefined
    });

    setNewProjectName('');
    setNewProjectParentId('');
    setShowNewProject(false);
  };

  const handleEditProject = (projectId: string, updates: { name: string; color: string; parent_id?: string | null }) => {
    onUpdateProject(projectId, updates);
    setEditingProject(null);
    setShowProjectActions(null);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project?.name === 'Inbox' && !project.parent_id) {
      // Don't allow deletion of Inbox project
      return;
    }
    
    onDeleteProject(projectId);
    setDeletingProject(null);
    setShowProjectActions(null);
  };

  const handleToggleFinished = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || (project.name === 'Inbox' && !project.parent_id)) {
      // Don't allow finishing Inbox project
      return;
    }
    
    const newStatus = project.status === 'finished' ? null : 'finished';
    onUpdateProject(projectId, { status: newStatus });
    setShowProjectActions(null);
  };

  const editingProjectData = editingProject ? projects.find(p => p.id === editingProject) : null;
  const deletingProjectData = deletingProject ? projects.find(p => p.id === deletingProject) : null;

  // Organize projects by hierarchy
  const topLevelProjects = projects.filter(p => !p.parent_id);
  const subProjects = projects.filter(p => p.parent_id);

  const getSubProjects = (parentId: string) => {
    return subProjects.filter(p => p.parent_id === parentId);
  };

  const groupProjectsByStatus = (projectList: Project[]) => {
    // Separate Inbox from other projects
    const inboxProject = projectList.find(p => p.name === 'Inbox' && !p.parent_id);
    const otherProjects = projectList.filter(p => !(p.name === 'Inbox' && !p.parent_id));
    
    const review = otherProjects.filter(project => {
      const displayStatus = getDisplayStatus(project, tasks, projects);
      return displayStatus === 'unreported';
    });
    const active = otherProjects.filter(project => {
      const displayStatus = getDisplayStatus(project, tasks, projects);
      return displayStatus === 'live';
    });
    const finished = otherProjects.filter(project => {
      const displayStatus = getDisplayStatus(project, tasks, projects);
      return displayStatus === 'finished';
    });
    
    // Check if Inbox needs to be in review (has overdue tasks)
    let inboxInReview = false;
    if (inboxProject) {
      const inboxStatus = getDisplayStatus(inboxProject, tasks, projects);
      if (inboxStatus === 'unreported') {
        review.unshift(inboxProject); // Add Inbox to beginning of review
        inboxInReview = true;
      }
    }
    
    return { 
      inbox: inboxInReview ? null : inboxProject, // Only show in Inbox section if not in review
      review, 
      active, 
      finished 
    };
  };

  const { inbox, review, active, finished } = groupProjectsByStatus(topLevelProjects);

  // Allow any project to be a parent (unlimited nesting)
  const availableParentProjects = projects.filter(p => p.id !== (editingProject || ''));

  // If a project is selected, show the detail view
  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject);
    if (project && onAddTask && onToggleTask && onDeleteTask && onEditTask && onSelectProject) {
      return (
        <ProjectDetailView
          project={project}
          projects={projects}
          tasks={tasks}
          onBack={() => setSelectedProject(null)}
          onAddProject={onAddProject}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
          onSelectProject={(projectId) => {
            setSelectedProject(projectId);
          }}
        />
      );
    }
  }

  const renderProject = (project: Project, isSubProject = false) => {
    const displayStatus = getDisplayStatus(project, tasks, projects);
    const stats = getProjectStats(project);
    const showActions = showProjectActions === project.id;
    const isFinished = project.status === 'finished';
    const isInbox = project.name === 'Inbox' && !project.parent_id;
    
    return (
      <div key={project.id}>
        <div 
          className="group p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-gray-900"
          onClick={() => setSelectedProject(project.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`w-3 h-3 rounded-full ${project.color}`} />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {project.name}
                {isInbox && <span className="ml-2 text-xs text-gray-500 dark:text-gray-300 font-normal">(Default)</span>}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isInbox && (
                <div className={`
                  flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                  ${displayStatus === 'live' ? 'bg-green-100 dark:bg-green-900/50' : 
                    displayStatus === 'unreported' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 
                    displayStatus === 'finished' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}
                  ${getStatusTextColorForDisplay(displayStatus)}
                `}>
                  {getStatusIcon(displayStatus)}
                  <span>{getStatusLabel(displayStatus)}</span>
                </div>
              )}

              {!isInbox && (
                <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProjectActions(showActions ? null : project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project.id);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFinished(project.id);
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-left transition-colors ${
                        isFinished 
                          ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50' 
                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'
                      }`}
                    >
                      {isFinished ? <RotateCcw size={14} /> : <Flag size={14} />}
                      <span>{isFinished ? 'Reactivate' : 'Mark Finished'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(project.id);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-200">
              {stats.completed} / {stats.total} tasks completed
              {getSubProjects(project.id).length > 0 && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                  • {getSubProjects(project.id).length} sub-project{getSubProjects(project.id).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Projects</h2>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {showNewProject && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <form onSubmit={handleAddProject} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Parent Project (Optional)
              </label>
              <select
                value={newProjectParentId}
                onChange={(e) => setNewProjectParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">No parent project</option>
                {projects.map(parentProject => (
                  <option key={parentProject.id} value={parentProject.id}>
                    {parentProject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false);
                  setNewProjectName('');
                  setNewProjectParentId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              >
                Add Project
              </button>
            </div>
          </form>
        </div>
      )}
      
      {topLevelProjects.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-200">No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Inbox Project - Always at top */}
          {inbox && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Archive size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                  Inbox
                </h3>
              </div>
              <div className="space-y-3">
                {renderProject(inbox)}
              </div>
            </div>
          )}

          {/* Review Projects */}
          {review.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300">
                  Review ({review.length})
                </h3>
              </div>
              <div className="space-y-3">
                {review.map(project => renderProject(project))}
              </div>
            </div>
          )}

          {/* Active Projects */}
          {active.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar size={20} className="text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-300">
                  Active ({active.length})
                </h3>
              </div>
              <div className="space-y-3">
                {active.map(project => renderProject(project))}
              </div>
            </div>
          )}

          {/* Finished Projects */}
          {finished.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Flag size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                  Finished ({finished.length})
                </h3>
              </div>
              <div className="space-y-3">
                {finished.map(project => renderProject(project))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && editingProjectData && (
        <EditProjectModal
          project={editingProjectData}
          projects={projects}
          onSave={handleEditProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && deletingProjectData && (
        <DeleteConfirmationModal
          title="Delete Project"
          message={`Are you sure you want to delete "${deletingProjectData.name}"? This will also delete all tasks and sub-projects within it. This action cannot be undone.`}
          onConfirm={() => handleDeleteProject(deletingProject)}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </div>
  );
};
