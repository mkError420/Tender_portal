import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bidService } from '../../services/bidService';

const BidManagement = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTender, setFilterTender] = useState('');
  const [selectedBid, setSelectedBid] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchBids();
  }, [filterTender]);

  const fetchBids = async () => {
    try {
      const params = filterTender ? { tender_id: filterTender } : {};
      const response = await bidService.getBids(params);
      setBids(response.data.data ? response.data.data.bids : response.data.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bidId, newStatus) => {
    try {
      await bidService.updateBidStatus({ bid_id: bidId, status: newStatus });
      fetchBids();
      if (selectedBid && selectedBid.id === bidId) {
        setSelectedBid({ ...selectedBid, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleViewDetails = (bid) => {
    setSelectedBid(bid);
    setShowDetailModal(true);
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Manage Bids</h1>
          <p className="text-gray-600">Review and respond to vendor submissions</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tender ID
              </label>
              <input
                type="text"
                value={filterTender}
                onChange={(e) => setFilterTender(e.target.value)}
                placeholder="Enter tender ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              onClick={() => setFilterTender('')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-500 text-lg">No bids found.</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                        <div className="text-sm font-medium text-primary">{bid.vendor_name}</div>
                        <div className="text-sm text-gray-500">{bid.vendor_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{bid.company_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary">{bid.tender_title}</div>
                        <div className="text-sm text-gray-500">{bid.reference_no}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">
                          ${Number(bid.bid_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={bid.status}
                          onChange={(e) => handleStatusUpdate(bid.id, e.target.value)}
                          className={`text-xs px-3 py-1 rounded-full border-0 ${getStatusColor(bid.status)}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(bid.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(bid)}
                          className="text-accent hover:text-accent-dark"
                        >
                          View Details
                        </button>
                        {bid.attachment_url && (
                          <a
                            href={bid.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark"
                          >
                            View Attachment
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary">Bid Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Vendor Name</div>
                    <div className="font-semibold">{selectedBid.vendor_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Company</div>
                    <div className="font-semibold">{selectedBid.company_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-semibold">{selectedBid.vendor_email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bid Amount</div>
                    <div className="font-semibold text-primary">
                      ${Number(selectedBid.bid_amount).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Tender</div>
                  <div className="font-semibold">{selectedBid.tender_title}</div>
                  <div className="text-sm text-gray-500">{selectedBid.reference_no}</div>
                </div>

                {selectedBid.proposal_summary && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Proposal Summary</div>
                    <div className="text-gray-700 whitespace-pre-line">
                      {selectedBid.proposal_summary}
                    </div>
                  </div>
                )}

                {selectedBid.attachment_url && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Attachment</div>
                    <a
                      href={selectedBid.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-dark flex items-center gap-2"
                    >
                      <span>📄</span>
                      View Document
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Current Status</div>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedBid.status)}`}>
                      {selectedBid.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Submitted On</div>
                    <div className="font-semibold">
                      {new Date(selectedBid.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Update Status</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'shortlisted')}
                      className="flex-1 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'accepted')}
                      className="flex-1 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'rejected')}
                      className="flex-1 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default BidManagement;
