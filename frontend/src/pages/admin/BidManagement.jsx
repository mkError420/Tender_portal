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
      const fetchedBids = response.data.data ? response.data.data.bids : response.data.bids;
      
      const sortedBids = fetchedBids.sort((a, b) => {
        const amountA = parseFloat(a.bid_amount) || 0;
        const amountB = parseFloat(b.bid_amount) || 0;
        return amountB - amountA;
      });
      
      setBids(sortedBids);
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
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Bid Management</h1>
          <p className="text-gray-600">Review and respond to vendor submissions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Found</h3>
            <p className="text-gray-600">Bids will appear here once vendors submit proposals.</p>
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
                      Tender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bid Amount (BDT) ↓
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bids.map((bid, index) => (
                    <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold mr-3">
                            {bid.vendor_name?.charAt(0).toUpperCase() || 'V'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bid.vendor_name}</div>
                            <div className="text-sm text-gray-500">{bid.vendor_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bid.company_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{bid.tender_title}</div>
                        <div className="text-sm text-gray-500">{bid.reference_no}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-gray-900">
                            BDT {Number(bid.bid_amount).toLocaleString('en-US')}
                          </div>
                          {index === 0 && (
                            <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              Highest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={bid.status}
                          onChange={(e) => handleStatusUpdate(bid.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${getStatusColor(bid.status)}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(bid.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(bid)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        {bid.attachment_url && (
                          <a
                            href={bid.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
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

        {showDetailModal && selectedBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Bid Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Vendor Name</div>
                    <div className="font-semibold text-gray-900">{selectedBid.vendor_name}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Company</div>
                    <div className="font-semibold text-gray-900">{selectedBid.company_name || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Email</div>
                    <div className="font-semibold text-gray-900">{selectedBid.vendor_email}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Bid Amount (BDT)</div>
                    <div className="font-semibold text-gray-900">
                      BDT {Number(selectedBid.bid_amount).toLocaleString('en-US')}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Tender</div>
                  <div className="font-semibold text-gray-900">{selectedBid.tender_title}</div>
                  <div className="text-sm text-gray-600">{selectedBid.reference_no}</div>
                </div>

                {selectedBid.proposal_summary && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Proposal Summary</div>
                    <div className="text-gray-700 whitespace-pre-line">
                      {selectedBid.proposal_summary}
                    </div>
                  </div>
                )}

                {selectedBid.attachment_url && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Attachment</div>
                    <a
                      href={selectedBid.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
                    >
                      <span>📄</span>
                      View Document
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Current Status</div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(selectedBid.status)}`}>
                      {selectedBid.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Submitted On</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedBid.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Update Status</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'shortlisted')}
                      className="flex-1 py-2.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'accepted')}
                      className="flex-1 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedBid.id, 'rejected')}
                      className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
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

export default BidManagement;