import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenderService } from '../../services/tenderService';
import { getFileUrl } from '../../services/api';
import { loadStoredCategories, mergeCategories, persistCategories, normalizeCategory } from '../../utils/categories';

const TenderManagement = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [files, setFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingTender, setDeletingTender] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(() => loadStoredCategories());
  const [formData, setFormData] = useState({
    title: '',
    reference_no: '',
    description: '',
    category: '',
    supplier_requirements: '',
    estimated_budget: '',
    publish_date: '',
    closing_date: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    const handleCategoryUpdate = () => {
      setCategoryOptions(loadStoredCategories());
    };

    window.addEventListener('tender-categories-updated', handleCategoryUpdate);
    return () => window.removeEventListener('tender-categories-updated', handleCategoryUpdate);
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await tenderService.getTenders();
      let fetchedTenders = response.data.data ? response.data.data.tenders : response.data.tenders;
      
      // Ensure documents are included for each tender
      if (Array.isArray(fetchedTenders)) {
        fetchedTenders = fetchedTenders.map(tender => ({
          ...tender,
          documents: tender.documents || []
        }));
      }
      
      setTenders(fetchedTenders);

      if (Array.isArray(fetchedTenders)) {
        const existingCategories = fetchedTenders
          .map((tender) => tender.category)
          .filter(Boolean);
        setCategoryOptions((prev) => mergeCategories(prev, existingCategories));
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTender(null);
    setFormData({
      title: '',
      reference_no: '',
      description: '',
      category: '',
      supplier_requirements: '',
      estimated_budget: '',
      publish_date: new Date().toISOString().split('T')[0],
      closing_date: '',
      status: 'draft',
    });
    setFiles([]);
    setExistingDocuments([]);
    setShowModal(true);
  };

  const handleEdit = (tender) => {
    setEditingTender(tender);
    setFormData({
      title: tender.title,
      reference_no: tender.reference_no,
      description: tender.description,
      category: tender.category,
      supplier_requirements: tender.supplier_requirements || '',
      estimated_budget: tender.estimated_budget || '',
      publish_date: tender.publish_date,
      closing_date: tender.closing_date,
      status: tender.status,
    });
    setFiles([]);
    setExistingDocuments(tender.documents || []);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await tenderService.deleteDocument(documentId);
      setExistingDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.response?.data?.error || 'Error deleting document. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const normalizedCategory = normalizeCategory(formData.category);
    const nextCategories = persistCategories([...categoryOptions, normalizedCategory]);
    setCategoryOptions(nextCategories);

    const payload = {
      ...formData,
      category: normalizedCategory,
    };
    
    try {
      let tenderId;
      
      if (editingTender) {
        await tenderService.updateTender({ ...payload, id: editingTender.id });
        tenderId = editingTender.id;
      } else {
        const response = await tenderService.createTender(payload);
        tenderId = response.data?.data?.id || response.data?.tender_id || response.data?.id;
      }
      
      // Upload files if any
      if (files.length > 0 && tenderId) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('file[]', file);
        });
        formData.append('tender_id', String(tenderId));

        try {
          await tenderService.uploadDocument(formData);
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
          const uploadErrorMessage = uploadError.response?.data?.error || uploadError.message || 'Unknown error';
          alert(`Tender saved but document upload failed: ${uploadErrorMessage}. Please try uploading documents again.`);
        }
      }
      
      setShowModal(false);
      setFiles([]);
      setExistingDocuments([]);
      fetchTenders();
    } catch (error) {
      console.error('Error saving tender:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving tender. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (tender) => {
    setDeletingTender(tender);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTender) return;
    setDeleteLoading(true);
    try {
      await tenderService.deleteTender(deletingTender.id);
      setDeletingTender(null);
      fetchTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert(error.response?.data?.error || 'Error deleting tender. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (tender, newStatus) => {
    try {
      await tenderService.updateTender({ id: tender.id, status: newStatus });
      fetchTenders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
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
    <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Tender Management</h1>
            <p className="text-gray-600">Create and manage tender opportunities</p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Create Tender
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tenders.length === 0 ? (
          <div className="bg-white border border-gray-300 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tenders Yet</h3>
            <p className="text-gray-600 mb-6">Create your first tender to get started.</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Create First Tender
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Closing Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bids
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {tenders.map((tender) => (
                    <tr key={tender.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{tender.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{tender.reference_no}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{tender.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={tender.status}
                          onChange={(e) => handleStatusChange(tender, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 border cursor-pointer ${getStatusColor(tender.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="under_review">Under Review</option>
                          <option value="awarded">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(tender.closing_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {tender.bid_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(tender)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                          >
                            Edit
                          </button>
                          <Link
                            to={`/tenders/${tender.id}`}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(tender)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingTender && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-6">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Tender</h3>
                  <p className="text-gray-600 text-sm">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{deletingTender.title}"</span>? This will also delete all associated bids and documents. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeletingTender(null)}
                  disabled={deleteLoading}
                  className="px-5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTender ? 'Edit Tender' : 'Create New Tender'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="tender-categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Type or select a category"
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="tender-categories">
                    {categoryOptions.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">New categories are saved automatically for future tenders.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Requirements
                  </label>
                  <textarea
                    rows="4"
                    value={formData.supplier_requirements}
                    onChange={(e) => setFormData({ ...formData, supplier_requirements: e.target.value })}
                    placeholder="Enter specific requirements for suppliers (e.g., certifications, experience, etc.)"
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can upload multiple files at once</p>
                  
                  {existingDocuments && existingDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Existing Documents:</h4>
                      {existingDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{doc.file_name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={getFileUrl(doc.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingDocument(doc.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">New Files to Upload:</h4>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Budget (BDT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimated_budget}
                      onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="under_review">Under Review</option>
                      <option value="awarded">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.publish_date}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.closing_date}
                      onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : (editingTender ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default TenderManagement;
