import { useEffect, useState } from 'react';
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
import api from './services/api';
import { tabService } from './services/tabService';

const ToggleManagementDashboard = () => {
  const { 
    toggles, 
    allTabs,
    allTabObjects,
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

  const [showTabModal, setShowTabModal] = useState(false);
  const [tabForm, setTabForm] = useState({
    title: '',
    start_date: '',
    end_date: '',
    regions: [],
  });

  const handleTabInputChange = (field, value) => {
    setTabForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTabRegionChange = (regions) => {
    setTabForm(prev => ({ ...prev, regions }));
  };

  const handleTabSubmit = async (e) => {
    e.preventDefault();
    try {
      await tabService.createTab({ tab: tabForm });
      setShowTabModal(false);
      setTabForm({ title: '', start_date: '', end_date: '', regions: [] });
      fetchInitialData();
      showNotification('Tab created successfully!');
    } catch (err) {
      showNotification('Failed to create tab.', 'error');
    }
  };

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
    try {
      const cleanRegions = formData.regions ? formData.regions.filter(r => r !== '__all__') : [];
      const cleanFormData = { ...formData, regions: cleanRegions };
      console.log('FormData before submission:', cleanFormData); 
      if (modalType === 'create') {
        // Use allTabObjects to find the real tab ID by title (case-insensitive)
        const selectedTabObj = allTabObjects.find(tab => tab.title.toLowerCase() === cleanFormData.tab_type.toLowerCase());
        const tabId = selectedTabObj ? selectedTabObj.id : null;
        if (!tabId) {
          showNotification('Tab not found. Please try again.', 'error');
          return;
        }
        await toggleService.createToggle(tabId, {toggle: cleanFormData});
      } else if (modalType === 'createTab') {
        // Debug log
        console.log('allTabObjects:', allTabObjects);
        console.log('Looking for tab_type:', cleanFormData.tab_type);
        // Use allTabObjects to find the real tab ID by title (case-insensitive)
        const selectedTabObj = allTabObjects.find(tab => tab.title.toLowerCase() === cleanFormData.tab_type.toLowerCase());
        const tabId = selectedTabObj ? selectedTabObj.id : null;
        if (!tabId) {
          showNotification('Tab not found. Please try again.', 'error');
          return;
        }
        // Associate the existing toggle with the selected tab
        await toggleService.associateToggleWithTab(selectedToggle.id, tabId, {
          route_info: cleanFormData.route_info,
          regions: cleanFormData.regions,
          image_url: cleanFormData.image_url,
          start_date: cleanFormData.start_date,
          end_date: cleanFormData.end_date
        });
        showNotification('Tab associated with toggle successfully!');
        closeModal();
        fetchInitialData();
        return;
      } else if (modalType === 'update') {
        const selectedTabObj = allTabObjects.find(tab => tab.title.toLowerCase() === cleanFormData.tab_type.toLowerCase());
        const tabId = selectedTabObj ? selectedTabObj.id : null;
        if (!tabId) {
          showNotification('Tab not found. Please try again.', 'error');
          return;
        }

        const associationData = {
          route_info: cleanFormData.route_info,
          regions: cleanFormData.regions,
          image_url: cleanFormData.image_url,
          start_date: cleanFormData.start_date,
          end_date: cleanFormData.end_date,
        };

        await toggleService.updateTabToggleAssociation(selectedToggle.id, tabId, associationData);
        showNotification('Tab association updated successfully!');
        closeModal();
        fetchInitialData();
        return;
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
            // Update toggle for all tabs by updating the toggle directly
            const response = await api.patch(`/toggles/${toggle.id}`, { toggle: formData });
            showNotification('Toggle updated for all tabs!');
            closeModal();
            fetchInitialData();
          } catch (error) {
            console.error('Error updating toggle for all tabs:', error);
            showNotification('Error updating toggle for all tabs.', 'error');
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
            <div className="flex gap-2">
              <Button onClick={() => openModal('create')} icon={Plus}>
                Create Toggle
              </Button>
              <Button onClick={() => setShowTabModal(true)} variant="secondary">
                Create Tab
              </Button>
            </div>
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

      {/* Modal for Create Tab */}
      <Modal
        isOpen={showTabModal}
        onClose={() => setShowTabModal(false)}
        title="Create New Tab"
      >
        <form onSubmit={handleTabSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tab Name</label>
            <input
              type="text"
              value={tabForm.title}
              onChange={e => handleTabInputChange('title', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={tabForm.start_date}
              onChange={e => handleTabInputChange('start_date', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={tabForm.end_date}
              onChange={e => handleTabInputChange('end_date', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
            <input
              type="text"
              value={tabForm.regions.join(', ')}
              onChange={e => handleTabRegionChange(e.target.value.split(',').map(r => r.trim()).filter(Boolean))}
              className="w-full border rounded px-3 py-2"
              placeholder="Comma separated regions"
            />
          </div>
          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowTabModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Create Tab
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ToggleManagementDashboard;