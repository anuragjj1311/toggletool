import React from 'react';
import { Calendar, MapPin, Link, Plus, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export const ToggleCard = ({ 
  toggle, 
  tabName, 
  onEdit, 
  onDelete, 
  onReset, 
  onCreateTab 
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl border-2 border-green-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">{toggle.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              toggle.type === 'SHOP' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {toggle.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              toggle.link_type === 'DIRECT' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {toggle.link_type}
            </span>
          </div>
        </div>
        {toggle.image_url && (
          <img 
            src={toggle.image_url} 
            alt={toggle.title}
            className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
          />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{toggle.start_date} - {toggle.end_date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} />
          <div className="flex flex-wrap gap-1">
            {toggle.regions?.map(region => (
              <span key={region} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {region}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link size={14} />
          <span className="truncate">
            {toggle.links?.default || Object.values(toggle.links || {})[0] || 'No link'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button 
          variant="success" 
          size="sm" 
          onClick={() => onCreateTab(toggle, tabName)}
          icon={Plus}
          className="flex-1"
        >
          Tab
        </Button>
        <Button 
          variant="info" 
          size="sm" 
          onClick={() => onEdit(toggle, tabName)}
          icon={Edit3}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => onDelete(toggle.id, tabName)}
          icon={Trash2}
          className="flex-1"
        >
          Delete
        </Button>
        <Button 
          variant="warning" 
          size="sm" 
          onClick={() => onReset(toggle.id, tabName)}
          icon={RotateCcw}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};