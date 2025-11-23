import React from 'react';
import { NavLink } from 'react-router-dom';
import { UploadCloud, LayoutDashboard, FileOutput, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-600">Expense</span> Tracker
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/upload" 
          className={({ isActive }) => 
            `flex items-center space-x-3 p-3 rounded-lg transition-all ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <UploadCloud className="h-5 w-5" />
          <span>Upload</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center space-x-3 p-3 rounded-lg transition-all ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/final-output" 
          className={({ isActive }) => 
            `flex items-center space-x-3 p-3 rounded-lg transition-all ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <FileOutput className="h-5 w-5" />
          <span>Final Output</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <span className="font-bold text-lg">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{currentUser?.name || 'User'}</p>
            <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;