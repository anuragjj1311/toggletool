import { useState, useEffect } from 'react';
import { toggleService } from '../services/toggleService';
import { tabService } from '../services/tabService';

export const useToggleData = () => {
  const [toggles, setToggles] = useState([]);
  const [allTabs, setAllTabs] = useState({});
  const [allTabObjects, setAllTabObjects] = useState([]);
  const [config, setConfig] = useState({
    tab_types: [],
    toggle_types: [],
    link_types: [],
    regions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchConfig = async () => {
    try {
      const data = await toggleService.getAvailableOptions();
      setConfig({
        tab_types: data.tab_types || [],
        toggle_types: data.toggle_types || [],
        link_types: data.link_types || [],
        regions: data.regions || []
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  };

  const fetchAllData = async () => {
    try {
      const data = await tabService.getTabsConfig();
      setAllTabs(data || {});
      console.log('allTabs:', data); 
      const allToggles = [];
      Object.entries(data || {}).forEach(([tabName, togglesInTab]) => {
        togglesInTab.forEach(toggle => {
          const { start_date, end_date, ...toggleWithoutDates } = toggle;
          const existingToggle = allToggles.find(t => t.id === toggle.id);
          if (existingToggle) {
            existingToggle.tabs.push(tabName);
          } else {
            allToggles.push({
              ...toggleWithoutDates,
              tabs: [tabName]
            });
          }
        });
      });
      setToggles(allToggles);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const fetchAllTabObjects = async () => {
    try {
      const tabs = await tabService.getAllTabs();
      setAllTabObjects(tabs);
    } catch (error) {
      console.error('Error fetching all tab objects:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchConfig(), fetchAllData()]);
    } catch (error) {
      setError('Failed to load data. Please try again.',error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchAllTabObjects();
  }, []);

  return {
    toggles,
    allTabs,
    allTabObjects,
    config,
    loading,
    error,
    success,
    fetchInitialData,
    showNotification
  };
};