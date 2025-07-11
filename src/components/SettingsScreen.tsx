import React from 'react';
import { User, LogOut, Bell, Moon, Sun, Globe, HelpCircle, Shield } from 'lucide-react';

interface SettingsScreenProps {
  user: any;
  onSignOut: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  onSignOut, 
  isDarkMode, 
  onToggleDarkMode 
}) => {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Manage your account settings',
          action: () => console.log('Profile clicked')
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Configure notification preferences',
          action: () => console.log('Notifications clicked')
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          description: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
          action: onToggleDarkMode,
          toggle: true,
          toggleState: isDarkMode
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'Change app language',
          action: () => console.log('Language clicked')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help and contact support',
          action: () => console.log('Help clicked')
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          description: 'View our privacy policy',
          action: () => console.log('Privacy clicked')
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h2>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name || user.email}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {user.name || user.email?.split('@')[0]}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-200">{user.email}</p>
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{group.title}</h3>
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {item.label === 'Dark Mode' ? (
                        isDarkMode ? (
                          <Sun size={20} className="text-yellow-500" />
                        ) : (
                          <Moon size={20} className="text-gray-600 dark:text-gray-200" />
                        )
                      ) : (
                        <Icon size={20} className="text-gray-600 dark:text-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-200">{item.description}</p>
                    </div>
                    {item.toggle && (
                      <div className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        item.toggleState ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                          item.toggleState ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};