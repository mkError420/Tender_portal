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
      console.log('Dashboard API Response:', response);
      
      const payload = response.data?.data || response.data;
      if (payload) {
        setStats({
          ...(payload.metrics || payload || {}),
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

  const StatCard = ({ title, value, color, link }) => {
    const colors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      amber: 'bg-amber-600',
      red: 'bg-red-600',
    };

    if (link) {
      return (
        <Link to={link} className="group">
          <div className="bg-white hover:bg-gray-50 p-6 border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600">
                  {value}
                </p>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <div className="bg-white p-6 border border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const ActionCard = ({ title, description, link, color }) => {
    return (
      <Link to={link} className="group">
        <div className="bg-white hover:bg-gray-50 p-6 border border-gray-300">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-gray-600">Here's what's happening with your tender portal today.</p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
        <StatCard 
          title="Total Tenders" 
          value={stats?.total_tenders || 0} 
          color="blue"
          link="/admin/tenders"
        />
        <StatCard 
          title="Active Tenders" 
          value={stats?.active_tenders || 0} 
          color="green"
        />
        <StatCard 
          title="Total Bids" 
          value={stats?.total_bids || 0} 
          color="purple"
          link="/admin/bids"
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats?.pending_reviews || 0} 
          color="amber"
        />
        <StatCard 
          title="Pending Vendors" 
          value={stats?.pending_vendors || 0} 
          color="orange"
          link="/admin/vendors"
        />
        <StatCard 
          title="Total Admins" 
          value={stats?.total_admins || 0} 
          color="red"
          link="/admin/admins"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            title="Manage Tenders" 
            description="Create, edit, and manage tender opportunities" 
            link="/admin/tenders"
            color="blue"
          />
          <ActionCard 
            title="Manage Bids" 
            description="Review and respond to vendor submissions" 
            link="/admin/bids"
            color="green"
          />
          <ActionCard 
            title="Manage Vendors" 
            description="Approve and manage vendor registrations" 
            link="/admin/vendors"
            color="purple"
          />
          <ActionCard 
            title="Manage Admins" 
            description="Create and manage admin accounts" 
            link="/admin/admins"
            color="orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenders */}
        <div className="bg-white border border-gray-300">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tenders</h2>
          </div>
          <div className="p-6">
            {stats?.recent_tenders?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent tenders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recent_tenders?.map((tender) => (
                  <div key={tender.id} className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{tender.title}</div>
                      <div className="text-sm text-gray-500">{tender.reference_no}</div>
                    </div>
                    <span className={`ml-4 text-xs font-semibold px-3 py-1 ${
                      tender.status === 'active' ? 'bg-green-100 text-green-700' :
                      tender.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                      'bg-blue-100 text-blue-700'
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
        <div className="bg-white border border-gray-300">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bids</h2>
          </div>
          <div className="p-6">
            {stats?.recent_bids?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent bids</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recent_bids?.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{bid.vendor_name}</div>
                      <div className="text-sm text-gray-500">{bid.tender_title}</div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-semibold text-gray-900">
                        BDT {Number(bid.bid_amount).toLocaleString('en-US')}
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 ${
                        bid.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        bid.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-700' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
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
