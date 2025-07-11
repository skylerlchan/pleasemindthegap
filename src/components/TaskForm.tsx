import React, { useState } from 'react';
import { Project } from '../types';
import { getTimeSlots, convertTimeSlotTo24Hour, getTomorrowDateAt6AM, getTimeSlotFromTime } from '../utils';
import { Plus, Calendar, Clock } from 'lucide-react';

interface TaskFormProps {
  projects: Project[];
  onAddTask: (task: { title: string; deadline: string; project_id: string }) => void;
  onAddProject: (project: { name: string; color: string }) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projects, onAddTask, onAddProject }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [taskTimeSlot, setTaskTimeSlot] = useState('Holding');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const projectColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate || !taskTimeSlot || !selectedProjectId) return;

    let deadline: Date;
    if (taskTimeSlot === 'Holding') {
      // Set to 11:59 PM for holding tasks
      deadline = new Date(`${taskDate}T23:59`);
    } else {
      const time24 = convertTimeSlotTo24Hour(taskTimeSlot);
      deadline = new Date(`${taskDate}T${time24}`);
    }
    
    onAddTask({
      title: taskTitle.trim(),
      deadline: deadline.toISOString(),
      project_id: selectedProjectId
    });

    setTaskTitle('');
    // Reset to tomorrow at 6 AM
    setTaskDate(taskDate); // Keep the same date
    setTaskTimeSlot('Holding'); // Reset to Holding
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const randomColor = projectColors[Math.floor(Math.random() * projectColors.length)];
    onAddProject({
      name: newProjectName.trim(),
      color: randomColor
    });

    setNewProjectName('');
    setShowNewProject(false);
  };

  const timeSlots = ['Holding', ...getTimeSlots()];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter task title..."
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Time
            </label>
            <select
              value={taskTimeSlot}
              onChange={(e) => setTaskTimeSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select a project...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!taskTitle.trim() || !taskDate || !taskTimeSlot || !selectedProjectId}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showNewProject ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {showNewProject && (
          <form onSubmit={handleAddProject} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};