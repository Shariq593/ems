import React from 'react';
import { LayoutDashboard, Users, FileBarChart, Menu, LogOut, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SidebarItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin', 'employee'] },
  { name: 'Employees', icon: Users, path: '/employees', roles: ['admin', ] },
  { name: 'Reports', icon: FileBarChart, path: '/reports', roles: ['admin', 'employee'] },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const user = localStorage.getItem('user')
  console.log(user)
  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  const logout = () => {
    // Remove JWT from localStorage (or cookies)
    localStorage.removeItem("token");
  
    // Optionally, redirect to the login page
    window.location.href = "/login";
  };
  

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    onClose();
  };

  const handleNavigation = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed lg:sticky top-0 right-0 lg:right-auto h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">EMS</h2>
            <button onClick={onClose} className="lg:hidden">
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleThemeToggle}
            className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 mb-2"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-5 w-5 mr-3" />
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 mr-3" />
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}