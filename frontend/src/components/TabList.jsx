import React, { useState, useEffect } from 'react';
import { tabService } from '../services/tabService';

const TabList = () => {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const data = await tabService.getTabsConfig();
        setTabs(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTabs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tabs</h2>
      <div className="grid gap-4">
        {tabs.map((tab) => (
          <div key={tab.id} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">{tab.title}</h3>
            <p className="text-gray-600">{tab.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabList; 