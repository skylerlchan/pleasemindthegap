import React from 'react';
import { Home, FolderOpen, Calendar, Settings } from 'lucide-react';

interface DesktopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="hidden md:flex bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-6">
      <div className="flex space-x-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};