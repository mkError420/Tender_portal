import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getFileUrl } from '../services/api';

const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-primary-dark text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings?.logo_url ? (
                <img src={getFileUrl(settings.logo_url)} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <div className="text-gold font-bold text-2xl">RG</div>
              )}
              <div className="text-white font-semibold">{settings?.website_name || 'Rangpur Group'}</div>
            </div>
            <p className="text-sm">
              Your trusted partner for tender management and procurement solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tenders" className="hover:text-white transition">
                  Browse Tenders
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: {settings?.contact_email || 'elearning.rcnc@gmail.com'}</li>
              <li>Phone: {settings?.contact_phone || '+880 17**-******'}</li>
              <li>{settings?.contact_address || 'Rangpur, Bangladesh'}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {settings?.website_name || 'Rangpur Group'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
