import { useEffect } from 'react';
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
import { toggleService } from './services/toggleService';

const ToggleManagementDashboard = () => {
  const { 
    toggles, 
    allTabs,
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
  }, [config, toggles]);

  useEffect(() => {
    console.log('Config updated:', config);
  }, [config]);

  useEffect(() => {
    if (error) {
      console.error('Dashboard error:', error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      showNotification('Start date and End date are required.', 'error');
      return;
    }
    try {
      const cleanRegions = formData.regions.filter(r => r !== '__all__');
      const cleanFormData = { ...formData, regions: cleanRegions };

      console.log('FormData before submission:', cleanFormData); 
      if (modalType === 'create') {
        const tabIndex = config.tab_types.findIndex(
          t => t === cleanFormData.tab_type
        );
        const tabId = tabIndex !== -1 ? tabIndex + 1 : 2;
        await toggleService.createToggle(tabId, {toggle: cleanFormData});
      } else if (modalType === 'createTab') {
        const tabIndex = config.tab_types.findIndex(
          t => t === cleanFormData.tab_type
        );
        const tabId = tabIndex !== -1 ? tabIndex + 1 : 2;
        const submitData = {
          toggle: {
            title: cleanFormData.title,
            toggle_type: cleanFormData.toggle_type,
            image_url: cleanFormData.image_url,
            start_date: cleanFormData.start_date,
            end_date: cleanFormData.end_date,
            regions: cleanFormData.regions,
            route_info: cleanFormData.route_info
          },
          tab_type_id: tabId
        };
        console.log('Submitting createTab with data:', submitData);
        await toggleService.createToggle(tabId, submitData);
      } else if (modalType === 'update' && selectedToggle) {
        const tabIndex = config.tab_types.findIndex(
          t => t === cleanFormData.tab_type
        );
        const tabId = tabIndex !== -1 ? tabIndex + 1 : 2;
        const submitData = {
          toggle: {
            title: cleanFormData.title,
            toggle_type: cleanFormData.toggle_type,
            image_url: cleanFormData.image_url,
            start_date: cleanFormData.start_date,
            end_date: cleanFormData.end_date,
            regions: cleanFormData.regions,
            route_info: cleanFormData.route_info
          }
        };
        console.log('Updating toggle with data:', submitData);
        await toggleService.updateToggle(selectedToggle.id, submitData, tabId);
      }
      showNotification(`Toggle ${modalType}d successfully!`);
      closeModal();
      fetchInitialData();
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An error occurred. Please try again.', 'error');
    }
  };

  const handleDelete = async (toggleId) => {
    try {
      await toggleService.deleteToggle(toggleId);
      showNotification('Toggle disabled successfully!');
      fetchInitialData();
    } catch (err) {
      showNotification('Error disabling toggle. Please try again.', err);
    }
  };

  const handleRestore = async (toggleId) => {
    try {
      await toggleService.restoreToggle(toggleId);
      showNotification('Toggle enabled successfully!');
      fetchInitialData();
    } catch (err) {
      showNotification('Error enabling toggle. Please try again.', err);
    }
  };

  const handleEditToggleAll = (toggle, closeModal) => {
    return (
      <ToggleForm
        formData={formData}
        config={config}
        modalType="editAll"
        onInputChange={handleInputChange}
        onRegionChange={handleRegionChange}
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await toggleService.updateToggleForAllTabs(toggle.id, formData);
            showNotification('Toggle updated for all tabs!');
            closeModal();
            fetchInitialData();
          } catch (error) {
            showNotification('Error updating toggle for all tabs.', error);
          }
        }}
        onCancel={closeModal}
        selectedToggle={toggle}
      />
    );
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
      case 'update': return 'Update Tab';
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
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
                allTabs={allTabs}
                onCreateTab={(toggle) => openModal('createTab', toggle)}
                onEditToggle={(toggle) => openModal('update', toggle)}
                onDeleteToggle={handleDelete}
                onRestoreToggle={handleRestore}
                onEditToggleAll={(toggle, closeModal) => handleEditToggleAll(toggle, closeModal)}
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
          selectedToggle={selectedToggle}
        />
      </Modal>
    </div>
  );
};

export default ToggleManagementDashboard;