import React from 'react';
import { Home, FolderOpen, Calendar, Settings, Users } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddTask: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onAddTask
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'people', label: 'People', icon: Users }, // 👈 added in center
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              data-tab={tab.id}
              className={`
                flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-200
              `}
            >
              <div className={`
                flex items-center justify-center rounded-full transition-all duration-200
                ${isActive 
                  ? 'w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' 
                  : 'w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}>
                <Icon size={20} />
              </div>
              <span className={`
                text-xs mt-1 font-medium transition-colors duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
