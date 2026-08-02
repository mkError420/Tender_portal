import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats.php'),
  getVendors: () => api.get('/admin/vendors.php'),
  updateVendorStatus: (vendorId, status) => api.put('/admin/vendor-status.php', { vendor_id: vendorId, status }),
  deleteVendor: (vendorId) => api.delete('/admin/delete-vendor.php', { data: { vendor_id: vendorId } }),
  getAdmins: () => api.get('/admin/admins.php'),
  createAdmin: (adminData) => api.post('/admin/create-admin.php', adminData),
};
