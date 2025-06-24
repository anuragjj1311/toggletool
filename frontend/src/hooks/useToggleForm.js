import { useState } from 'react';

export const useToggleForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedToggle, setSelectedToggle] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    toggle_type: '',
    image_url: '',
    start_date: '',
    end_date: '',
    regions: [],
    route_info: {
      link_type: 'DIRECT',
      url: {}
    },
    initial_tab: '',
    tab_type: ''
  });

  const resetFormData = () => {
    setFormData({
      title: '',
      toggle_type: '',
      image_url: '',
      start_date: '',
      end_date: '',
      regions: [],
      route_info: {
        link_type: 'DIRECT',
        url: {}
      },
      initial_tab: '',
      tab_type: ''
    });
  };

  const openModal = (type, toggle = null) => {
    setModalType(type);
    setSelectedToggle(toggle);
    if ((type === 'update' || type === 'editAll') && toggle) {
      setFormData({
        title: toggle.title,
        toggle_type: toggle.type,
        image_url: toggle.image_url || '',
        start_date: toggle.start_date || '',
        end_date: toggle.end_date || '',
        regions: [],
        route_info: { link_type: 'DIRECT', url: {} },
        tab_type: ''
      });
    } else if (type === 'createTab' && toggle) {
      setFormData({
        title: toggle.title,
        toggle_type: toggle.type,
        image_url: toggle.image_url || '',
        start_date: toggle.start_date || '',
        end_date: toggle.end_date || '',
        regions: toggle.regions || [],
        route_info: {
          link_type: toggle.link_type,
          url: toggle.links || {}
        },
        initial_tab: '',
        tab_type: '',
        toggle_id: toggle.id
      });
    } else {
      resetFormData();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedToggle(null);
    setSelectedTab(null);
    resetFormData();
  };

  const handleInputChange = (field, value) => {
      console.log('Updating field:', field, 'with value:', value);    
      if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRegionChange = (regions) => {
    setFormData(prev => ({
      ...prev,
      regions
    }));
  };

  return {
    showModal,
    modalType,
    selectedToggle,
    selectedTab,
    formData,
    openModal,
    closeModal,
    handleInputChange,
    handleRegionChange
  };
};