import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';
import { bidService } from '../../services/bidService';
import { useAuth } from '../../context/AuthContext';

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isVendor } = useAuth();
  
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({
    bid_amount: '',
    proposal_summary: '',
  });
  const [bidFiles, setBidFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTender();
  }, [id]);

  const fetchTender = async () => {
    try {
      const response = await tenderService.getTender(id);
      const fetchedTender = response.data.data ? response.data.data.tender : response.data.tender;
      setTender(fetchedTender);
    } catch (error) {
      console.error('Error fetching tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isVendor) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tender_id', id);
      formData.append('bid_amount', bidForm.bid_amount);
      formData.append('proposal_summary', bidForm.proposal_summary);
      if (bidFiles && bidFiles.length > 0) {
        bidFiles.forEach((file) => {
          formData.append('attachments[]', file);
        });
      }

      await bidService.submitBid(formData);
      alert('Bid submitted successfully!');
      setShowBidForm(false);
      setBidForm({ bid_amount: '', proposal_summary: '' });
      setBidFiles([]);
      setTender((prevTender) => prevTender ? { ...prevTender, has_bid: true } : prevTender);
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error submitting bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeRemaining = (closingDate) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing - now;
    
    if (diff <= 0) return 'Closed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  const hasSubmittedBid = tender?.has_bid;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Tender not found</h2>
          <Link to="/tenders" className="text-accent hover:text-accent-dark">
            Back to Tenders
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = new Date(tender.closing_date) <= new Date();

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/tenders" className="text-accent hover:text-accent-dark mb-6 inline-block">
          ← Back to Tenders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm px-4 py-2 rounded-full ${getStatusColor(tender.status)}`}>
                  {tender.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-gray-500 text-sm">
                  Reference: {tender.reference_no}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-primary mb-4">{tender.title}</h1>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="font-semibold text-primary">{tender.category}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Published</div>
                  <div className="font-semibold">{new Date(tender.publish_date).toLocaleDateString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Closing Date</div>
                  <div className="font-semibold">{new Date(tender.closing_date).toLocaleDateString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
                  <div className="font-semibold text-accent">{getTimeRemaining(tender.closing_date)}</div>
                </div>
              </div>

              {tender.estimated_budget && (
                <div className="bg-primary-light p-4 rounded-lg mb-6">
                  <div className="text-sm text-gray-300 mb-1">Estimated Budget</div>
                  <div className="text-2xl font-bold text-gold">
                    BDT {Number(tender.estimated_budget).toLocaleString('en-US')}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-primary mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-line">{tender.description}</p>
              </div>

              {tender.documents && tender.documents.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-3">Documents</h2>
                  <div className="space-y-2">
                    {tender.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <span className="text-2xl">📄</span>
                        <div>
                          <div className="font-medium text-primary">{doc.file_name}</div>
                          <div className="text-sm text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Bids:</span>
                  <span className="font-semibold">{tender.bid_count || 0}</span>
                </div>
                
                {tender.created_by_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created By:</span>
                    <span className="font-semibold">{tender.created_by_name}</span>
                  </div>
                )}
              </div>

              {tender.status === 'active' && !isClosed && (
                <div className="mt-6">
                  {isAuthenticated && isVendor ? (
                    hasSubmittedBid ? (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                        You already submitted a bid for this tender. It is no longer available for you to bid again.
                      </div>
                    ) : !showBidForm ? (
                      <button
                        onClick={() => setShowBidForm(true)}
                        className="w-full bg-gold hover:bg-gold-dark text-primary-dark font-semibold py-3 rounded-lg transition"
                      >
                        Submit Proposal
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowBidForm(false)}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    )
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full bg-gold hover:bg-gold-dark text-primary-dark font-semibold py-3 rounded-lg transition text-center"
                    >
                      Login to Submit Bid
                    </Link>
                  )}
                </div>
              )}

              {isClosed && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-red-800 font-semibold">This tender is closed</div>
                </div>
              )}
            </div>

            {/* Bid Form */}
            {showBidForm && !hasSubmittedBid && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Submit Your Bid</h3>
                <form onSubmit={handleBidSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Amount (BDT)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={bidForm.bid_amount}
                      onChange={(e) => setBidForm({ ...bidForm, bid_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal Summary
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={bidForm.proposal_summary}
                      onChange={(e) => setBidForm({ ...bidForm, proposal_summary: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Describe your proposal..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (PDF, DOC, DOCX, ZIP) - multiple files allowed
                    </label>
                    <input
                      type="file"
                      name="attachments[]"
                      accept=".pdf,.doc,.docx,.zip"
                      multiple
                      onChange={(e) => setBidFiles(Array.from(e.target.files))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {bidFiles.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected files: {bidFiles.map((file) => file.name).join(', ')}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetail;
