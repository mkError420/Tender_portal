import React, { createContext, useState, useContext, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    website_name: 'Rangpur Group',
    logo_url: '',
    about_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    projects_count: '500+',
    vendors_count: '200+',
    experience_years: '15+',
    client_satisfaction: '98%'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      if (response.data.status === 'success') {
        setSettings((prev) => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
