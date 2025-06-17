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
  onResetToggle, 
  onCreateTab 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
      <div className="bg-gradient-to-r from-green-600 to-lime-600 p-6">
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
              onEdit={onEditToggle}
              onDelete={onDeleteToggle}
              onReset={onResetToggle}
              onCreateTab={onCreateTab}
            />
          ))}
        </div>
      </div>
    </div>
  );
};