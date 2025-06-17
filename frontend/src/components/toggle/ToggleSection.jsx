import React from 'react';
import { Calendar, MapPin, Link, Plus, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export const ToggleSection = ({ 
  toggle, 
  onCreateTab, 
  onEditToggle, 
  onDeleteToggle, 
  onResetToggle 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
      <div className="bg-gradient-to-r from-green-600 to-lime-600 p-6">
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
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => onCreateTab(toggle)}
              icon={Plus}
            >
              Add Tab
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onEditToggle(toggle)}
              icon={Edit3}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Toggle Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{toggle.start_date} - {toggle.end_date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <div className="flex flex-wrap gap-1">
                {toggle.regions?.map(region => (
                  <span key={region} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {region}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Link size={16} />
              <span className="truncate">
                {typeof toggle.links?.default === 'string'
                  ? toggle.links.default
                  : typeof Object.values(toggle.links || {})[0] === 'string'
                    ? Object.values(toggle.links || {})[0]
                    : 'No link'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Associated Tabs</h3>
            <div className="space-y-2">
              {toggle.tabs.map((tabName) => (
                <div 
                  key={tabName}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="font-medium text-gray-700">{tabName}</span>
                </div>
              ))}
              {toggle.tabs.length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500">No tabs associated</p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onCreateTab(toggle)}
                    icon={Plus}
                    className="mt-2"
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
            variant="danger" 
            size="sm" 
            onClick={() => onDeleteToggle(toggle.id)}
            icon={Trash2}
          >
            Delete Toggle
          </Button>
          <Button 
            variant="warning" 
            size="sm" 
            onClick={() => onResetToggle(toggle.id)}
            icon={RotateCcw}
          >
            Reset Toggle
          </Button>
        </div>
      </div>
    </div>
  );
}; 