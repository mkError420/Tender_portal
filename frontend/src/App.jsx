import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/public/Home';
import TenderListing from './pages/public/TenderListing';
import TenderDetail from './pages/public/TenderDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TenderManagement from './pages/admin/TenderManagement';
import BidManagement from './pages/admin/BidManagement';
import VendorManagement from './pages/admin/VendorManagement';
import AdminManagement from './pages/admin/AdminManagement';

import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/tenders" element={<TenderListing />} />
              <Route path="/tenders/:id" element={<TenderDetail />} />
              
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              
              {/* Vendor Routes */}
              <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tenders" element={<TenderManagement />} />
                <Route path="bids" element={<BidManagement />} />
                <Route path="vendors" element={<VendorManagement />} />
                <Route path="admins" element={<AdminManagement />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
