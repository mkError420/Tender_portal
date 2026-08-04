import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';
import { CATEGORY_UPDATED_EVENT, loadStoredCategories, mergeCategories } from '../../utils/categories';

const Home = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: ''
  });
  const [categoryOptions, setCategoryOptions] = useState(() => loadStoredCategories());

  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  useEffect(() => {
    const handleCategoryUpdate = () => {
      setCategoryOptions(loadStoredCategories());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, handleCategoryUpdate);
    return () => window.removeEventListener(CATEGORY_UPDATED_EVENT, handleCategoryUpdate);
  }, []);

  const fetchActiveTenders = async () => {
    try {
      const response = await tenderService.getTenders({ status: 'active' });
      const tenders = response.data.data ? response.data.data.tenders : response.data.tenders;
      setTenders(tenders.slice(0, 6));
      setCategoryOptions((prev) => mergeCategories(prev, (tenders || []).map((tender) => tender.category)));
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
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

  const handleSearchInputChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      search: e.target.value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      category: e.target.value
    });
  };

  const handleSearch = () => {
    // Navigate to TenderListing with search parameters
    const params = new URLSearchParams();
    if (searchFilters.search) params.append('search', searchFilters.search);
    if (searchFilters.category) params.append('category', searchFilters.category);
    
    navigate(`/tenders?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Rangpur Group
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your Trusted Tender Management Portal
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/tenders"
                className="bg-gold hover:bg-gold-dark text-primary-dark font-semibold px-8 py-3 rounded-lg transition"
              >
                Browse Tenders
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary font-semibold px-8 py-3 rounded-lg transition"
              >
                Register as Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="bg-white py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchFilters.search}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select 
              value={searchFilters.category}
              onChange={handleCategoryChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-lg transition text-center"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Latest Tenders */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-8">Latest Active Tenders</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : tenders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active tenders available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-accent text-white text-xs px-3 py-1 rounded-full">
                        {tender.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tender.reference_no}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2 line-clamp-2">
                      {tender.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tender.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>
                        Closes: {new Date(tender.closing_date).toLocaleDateString()}
                      </span>
                      {tender.estimated_budget && (
                        <span className="font-semibold text-primary">
                          BDT {Number(tender.estimated_budget).toLocaleString('en-US')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenTenderDetails(tender.id)}
                      className="block w-full bg-primary hover:bg-primary-dark text-white text-center py-2 rounded-lg transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/tenders"
              className="text-accent hover:text-accent-dark font-semibold"
            >
              View All Tenders →
            </Link>
          </div>
        </div>
      </section>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-2xl font-semibold text-primary">
                  Tender Details
                </h3>
                <p className="text-sm text-gray-500">
                  Review the full details for this tender.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
              {detailLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : selectedTender ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold uppercase tracking-wide text-accent">
                        {selectedTender.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedTender.reference_no}
                      </span>
                    </div>
                    <h4 className="text-3xl font-bold text-primary">
                      {selectedTender.title}
                    </h4>
                    <p className="text-gray-600 whitespace-pre-line">
                      {selectedTender.description}
                    </p>
                    {selectedTender.supplier_requirements && (
                      <div className="mt-4">
                        <h5 className="text-lg font-semibold text-primary mb-2">Supplier Requirements</h5>
                        <p className="text-gray-600 whitespace-pre-line">{selectedTender.supplier_requirements}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-100 border border-slate-200 p-5">
                      <h5 className="text-lg font-semibold text-slate-900 mb-3">Key Dates</h5>
                      <p className="text-slate-700">Open Date: {new Date(selectedTender.opening_date).toLocaleDateString()}</p>
                      <p className="text-slate-700">Close Date: {new Date(selectedTender.closing_date).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 border border-slate-200 p-5">
                      <h5 className="text-lg font-semibold text-slate-900 mb-3">Budget & Location</h5>
                      {selectedTender.estimated_budget && (
                        <p className="text-slate-700">Estimated Budget: BDT {Number(selectedTender.estimated_budget).toLocaleString('en-US')}</p>
                      )}
                      {selectedTender.location && (
                        <p className="text-slate-700">Location: {selectedTender.location}</p>
                      )}
                    </div>
                  </div>

                  {selectedTender.documents && selectedTender.documents.length > 0 && (
                    <div className="rounded-2xl bg-gray-50 p-5">
                      <h5 className="text-lg font-semibold text-primary mb-3">Attachments</h5>
                      <ul className="space-y-2">
                        {selectedTender.documents.map((document, index) => (
                          <li key={`${document}-${index}`}>
                            <a
                              href={document}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:text-accent-dark underline"
                            >
                              Document {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <span className="text-sm text-gray-500">
                      View more details or submit your bid from the tender listing page.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseDetailModal();
                        navigate(`/tenders/${selectedTender.id}`);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition"
                    >
                      Open Tender Page
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Tender details unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">About Rangpur Group</h2>
              <p className="text-gray-300 mb-6">
                Rangpur Group is a leading organization committed to transparency and efficiency 
                in procurement processes. Our tender management portal provides a secure and 
                user-friendly platform for vendors to participate in our procurement opportunities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="text-gold mr-3">✓</span>
                  Transparent bidding process
                </li>
                <li className="flex items-center">
                  <span className="text-gold mr-3">✓</span>
                  Real-time status updates
                </li>
                <li className="flex items-center">
                  <span className="text-gold mr-3">✓</span>
                  Secure document management
                </li>
                <li className="flex items-center">
                  <span className="text-gold mr-3">✓</span>
                  Easy bid submission
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-primary-light p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold mb-2">500+</div>
                <div className="text-gray-300">Completed Projects</div>
              </div>
              <div className="bg-primary-light p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold mb-2">200+</div>
                <div className="text-gray-300">Registered Vendors</div>
              </div>
              <div className="bg-primary-light p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold mb-2">15+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
              <div className="bg-primary-light p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold mb-2">98%</div>
                <div className="text-gray-300">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
