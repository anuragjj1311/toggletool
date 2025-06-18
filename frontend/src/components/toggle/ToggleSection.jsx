import React from 'react';
import { Calendar, MapPin, Link, Plus, Edit3, Power } from 'lucide-react';
import { Button } from '../common/Button';

export const ToggleSection = ({ 
  toggle, 
  onCreateTab, 
  onEditToggle, 
  onDeleteToggle,
  onRestoreToggle
}) => {
  const isDisabled = toggle.deleted_at !== null;

  const handleToggleStatus = (toggleId) => {
    if (isDisabled) {
      onRestoreToggle(toggleId);
    } else {
      onDeleteToggle(toggleId);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border ${
      isDisabled ? 'border-gray-200' : 'border-green-100'
    }`}>
      <div className={`bg-gradient-to-r p-6 ${
        isDisabled 
          ? 'from-gray-500 to-gray-400'
          : 'from-green-600 to-lime-600'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{toggle.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                {toggle.type}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                {toggle.link_type}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                {isDisabled ? 'Disabled' : 'Enabled'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => onCreateTab(toggle)}
              icon={Plus}
              disabled={isDisabled}
            >
              Add Tab
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onEditToggle(toggle)}
              icon={Edit3}
              disabled={isDisabled}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Toggle Details */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{toggle.start_date} - {toggle.end_date}</span>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ALL Tabs</h3>
            <div className="flex flex-wrap gap-2">
              {toggle.tabs.map((tabName) => (
                <div 
                  key={tabName}
                  className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="font-medium text-gray-700">{tabName}</span>
                </div>
              ))}
              {toggle.tabs.length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 w-full">
                  <p className="text-gray-500">No tabs associated</p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onCreateTab(toggle)}
                    icon={Plus}
                    className="mt-2"
                    disabled={isDisabled}
                  >
                    Add Tab
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant={isDisabled ? "success" : "danger"}
            size="sm" 
            onClick={() => handleToggleStatus(toggle.id)}
            icon={Power}
          >
            {isDisabled ? 'Enable' : 'Disable'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 