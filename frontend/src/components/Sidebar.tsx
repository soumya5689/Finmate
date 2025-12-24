import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  UploadCloud,
  LayoutDashboard,
  FileOutput,
  Sparkles, // ✅ NEW ICON
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside
      className="
        w-64 min-h-screen
        bg-gradient-to-b from-[#0B1020] via-[#0E1430] to-[#0B1020]
        border-r border-white/10
        backdrop-blur-xl
        flex flex-col
      "
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          <span className="text-indigo-400">Fin</span>mate
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {[
          { to: '/upload', label: 'Upload', icon: UploadCloud },
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/insights', label: 'Insights', icon: Sparkles }, // ✅ NEW
          { to: '/final-output', label: 'Final Output', icon: FileOutput },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }
            `
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
