import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      const payload = response.data?.data || response.data;
      if (payload) {
        setStats({
          ...(payload.metrics || {}),
          recent_tenders: payload.recent_tenders || [],
          recent_bids: payload.recent_bids || [],
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Total Tenders</div>
          </div>
          <div className="text-3xl font-bold text-primary">{stats?.total_tenders || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Active Tenders</div>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats?.active_tenders || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Total Bids</div>
          </div>
          <div className="text-3xl font-bold text-primary">{stats?.total_bids || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Pending Reviews</div>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats?.pending_reviews || 0}</div>
        </div>
      </div>

      {/* Vendor Count */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Registered Vendors</div>
            <div className="text-3xl font-bold text-primary">{stats?.total_vendors || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/tenders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-semibold text-primary mb-1">Manage Tenders</div>
              <div className="text-sm text-gray-500">Create, edit, and manage tenders</div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/bids"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-semibold text-primary mb-1">Manage Bids</div>
              <div className="text-sm text-gray-500">Review and respond to vendor bids</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tenders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-primary">Recent Tenders</h2>
          </div>
          <div className="p-6">
            {stats?.recent_tenders?.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent tenders</div>
            ) : (
              <div className="space-y-4">
                {stats?.recent_tenders?.map((tender) => (
                  <div key={tender.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-primary">{tender.title}</div>
                      <div className="text-sm text-gray-500">{tender.reference_no}</div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${tender.status === 'active' ? 'bg-green-100 text-green-800' :
                      tender.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {tender.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-primary">Recent Bids</h2>
          </div>
          <div className="p-6">
            {stats?.recent_bids?.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent bids</div>
            ) : (
              <div className="space-y-4">
                {stats?.recent_bids?.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-primary">{bid.vendor_name}</div>
                      <div className="text-sm text-gray-500">{bid.tender_title}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        ${Number(bid.bid_amount).toLocaleString()}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${bid.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        bid.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                          bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
