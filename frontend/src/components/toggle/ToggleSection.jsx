import React, { useState } from 'react';
import { Calendar, Link, Plus, Edit3, Power } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const ToggleSection = ({ 
  toggle, 
  allTabs = {},
  onCreateTab, 
  onEditToggle, 
  onDeleteToggle, 
  onRestoreToggle,
  onEditToggleAll
}) => {

  const isDisabled = toggle.deleted_at !== null && toggle.deleted_at !== undefined;

  const [selectedTab, setSelectedTab] = useState(null);
  const [showEditAllModal, setShowEditAllModal] = useState(false);

  const handleToggleStatus = (toggleId) => {
    if (isDisabled) {
      onRestoreToggle(toggleId, { restoreAll: true });
    } else {
      onDeleteToggle(toggleId);
    }
  };

  const getTabToggleDetails = (tabName) => {
    const tabToggles = allTabs[tabName] || [];
    return tabToggles.find(t => t.id === toggle.id);
  };

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border ${
        isDisabled ? 'border-gray-200' : 'border-green-100'
      }`}>
        <div className={`bg-gradient-to-r p-6 ${
          isDisabled 
            ? 'from-gray-500 to-gray-400'
            : 'from-blue-600 to-blue-800'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{toggle.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                  {toggle.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                  {isDisabled ? 'Disabled' : 'Enabled'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                  {toggle.tabs ? `${[...new Set(toggle.tabs)].length} tab(s)` : '0 tabs'}
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
                Edit Tab
              </Button>
              <Button
                variant="info"
                onClick={() => setShowEditAllModal(true)}
                icon={Edit3}
                disabled={isDisabled}
              >
                Edit Toggle
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Toggle Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Toggle Details</h3>
            </div>

            {/* Associated Tabs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Associated Tabs ({toggle.tabs ? [...new Set(toggle.tabs)].length : 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Deduplicate tabs to prevent showing the same tab multiple times
                  const uniqueTabs = toggle.tabs ? [...new Set(toggle.tabs)] : [];
                  return uniqueTabs.map((tabName, i) => (
                    <div 
                      key={`${tabName}-${i}`}
                      className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                      onClick={() => setSelectedTab(tabName)}
                    >
                      <span className="font-medium text-blue-700">{tabName}</span>
                    </div>
                  ));
                })()}
                {(!toggle.tabs || toggle.tabs.length === 0) && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 w-full">
                    <p className="text-gray-500">No tabs associated with this toggle</p>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => onCreateTab(toggle)}
                      icon={Plus}
                      className="mt-2"
                      disabled={isDisabled}
                    >
                      Add First Tab
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isDisabled 
                ? 'This toggle is currently disabled across all tabs' 
                : `This toggle is active across ${toggle.tabs ? [...new Set(toggle.tabs)].length : 0} tab(s)`
              }
            </div>
            <Button 
              variant={isDisabled ? "success" : "danger"}
              size="sm" 
              onClick={() => handleToggleStatus(toggle.id)}
              icon={Power}
            >
              {isDisabled ? 'Enable ' + toggle.title : 'Disable ' + toggle.title}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Details Modal */}
      {selectedTab && (
        <Modal
          isOpen={!!selectedTab}
          onClose={() => setSelectedTab(null)}
          title={`${selectedTab} Tab Details`}
          maxWidth="max-w-2xl"
        >
          {(() => {
            const tabDetails = getTabToggleDetails(selectedTab);
            if (!tabDetails) return <p>No details available for this tab.</p>;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Title:</span> {tabDetails.title || selectedTab}</p>
                      <p><span className="font-medium">Type:</span> {tabDetails.type}</p>
                      <p><span className="font-medium">Link Type:</span> {tabDetails.link_type}</p>
                      {tabDetails.image_url && (
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={tabDetails.image_url}
                            alt={tabDetails.title}
                            className="w-10 h-10 rounded object-cover border"
                          />
                          <a
                            href={tabDetails.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                            title={tabDetails.image_url}
                          >
                            {tabDetails.image_url.length > 30
                              ? `${tabDetails.image_url.substring(0, 30)}...`
                              : tabDetails.image_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Schedule & Location</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Start Date:</span> {tabDetails.start_date}</p>
                      <p><span className="font-medium">End Date:</span> {tabDetails.end_date}</p>
                      <p><span className="font-medium">Regions:</span> {tabDetails.regions?.join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Links Configuration</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      
                      {tabDetails.links && Object.keys(tabDetails.links).length > 0 ? (
                        Object.entries(tabDetails.links).map(([key, value]) => {
                          if (typeof value === 'object' && value !== null) {
                            // For nested ACTIVITY links
                            return Object.entries(value).map(([subKey, link]) => {
                              const linkValue = typeof link === 'string' ? link : (link && link.default ? link.default : '');
                              {console.log('Tab Details :', tabDetails)}
                              return (
                                <div key={`${key}-${subKey}`} className="flex items-center gap-2">
                                  <Link size={16} className="text-blue-600 flex-shrink-0" />
                                  <span className="text-sm">
                                    <span className="font-medium">{key === 'default' ? subKey : `${key} - ${subKey}`}:</span>{' '}
                                    <a href={linkValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                      {linkValue}
                                    </a>
                                  </span>
                                </div>
                              );
                            });
                          }
                          // If value is a direct link
                          const linkValue = typeof value === 'string' ? value : (value && value.default ? value.default : '');
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <Link size={16} className="text-blue-600 flex-shrink-0" />
                              <span className="text-sm">
                                <span className="font-medium">{key}:</span>{' '}
                                <a href={linkValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                  {linkValue}
                                </a>
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-sm">No links configured.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {showEditAllModal && (
        <Modal
          isOpen={showEditAllModal}
          onClose={() => setShowEditAllModal(false)}
          title={`Edit Toggle (All Tabs)`}
          maxWidth="max-w-2xl"
        >
          {onEditToggleAll && onEditToggleAll(toggle, () => setShowEditAllModal(false))}
        </Modal>
      )}
    </>
  );
};