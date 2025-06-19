import { useState, useEffect } from 'react';
import { toggleService } from '../services/toggleService';
import { tabService } from '../services/tabService';

export const useToggleData = () => {
  const [toggles, setToggles] = useState([]);
  const [allTabs, setAllTabs] = useState({});
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
      console.log('Fetched config:', data);
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
      setAllTabs(data.all_tabs || {});
      const allToggles = [];
      Object.entries(data.all_tabs || {}).forEach(([tabName, togglesInTab]) => {
        togglesInTab.forEach(toggle => {

          const existingToggle = allToggles.find(t => t.id === toggle.id);
          if (existingToggle) {

            existingToggle.tabs.push(tabName);
          } else {

            allToggles.push({
              ...toggle,
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
  }, []);

  return {
    toggles,
    allTabs,
    config,
    loading,
    error,
    success,
    fetchInitialData,
    showNotification
  };
};