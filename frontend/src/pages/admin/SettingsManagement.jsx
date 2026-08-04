import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { getFileUrl } from '../../services/api';

const SettingsManagement = () => {
  const { settings, fetchSettings, loading: initialLoading } = useSettings();
  const [formData, setFormData] = useState({
    website_name: '',
    about_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    projects_count: '',
    vendors_count: '',
    experience_years: '',
    client_satisfaction: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        website_name: settings.website_name || '',
        about_text: settings.about_text || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        projects_count: settings.projects_count || '',
        vendors_count: settings.vendors_count || '',
        experience_years: settings.experience_years || '',
        client_satisfaction: settings.client_satisfaction || '',
      });
      if (settings.logo_url) {
        setLogoPreview(getFileUrl(settings.logo_url));
      }
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const response = await settingsService.updateSettings(data);
      if (response.data.status === 'success') {
        setSuccess('Settings updated successfully!');
        fetchSettings(); // Refresh context
      } else {
        setError(response.data.message || 'Failed to update settings');
      }
    } catch (err) {
      setError('Error updating settings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Website Settings</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        
        {/* General Settings */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">General</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website_name">
            Website Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="website_name"
            name="website_name"
            type="text"
            value={formData.website_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Website Logo
          </label>
          <div className="flex items-center space-x-4">
            {logoPreview && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-light file:text-primary-dark
                hover:file:bg-primary hover:file:text-white
                transition-colors"
            />
          </div>
        </div>

        {/* About Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">About Section</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="about_text">
            About Text
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            id="about_text"
            name="about_text"
            value={formData.about_text}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projects_count">
              Completed Projects
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="projects_count"
              name="projects_count"
              type="text"
              value={formData.projects_count}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vendors_count">
              Registered Vendors
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="vendors_count"
              name="vendors_count"
              type="text"
              value={formData.vendors_count}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience_years">
              Years Experience
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="experience_years"
              name="experience_years"
              type="text"
              value={formData.experience_years}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client_satisfaction">
              Client Satisfaction
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="client_satisfaction"
              name="client_satisfaction"
              type="text"
              value={formData.client_satisfaction}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Contact Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">Contact Information</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_email">
            Contact Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_phone">
            Contact Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contact_phone"
            name="contact_phone"
            type="text"
            value={formData.contact_phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_address">
            Contact Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contact_address"
            name="contact_address"
            type="text"
            value={formData.contact_address}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center justify-end mt-8">
          <button
            className={`bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagement;
