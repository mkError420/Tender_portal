import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';
import { useAuth } from '../../context/AuthContext';

const TenderListing = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    category: '',
    search: '',
  });
  const [selectedTender, setSelectedTender] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const { isVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenders();
  }, [filters, isVendor]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      
      const response = await tenderService.getTenders(params);
      setTenders(response.data.data ? response.data.data.tenders : response.data.tenders);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTenders();
  };

  const handleOpenTenderDetails = async (id) => {
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const response = await tenderService.getTender(id);
      const fetchedTender = response.data.data ? response.data.data.tender : response.data.tender;
      setSelectedTender(fetchedTender);
    } catch (error) {
      console.error('Error fetching tender details:', error);
      alert('Unable to load tender details. Please try again.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTender(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Browse Tenders</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title or reference..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Categories</option>
                <option value="construction">Construction</option>
                <option value="it">IT Services</option>
                <option value="supplies">Supplies</option>
                <option value="consulting">Consulting</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-2 rounded-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : tenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-500 text-lg">No tenders found matching your criteria.</div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {tenders.length} tender(s)
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {tenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(tender.status)}`}>
                            {tender.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {tender.reference_no}
                          </span>
                        </div>
                        {isVendor && tender.has_bid && (
                          <div className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold">
                            Bid already submitted
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-primary mb-2">
                          {tender.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {tender.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>
                            <span className="font-medium">Category:</span> {tender.category}
                          </span>
                          <span>
                            <span className="font-medium">Closing:</span>{' '}
                            {new Date(tender.closing_date).toLocaleDateString()}
                          </span>
                          {tender.estimated_budget && (
                            <span className="font-semibold text-primary">
                              Budget: BDT {Number(tender.estimated_budget).toLocaleString('en-US')}
                            </span>
                          )}
                          <span>
                            <span className="font-medium">Bids:</span> {tender.bid_count || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTenderDetails(tender.id)}
                          className="bg-primary hover:bg-primary-dark text-white text-center py-2 px-6 rounded-lg transition"
                        >
                          View Details
                        </button>
                        {tender.status === 'active' && (
                          isVendor && tender.has_bid ? (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-600 text-center py-2 px-6 rounded-lg transition cursor-not-allowed"
                            >
                              Already Submitted
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/tenders/${tender.id}`)}
                              className="bg-gold hover:bg-gold-dark text-primary-dark text-center py-2 px-6 rounded-lg transition"
                            >
                              Submit Bid
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[70vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Tender Details</h2>
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : selectedTender ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{selectedTender.title}</h3>
                      <p className="text-sm text-gray-500">Reference: {selectedTender.reference_no}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedTender.status)}`}>
                      {selectedTender.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="text-xs text-gray-500 uppercase">Category</div>
                      <div className="font-semibold text-gray-900">{selectedTender.category}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="text-xs text-gray-500 uppercase">Closing Date</div>
                      <div className="font-semibold text-gray-900">{new Date(selectedTender.closing_date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {selectedTender.estimated_budget && (
                    <div className="rounded-lg bg-primary-light p-4">
                      <div className="text-xs text-gray-300 uppercase">Estimated Budget</div>
                      <div className="text-2xl font-bold text-gold">BDT {Number(selectedTender.estimated_budget).toLocaleString('en-US')}</div>
                    </div>
                  )}

                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-xs text-gray-500 uppercase mb-2">Description</div>
                    <p className="text-gray-700 whitespace-pre-line">{selectedTender.description}</p>
                  </div>

                  {selectedTender.documents && selectedTender.documents.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="text-xs text-gray-500 uppercase mb-3">Documents</div>
                      <div className="space-y-2">
                        {selectedTender.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-100 transition"
                          >
                            <span className="text-2xl">📄</span>
                            <div>
                              <div className="font-medium text-gray-900">{doc.file_name}</div>
                              <div className="text-sm text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseDetailModal}
                      className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseDetailModal();
                        navigate(`/tenders/${selectedTender.id}`);
                      }}
                      className="w-full sm:w-auto rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-primary-dark hover:bg-gold-dark transition"
                    >
                      Open Tender Page
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600">Tender details not available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderListing;
