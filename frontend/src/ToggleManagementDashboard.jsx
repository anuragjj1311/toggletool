import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { Notification } from './components/common/Notification';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { TabSection } from './components/toggle/TabSection';
import { ToggleForm } from './components/toggle/ToggleForm';
import { EmptyState } from './components/toggle/EmptyState';
import { useToggleData } from './hooks/useToggleData';
import { useToggleForm } from './hooks/useToggleForm';

const ToggleManagementDashboard = () => {
  const { tabs, config, loading, error, success, fetchInitialData, showNotification } = useToggleData();
  const { 
    showModal, 
    modalType, 
    selectedToggle, 
    selectedTab, 
    formData, 
    openModal, 
    closeModal, 
    handleInputChange, 
    handleRegionChange 
  } = useToggleForm();

  const getTabIdByName = (tabName) => {
    const tabMapping = { 'Shop': 1, 'Category': 2 };
    return tabMapping[tabName] || 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { toggle: formData };
      const tabId = getTabIdByName(selectedTab || Object.keys(tabs)[0]);
      
      showNotification(`Toggle ${modalType}d successfully!`);
      closeModal();
      fetchInitialData();
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An error occurred. Please try again.', 'error');
    }
  };

  const handleDelete = async (toggleId, tabName) => {
    if (window.confirm('Are you sure you want to delete this toggle?')) {
      try {
        const tabId = getTabIdByName(tabName);
        // await apiService.deleteToggle(tabId, toggleId);
        showNotification('Toggle deleted successfully!');
        fetchInitialData();
      } catch (error) {
        showNotification('Error deleting toggle. Please try again.', 'error');
      }
    }
  };

  const handleReset = async (toggleId, tabName) => {
    if (window.confirm('Are you sure you want to reset this toggle to default?')) {
      try {
        const tabId = getTabIdByName(tabName);
        // await apiService.resetToggle(tabId, toggleId);
        showNotification('Toggle reset successfully!');
        fetchInitialData();
      } catch (error) {
        showNotification('Error resetting toggle. Please try again.', 'error');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading toggles..." />;
  }

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Create New Toggle';
      case 'update': return 'Update Toggle';
      case 'createTab': return 'Create Tab for Toggle';
      default: return 'Toggle Form';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50">
      {/* Notifications */}
      {error && <Notification message={error} type="error" />}
      {success && <Notification message={success} type="success" />}
      
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-green-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                Toggle Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your app toggles and Tabs</p>
            </div>
            <Button onClick={() => openModal('create')} icon={Plus}>
              Create Toggle
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {Object.keys(tabs).length === 0 ? (
          <EmptyState onCreateToggle={() => openModal('create')} />
        ) : (
          <div className="space-y-8">
            {Object.entries(tabs).map(([tabName, toggles]) => (
              <TabSection
                key={tabName}
                tabName={tabName}
                toggles={toggles}
                onCreateToggle={(tabName) => openModal('create', null, tabName)}
                onEditToggle={(toggle, tabName) => openModal('update', toggle, tabName)}
                onDeleteToggle={handleDelete}
                onResetToggle={handleReset}
                onCreateTab={(toggle, tabName) => openModal('createTab', toggle, tabName)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={getModalTitle()}
      >
        <ToggleForm
          formData={formData}
          config={config}
          modalType={modalType}
          onInputChange={handleInputChange}
          onRegionChange={handleRegionChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default ToggleManagementDashboard;