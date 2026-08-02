import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';

const TenderListing = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    category: '',
    search: '',
  });

  useEffect(() => {
    fetchTenders();
  }, [filters]);

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
                              Budget: ${Number(tender.estimated_budget).toLocaleString()}
                            </span>
                          )}
                          <span>
                            <span className="font-medium">Bids:</span> {tender.bid_count || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/tenders/${tender.id}`}
                          className="bg-primary hover:bg-primary-dark text-white text-center py-2 px-6 rounded-lg transition"
                        >
                          View Details
                        </Link>
                        {tender.status === 'active' && (
                          <Link
                            to={`/tenders/${tender.id}`}
                            className="bg-gold hover:bg-gold-dark text-primary-dark text-center py-2 px-6 rounded-lg transition"
                          >
                            Submit Bid
                          </Link>
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
    </div>
  );
};

export default TenderListing;
