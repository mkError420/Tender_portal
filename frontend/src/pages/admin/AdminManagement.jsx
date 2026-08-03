import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company_name: '',
  });
  const [error, setError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAdmins();
      console.log('Admins API Response:', response);
      
      let admins = [];
      if (response.data?.data?.admins) {
        admins = response.data.data.admins;
      } else if (response.data?.admins) {
        admins = response.data.admins;
      } else if (Array.isArray(response.data)) {
        admins = response.data;
      }
      
      console.log('Parsed admins:', admins);
      setAdmins(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company_name: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setCreateLoading(true);

    try {
      const { confirmPassword, ...adminData } = formData;
      await adminService.createAdmin(adminData);
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create admin';
      setError(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewDetails = (admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteClick = (admin) => {
    setDeletingAdmin(admin);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteAdmin(deletingAdmin.id);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.error || 'Error deleting admin. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Create and manage admin accounts</p>
        </div>
        <button
          onClick={handleCreateAdmin}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Create Admin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white border border-gray-300 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Admins Yet</h3>
          <p className="text-gray-600 mb-6">Create your first admin account to get started.</p>
          <button
            onClick={handleCreateAdmin}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Create First Admin
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                          {admin.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{admin.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{admin.company_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-700 border border-green-300">
                        {admin.status === 'active' ? 'ACTIVE' : admin.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(admin)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                        >
                          View Details
                        </button>
                        {currentUser?.id !== admin.id && (
                          <button
                            onClick={() => handleDeleteClick(admin)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Admin</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete admin <span className="font-semibold text-gray-900">{deletingAdmin.name}</span> ({deletingAdmin.email})? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingAdmin(null)}
                disabled={deleteLoading}
                className="px-5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin / View Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedAdmin ? 'Admin Details' : 'Create New Admin'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                [X]
              </button>
            </div>
            
            {selectedAdmin ? (
              // View Details Mode
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-purple-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {selectedAdmin.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin.name}</h3>
                    <p className="text-gray-600">{selectedAdmin.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                    <div className="text-sm text-gray-900">{selectedAdmin.phone || '-'}</div>
                  </div>
                  <div className="bg-gray-100 p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Company</label>
                    <div className="text-sm text-gray-900">{selectedAdmin.company_name || '-'}</div>
                  </div>
                  <div className="bg-gray-100 p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                    <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 border border-green-300">
                      {selectedAdmin.status === 'active' ? 'ACTIVE' : selectedAdmin.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Created</label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedAdmin.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Create Admin Mode
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter admin's full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter admin's email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm the password"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      id="company_name"
                      name="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name (optional)"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
