import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bidService } from '../../services/bidService';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await bidService.getBids();
      setBids(response.data.data ? response.data.data.bids : response.data.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTenderStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: bids.length,
    submitted: bids.filter(b => b.status === 'submitted').length,
    shortlisted: bids.filter(b => b.status === 'shortlisted').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-2">Total Bids</div>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-2">Pending</div>
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-2">Shortlisted</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.shortlisted}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-2">Accepted</div>
            <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tenders"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="text-3xl">📋</div>
              <div>
                <div className="font-semibold text-primary">Browse Tenders</div>
                <div className="text-sm text-gray-500">View and apply for new opportunities</div>
              </div>
            </Link>
            <Link
              to="/tenders"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="text-3xl">🔍</div>
              <div>
                <div className="font-semibold text-primary">Search Tenders</div>
                <div className="text-sm text-gray-500">Find tenders by category or keyword</div>
              </div>
            </Link>
          </div>
        </div>

        {/* My Bids */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-primary">My Bids</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : bids.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">You haven't submitted any bids yet.</div>
              <Link
                to="/tenders"
                className="bg-accent hover:bg-accent-dark text-white px-6 py-2 rounded-lg transition"
              >
                Browse Tenders
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tender Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary">
                          {bid.tender_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{bid.reference_no}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">
                          ${Number(bid.bid_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(bid.status)}`}>
                          {bid.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-3 py-1 rounded-full ${getTenderStatusColor(bid.tender_status)}`}>
                          {bid.tender_status?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(bid.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/tenders/${bid.tender_id}`}
                          className="text-accent hover:text-accent-dark text-sm font-medium"
                        >
                          View Tender
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
