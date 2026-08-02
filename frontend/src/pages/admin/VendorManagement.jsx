import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await adminService.getVendors();
      console.log('Vendors API Response:', response);
      
      let vendors = [];
      if (response.data?.data?.vendors) {
        vendors = response.data.data.vendors;
      } else if (response.data?.vendors) {
        vendors = response.data.vendors;
      } else if (Array.isArray(response.data)) {
        vendors = response.data;
      }
      
      console.log('Parsed vendors:', vendors);
      setVendors(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const handleStatusChange = async (vendor, newStatus) => {
    try {
      await adminService.updateVendorStatus(vendor.id, newStatus);
      fetchVendors();
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error updating status. Please try again.';
      alert(errorMsg);
    }
  };

  const handleDeleteVendor = async (vendor) => {
    const confirmed = window.confirm(
      `Delete vendor ${vendor.name || vendor.email}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteVendor(vendor.id);
      alert('Vendor deleted successfully.');
      fetchVendors();
      if (selectedVendor?.id === vendor.id) {
        setShowModal(false);
        setSelectedVendor(null);
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error deleting vendor. Please try again.';
      alert(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
        <p className="text-gray-600">View and manage vendor registrations and approvals</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vendors Yet</h3>
          <p className="text-gray-600">Vendors will appear here once they register on the platform.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                          {vendor.name?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{vendor.name}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{vendor.company_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{vendor.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={vendor.status}
                        onChange={(e) => handleStatusChange(vendor, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${getStatusColor(vendor.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleViewDetails(vendor)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {showModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vendor Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {selectedVendor.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedVendor.name}</h3>
                  <p className="text-gray-600">{selectedVendor.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                  <div className="text-sm text-gray-900">{selectedVendor.phone || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Company</label>
                  <div className="text-sm text-gray-900">{selectedVendor.company_name || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Trade License</label>
                  <div className="text-sm text-gray-900">{selectedVendor.trade_license_no || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(selectedVendor.status)}`}>
                    {selectedVendor.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Address</label>
                  <div className="text-sm text-gray-900">{selectedVendor.address || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Registration Date</label>
                  <div className="text-sm text-gray-900">
                    {new Date(selectedVendor.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => handleDeleteVendor(selectedVendor)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Vendor
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
