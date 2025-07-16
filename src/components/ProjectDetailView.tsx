import React, { useState } from 'react';
import { Project, Task } from '../types';
import { TaskItem } from './TaskItem';
import { AddTaskModal } from './AddTaskModal';
import { AddSubProjectModal } from './AddSubProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { formatDate, getProjectStatus, getDisplayStatus, getStatusTextColorForDisplay } from '../utils';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target,
  ListTodo,
  TrendingUp,
  Archive,
  Flag,
  Edit3,
  Trash2,
  MoreVertical,
  RotateCcw
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  projects: Project[];
  tasks: Task[];
  onBack: () => void;
  onAddTask: (task: { title: string; deadline: string; project_id: string }) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddProject: (project: { name: string; color: string; parent_id?: string }) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  projects,
  tasks,
  onBack,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onSelectProject
}) => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddSubProjectModal, setShowAddSubProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [showSubProjectActions, setShowSubProjectActions] = useState<string | null>(null);

  const projectTasks = tasks.filter(task => task.project_id === project.id);
  const completedTasks = projectTasks.filter(task => task.completed);
  const pendingTasks = projectTasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => new Date(task.deadline) < new Date());
  const upcomingTasks = pendingTasks.filter(task => new Date(task.deadline) >= new Date());

  const displayStatus = getDisplayStatus(project, tasks, projects);
  const isFinished = project.status === 'finished';
  const completionPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0;

  const subProjects = projects.filter(p => p.parent_id === project.id);

  const handleAddTask = (taskData: { title: string; deadline: string; project_id: string }) => {
    onAddTask(taskData);
    setShowAddTaskModal(false);
  };

  const handleEditProject = (projectId: string, updates: { name: string; color: string; parent_id?: string | null }) => {
    onUpdateProject(projectId, updates);
    setEditingProject(null);
    setShowSubProjectActions(null);
  };

  const handleToggleFinished = () => {
    const newStatus = isFinished ? null : 'finished';
    onUpdateProject(project.id, { status: newStatus });
  };

  const handleDeleteSubProject = (projectId: string) => {
    onDeleteProject(projectId);
    setDeletingProject(null);
    setShowSubProjectActions(null);
  };

  const editingProjectData = editingProject ? projects.find(p => p.id === editingProject) : null;
  const deletingProjectData = deletingProject ? projects.find(p => p.id === deletingProject) : null;

  const parentProject = project.parent_id ? projects.find(p => p.id === project.parent_id) : null;

  const handleBackClick = () => {
    if (parentProject) {
      onSelectProject(parentProject.id);
    } else {
      onBack();
    }
  };

  const getStatusIcon = (status: string | 'finished') => {
    switch (status) {
      case 'live':
        return <Calendar size={20} className="text-green-600" />;
      case 'unreported':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'done':
        return <CheckCircle size={20} className="text-gray-600" />;
      case 'finished':
        return <Flag size={20} className="text-blue-600" />;
      default:
        return <Calendar size={20} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string | 'finished') => {
    switch (status) {
      case 'live':
        return 'Active';
      case 'unreported':
        return 'Review';
      case 'done':
        return 'Done';
      case 'finished':
        return 'Finished';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{parentProject ? `Back to ${parentProject.name}` : 'Back to Projects'}</span>
          </button>
          
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-6 h-6 rounded-full ${project.color}`} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
            <div className={`
              flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
              ${isFinished ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200' : 
                displayStatus === 'live' ? 'bg-green-100 dark:bg-green-900/50' : 
                displayStatus === 'unreported' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 
                displayStatus === 'finished' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}
              ${isFinished ? 'text-blue-600 dark:text-blue-300' : getStatusTextColorForDisplay(displayStatus)}
            `}>
              {getStatusIcon(displayStatus)}
              <span>{getStatusLabel(displayStatus)}</span>
            </div>



            
          </div>
          <div className="flex justify-end">
  <button
    onClick={() => setEditingProject(project.id)}
    className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
  >
    <Edit3 size={16} />
    <span>Edit</span>
  </button>
          </div>

<div className="flex justify-center md:justify-end mt-4">
  <button
    onClick={handleToggleFinished}
    className={`w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isFinished 
        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
  >
    {isFinished ? <RotateCcw size={18} /> : <Flag size={18} />}
    <span>{isFinished ? 'Reactivate Project' : 'Mark as Finished'}</span>
  </button>
</div>


          






          
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>Overdue Tasks ({overdueTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {overdueTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                project={project}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <Clock size={20} />
            <span>Upcoming Tasks ({upcomingTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                project={project}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sub-Projects */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Archive size={20} />
            <span>Sub-Projects ({subProjects.length})</span>
          </h3>
        </div>
        
        {subProjects.length > 0 && (
          <div className="grid gap-3 mb-4">
            {subProjects.map(subProject => {
              const subProjectTasks = tasks.filter(task => task.project_id === subProject.id);
              const subProjectCompleted = subProjectTasks.filter(task => task.completed).length;
              const subProjectDisplayStatus = getDisplayStatus(subProject, tasks, projects);
              const subSubProjects = projects.filter(p => p.parent_id === subProject.id);
              const showActions = showSubProjectActions === subProject.id;
              
              return (
                <div key={subProject.id} className="group p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(subProject.id)}
                      className="flex items-center space-x-3 flex-1 text-left hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${subProject.color}`} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{subProject.name}</span>
                      <div className={`
                        flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                        ${subProjectDisplayStatus === 'live' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 
                          subProjectDisplayStatus === 'unreported' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 
                          subProjectDisplayStatus === 'finished' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}
                      `}>
                        {getStatusIcon(subProjectDisplayStatus)}
                        <span>{getStatusLabel(subProjectDisplayStatus)}</span>
                      </div>
                    </button>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600 dark:text-gray-200 flex items-center space-x-3">
                        {subSubProjects.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-300">
                            {subSubProjects.length} sub-project{subSubProjects.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span>
                          {subProjectCompleted} / {subProjectTasks.length} tasks
                        </span>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSubProjectActions(showActions ? null : subProject.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {showActions && (
                          <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProject(subProject.id);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStatus = subProject.status === 'finished' ? null : 'finished';
                                onUpdateProject(subProject.id, { status: newStatus });
                                setShowSubProjectActions(null);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 text-left transition-colors ${
                                subProject.status === 'finished' 
                                  ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50' 
                                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'
                              }`}
                            >
                              {subProject.status === 'finished' ? <RotateCcw size={14} /> : <Flag size={14} />}
                              <span>{subProject.status === 'finished' ? 'Reactivate' : 'Mark Finished'}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProject(subProject.id);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Add Sub-Project Button - Always visible */}
        {!isFinished && (
          <button
            onClick={() => setShowAddSubProjectModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-200 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
          >
            <Plus size={18} />
            <span>Add Sub-Project</span>
          </button>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Completed Tasks ({completedTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                project={project}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projectTasks.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <ListTodo size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks yet</h3>
          <p className="text-gray-600 dark:text-gray-200 mb-4">Get started by adding your first task to this project.</p>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add First Task</span>
          </button>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          projects={[project]} // Only allow adding tasks to this project
          onAddTask={handleAddTask}
          onClose={() => setShowAddTaskModal(false)}
        />
      )}

      {/* Add Sub-Project Modal */}
      {showAddSubProjectModal && (
        <AddSubProjectModal
          parentProject={project}
          onAddProject={(projectData) => {
            onAddProject({ ...projectData, parent_id: project.id });
            setShowAddSubProjectModal(false);
          }}
          onClose={() => setShowAddSubProjectModal(false)}
        />
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
          onConfirm={() => handleDeleteSubProject(deletingProject)}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </div>
  );
};