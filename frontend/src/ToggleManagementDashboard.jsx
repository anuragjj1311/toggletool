import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { Notification } from './components/common/Notification';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToggleSection } from './components/toggle/ToggleSection';
import { ToggleForm } from './components/toggle/ToggleForm';
import { EmptyState } from './components/toggle/EmptyState';
import { useToggleData } from './hooks/useToggleData';
import { useToggleForm } from './hooks/useToggleForm';

const ToggleManagementDashboard = () => {
  const { 
    toggles, 
    config, 
    loading, 
    error, 
    success, 
    fetchInitialData, 
    showNotification 
  } = useToggleData();

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

  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Initial config:', config);
    console.log('Initial toggles:', toggles);
  }, []);

  useEffect(() => {
    console.log('Config updated:', config);
  }, [config]);

  useEffect(() => {
    if (error) {
      console.error('Dashboard error:', error);
    }
  }, [error]);

  const getTabIdByName = (tabName) => {
    const tabMapping = { 'Shop': 1, 'Category': 2 };
    return tabMapping[tabName] || 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form with data:', formData);
      const submitData = { toggle: formData };
      const tabId = getTabIdByName(selectedTab || formData.tabs[0]);
      
      showNotification(`Toggle ${modalType}d successfully!`);
      closeModal();
      fetchInitialData();
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An error occurred. Please try again.', 'error');
    }
  };

  const handleDelete = async (toggleId) => {
    if (window.confirm('Are you sure you want to delete this toggle?')) {
      try {
        showNotification('Toggle deleted successfully!');
        fetchInitialData();
      } catch (error) {
        showNotification('Error deleting toggle. Please try again.', 'error');
      }
    }
  };

  const handleReset = async (toggleId) => {
    if (window.confirm('Are you sure you want to reset this toggle to default?')) {
      try {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
        {toggles.length === 0 ? (
          <EmptyState onCreateToggle={() => openModal('create')} />
        ) : (
          <div className="space-y-8">
            {toggles.map((toggle) => (
              <ToggleSection
                key={toggle.id}
                toggle={toggle}
                onCreateTab={(toggle) => openModal('createTab', toggle)}
                onEditToggle={(toggle) => openModal('update', toggle)}
                onDeleteToggle={handleDelete}
                onResetToggle={handleReset}
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