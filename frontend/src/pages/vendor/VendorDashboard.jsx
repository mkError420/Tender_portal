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

  const [filterStatus, setFilterStatus] = useState('');

  const stats = {
    total: bids.length,
    submitted: bids.filter(b => b.status === 'submitted').length,
    shortlisted: bids.filter(b => b.status === 'shortlisted').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  const filteredBids = filterStatus
    ? bids.filter((b) => b.status === filterStatus)
    : bids;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary-light flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.name?.[0] || 'V'}
                </div>
                <div>
                  <div className="text-lg font-semibold text-primary">{user?.name}</div>
                  <div className="text-sm text-gray-500">{user?.company_name || 'Vendor'}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Bid Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 uppercase">Total</div>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-blue-50">
                  <div className="text-xs text-blue-600 uppercase">Submitted</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-yellow-50">
                  <div className="text-xs text-yellow-700 uppercase">Shortlisted</div>
                  <div className="text-2xl font-bold text-yellow-700">{stats.shortlisted}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-green-50">
                  <div className="text-xs text-green-700 uppercase">Accepted</div>
                  <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/tenders"
                  className="block rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 hover:border-primary hover:bg-primary/5 transition"
                >
                  <div className="text-sm font-semibold text-primary">Browse Tenders</div>
                  <div className="text-sm text-gray-500">See new opportunities and submit bids.</div>
                </Link>
                <Link
                  to="/tenders"
                  className="block rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 hover:border-primary hover:bg-primary/5 transition"
                >
                  <div className="text-sm font-semibold text-primary">Search Tenders</div>
                  <div className="text-sm text-gray-500">Filter tenders by category and status.</div>
                </Link>
              </div>
            </div>
          </aside>

          <main>
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 border-b border-gray-200 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary">My Bids</h2>
                  <p className="text-sm text-gray-500">Review your submitted proposals and track tender status.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <label className="text-sm font-medium text-gray-700">Filter status</label>
                  <select
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredBids.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-500 text-lg mb-4">No bids match your filter yet.</div>
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
                      {filteredBids.map((bid) => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary">{bid.tender_title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{bid.reference_no}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-primary">BDT {Number(bid.bid_amount).toLocaleString('en-US')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(bid.status)}`}>{bid.status.replace('_', ' ').toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-3 py-1 rounded-full ${getTenderStatusColor(bid.tender_status)}`}>{bid.tender_status?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{new Date(bid.submitted_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/tenders/${bid.tender_id}`} className="text-accent hover:text-accent-dark text-sm font-medium">View Tender</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
