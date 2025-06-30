import React from 'react';
import { Calendar, MapPin, Link, Plus, Edit3, Power } from 'lucide-react';
import { Button } from '../common/Button';

export const ToggleCard = ({ 
  toggle, 
  tabName, 
  imageUrl,
  onEdit, 
  onToggleStatus, 
  onCreateTab 
}) => {
  const isDisabled = toggle.deleted_at !== null;

  return (
    <div className={`bg-gradient-to-br rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-300 group ${
      isDisabled 
        ? 'from-gray-100 to-gray-50 border-gray-200 opacity-75' 
        : 'from-white to-green-50 border-green-100'
    }`}>
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDisabled
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {isDisabled ? 'Disabled' : 'Enabled'}
            </span>
          </div>
        </div>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={toggle.title}
            className={`w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md ${
              isDisabled ? 'grayscale' : ''
            }`}
          />
        )}
      </div>

      <div className="space-y-3 mb-4">
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
            {typeof toggle.links?.default === 'string'
              ? toggle.links.default
              : typeof Object.values(toggle.links || {})[0] === 'string'
                ? Object.values(toggle.links || {})[0]
                : 'No link'}
          </span>
        </div>
        {imageUrl && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                title={imageUrl}
              >
                {imageUrl.length > 30 
                  ? `${imageUrl.substring(0, 30)}...` 
                  : imageUrl
                }
              </a>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex flex-wrap gap-1">
            {toggle.tabs?.map(tab => (
              <span key={tab} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Links Configuration */}
      {toggle.links && Object.keys(toggle.links).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-2 mt-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">Links Configuration</div>
          <div className="space-y-1">
            {Object.entries(toggle.links).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                // For nested ACTIVITY links
                return Object.entries(value).map(([subKey, link]) => (
                  <div key={`${key}-${subKey}`} className="flex items-center gap-1">
                    <Link size={12} className="text-blue-600 flex-shrink-0" />
                    <span className="text-xs">
                      <span className="font-medium">{key === 'default' ? subKey : `${key} - ${subKey}`}:</span>{' '}
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                      </a>
                    </span>
                  </div>
                ));
              }
              // If value is a direct link
              return (
                <div key={key} className="flex items-center gap-1">
                  <Link size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="text-xs">
                    <span className="font-medium">{key}:</span>{' '}
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                    </a>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button 
          variant="success" 
          size="sm" 
          onClick={() => onCreateTab(toggle, tabName)}
          icon={Plus}
          className="flex-1"
          disabled={isDisabled}
        >
          Tab
        </Button>
        <Button 
          variant="info" 
          size="sm" 
          onClick={() => onEdit(toggle, tabName)}
          icon={Edit3}
          className="flex-1"
          disabled={isDisabled}
        >
          Edit
        </Button>
        <Button 
          variant={isDisabled ? "success" : "danger"}
          size="sm" 
          onClick={() => onToggleStatus(toggle.id, tabName)}
          icon={Power}
          className="flex-1"
        >
          {isDisabled ? 'Enable' : 'Disable'}
        </Button>
      </div>
    </div>
  );
};