import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manage Tenders', path: '/admin/tenders' },
    { name: 'Manage Bids', path: '/admin/bids' },
  ];

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 flex-grow border-t border-gray-200 shadow-inner">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10">
        <div className="p-6 sticky top-20">
          <div className="text-xl font-bold text-primary mb-1">Admin Panel</div>
          <div className="text-sm text-gray-500 mb-8 truncate">{user?.email}</div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                  }`
                }
              >
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* The Outlet will render the matched child route component */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
