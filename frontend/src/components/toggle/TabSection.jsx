import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { ToggleCard } from './ToggleCard';

export const TabSection = ({ 
  tabName, 
  toggles, 
  onCreateToggle, 
  onEditToggle, 
  onDeleteToggle,
  onRestoreToggle,
  onCreateTab 
}) => {
  const handleToggleStatus = (toggleId, tabName) => {
    const toggle = toggles.find(t => t.id === toggleId);
    if (!toggle) return;

    if (toggle.deleted_at !== null) {
      onRestoreToggle(toggleId, tabName);
    } else {
      onDeleteToggle(toggleId, tabName);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{tabName}</h2>
            <p className="text-green-100 mt-1">{toggles.length} toggle{toggles.length !== 1 ? 's' : ''}</p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => onCreateToggle(tabName)}
            icon={Plus}
          >
            Add Tab
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toggles.map((toggle) => (
            <ToggleCard
              key={toggle.id}
              toggle={toggle}
              tabName={tabName}
              imageUrl={toggle.image_url}
              onEdit={onEditToggle}
              onToggleStatus={handleToggleStatus}
              onCreateTab={onCreateTab}
            />
          ))}
        </div>
      </div>
    </div>
  );
};