import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-dark shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-gold font-bold text-2xl">RG</div>
              <div className="text-white">
                <div className="font-semibold text-lg">Rangpur Group</div>
                <div className="text-xs text-gray-300">Tender Portal</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            <Link to="/tenders" className="text-gray-300 hover:text-white transition">
              Tenders
            </Link>

            {isAuthenticated && isAdmin && (
              <>
                <Link to="/admin/dashboard" className="text-gray-300 hover:text-white transition">
                  Admin Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && isVendor && (
              <>
                <Link to="/vendor/dashboard" className="text-gray-300 hover:text-white transition">
                  My Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="bg-primary-light hover:bg-primary text-white font-medium px-3.5 py-1.5 rounded-lg border border-gray-600 transition flex items-center gap-2 text-sm shadow-sm"
                  >
                    {user?.name || 'Admin User'}
                  </Link>
                ) : isVendor ? (
                  <Link
                    to="/vendor/dashboard"
                    className="bg-primary-light hover:bg-primary text-white font-medium px-3.5 py-1.5 rounded-lg border border-gray-600 transition flex items-center gap-2 text-sm shadow-sm"
                  >
                    <span>👤</span> {user?.name || 'Vendor'}
                  </Link>
                ) : (
                  <span className="text-gray-300 text-sm hidden sm:block">
                    {user?.name}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gold hover:bg-gold-dark text-primary-dark px-4 py-2 rounded-lg transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
