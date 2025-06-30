import { useState, useEffect } from 'react';
import { tabService } from '../services/tabService';

export const useToggleData = () => {
  const ALL_REGIONS = [
    'Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 
    'Kolkata', 'Hyderabad', 'Bihar', 'Gujarat', 'UttarPradesh', 'MadhyaPradesh', 
    'WestBengal', 'Kerala', 'Assam', 'Odisha', 'Uttarakhand', 'Jharkhand', 
    'Chhattisgarh', 'Telangana', 'AndhraPradesh'
  ];
  const ALL_TOGGLE_TYPES = ['SHOP', 'CATEGORY'];
  const ALL_LINK_TYPES = ['DIRECT', 'ACTIVITY'];

  const [toggles, setToggles] = useState([]);
  const [allTabs, setAllTabs] = useState({});
  const [allTabObjects, setAllTabObjects] = useState([]);
  const [config, setConfig] = useState({
    tab_types: [],
    toggle_types: ALL_TOGGLE_TYPES,
    link_types: ALL_LINK_TYPES,
    regions: ALL_REGIONS
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchAllData = async () => {
    try {
      const data = await tabService.getTabsConfig();
      const allToggles = [];
      const tabTypes = new Set();
      const newAllTabs = {};
      const newAllTabObjects = [];

      data.forEach(tabData => {
        const { id, title, toggles } = tabData;
        newAllTabs[title] = toggles;
        newAllTabObjects.push({ id, title });
        tabTypes.add(title);
        
        toggles.forEach(toggle => {          
          const { start_date, end_date, ...toggleWithoutDates } = toggle;
          const existingToggle = allToggles.find(t => t.id === toggle.id);
          if (existingToggle) {
            existingToggle.tabs.push(title);
          } else {
            allToggles.push({
              ...toggleWithoutDates,
              tabs: [title]
            });
          }
        });
      });
      
      setAllTabs(newAllTabs);
      setAllTabObjects(newAllTabObjects);
      setToggles(allToggles);
      setConfig(prevConfig => ({
        ...prevConfig,
        tab_types: [...tabTypes],
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchAllData();
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
    allTabObjects,
    config,
    loading,
    error,
    success,
    fetchInitialData,
    showNotification
  };
};