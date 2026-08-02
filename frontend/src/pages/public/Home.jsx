import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';

const Home = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  const fetchActiveTenders = async () => {
    try {
      const response = await tenderService.getTenders({ status: 'active' });
      const tenders = response.data.data ? response.data.data.tenders : response.data.tenders;
      setTenders(tenders.slice(0, 6));
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="">All Categories</option>
              <option value="construction">Construction</option>
              <option value="it">IT Services</option>
              <option value="supplies">Supplies</option>
              <option value="consulting">Consulting</option>
            </select>
            <Link
              to="/tenders"
              className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-lg transition text-center"
            >
              Search
            </Link>
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
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="block w-full bg-primary hover:bg-primary-dark text-white text-center py-2 rounded-lg transition"
                    >
                      View Details
                    </Link>
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
