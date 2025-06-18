import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CheckboxGroup } from '../common/CheckboxGroup';
import { Button } from '../common/Button';

export const ToggleForm = ({ 
  formData, 
  config, 
  modalType, 
  onInputChange, 
  onRegionChange, 
  onSubmit, 
  onCancel,
  selectedToggle
}) => {
  const [errors, setErrors] = useState({
    start_date: '',
    end_date: ''
  });

  const validateDates = () => {
    const newErrors = {
      start_date: '',
      end_date: ''
    };

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return !newErrors.start_date && !newErrors.end_date;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDates()) {
      console.log('Submitting form data:', formData);
      onSubmit(e);
    }
  };

  const toggleTypeOptions = config.toggle_types.map(type => ({
    value: type,
    label: type
  }));

  const linkTypeOptions = config.link_types.map(type => ({
    value: type,
    label: type
  }));

  const regionOptions = config.regions.map(region => ({
    value: region,
    label: region
  }));

  const tabTypeOptions = config.tab_types.map(type => ({
    value: type,
    label: type
  }));

  // For createTab, only title is read-only, other fields are editable
  if (modalType === 'createTab') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          value={selectedToggle ? selectedToggle.title : formData.title}
          readOnly
        />
        <Select
          label="Toggle Type"
          value={formData.toggle_type}
          onChange={(e) => onInputChange('toggle_type', e.target.value)}
          options={toggleTypeOptions}
          required
        />
        <Input
          label="Image URL"
          type="url"
          value={formData.image_url}
          onChange={(e) => onInputChange('image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => {
                onInputChange('start_date', e.target.value);
                setErrors(prev => ({ ...prev, start_date: '' }));
              }}
              required
              error={errors.start_date}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => {
                onInputChange('end_date', e.target.value);
                setErrors(prev => ({ ...prev, end_date: '' }));
              }}
              required
              error={errors.end_date}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>
        </div>
        <CheckboxGroup
          label="Regions"
          options={regionOptions}
          selectedValues={formData.regions}
          onChange={onRegionChange}
        />
        <Select
          label="Link Type"
          value={formData.route_info.link_type}
          onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
          options={linkTypeOptions}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL Configuration</label>
          <div className="space-y-3">
            {formData.route_info.link_type === 'DIRECT' ? (
              <Input
                type="url"
                value={formData.route_info.url.default || ''}
                onChange={(e) => onInputChange('route_info.url', { default: e.target.value })}
                placeholder="https://example.com"
                required
              />
            ) : (
              <div className="space-y-3">
                <Input
                  type="url"
                  value={formData.route_info.url.web || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                  placeholder="Web URL: https://example.com"
                />
                <Input
                  type="text"
                  value={formData.route_info.url.mobile || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                  placeholder="Mobile URL: app://example"
                />
              </div>
            )}
          </div>
        </div>
        <Select
          label="Select Tab Type"
          value={formData.tab_type}
          onChange={e => onInputChange('tab_type', e.target.value)}
          options={tabTypeOptions.filter(option => !selectedToggle?.tabs?.includes(option.value))}
          placeholder="Select tab type"
          required
        />
        <div className="flex gap-4 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            icon={Save}
            className="flex-1"
          >
            Create Tab
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
        placeholder="Enter toggle title"
        required
      />
      <Select
        label="Toggle Type"
        value={formData.toggle_type}
        onChange={(e) => onInputChange('toggle_type', e.target.value)}
        options={toggleTypeOptions}
        placeholder="Select toggle type"
        required
      />
      <Input
        label="Image URL"
        type="url"
        value={formData.image_url}
        onChange={(e) => onInputChange('image_url', e.target.value)}
        placeholder="https://example.com/image.jpg"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => {
              onInputChange('start_date', e.target.value);
              setErrors(prev => ({ ...prev, start_date: '' }));
            }}
            required
            error={errors.start_date}
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
          )}
        </div>
        <div>
          <Input
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => {
              onInputChange('end_date', e.target.value);
              setErrors(prev => ({ ...prev, end_date: '' }));
            }}
            required
            error={errors.end_date}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
          )}
        </div>
      </div>
      <CheckboxGroup
        label="Regions"
        options={regionOptions}
        selectedValues={formData.regions}
        onChange={onRegionChange}
      />
      <Select
        label="Link Type"
        value={formData.route_info.link_type}
        onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
        options={linkTypeOptions}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL Configuration</label>
        <div className="space-y-3">
          {formData.route_info.link_type === 'DIRECT' ? (
            <Input
              type="url"
              value={formData.route_info.url.default || ''}
              onChange={(e) => onInputChange('route_info.url', { default: e.target.value })}
              placeholder="https://example.com"
              required
            />
          ) : (
            <div className="space-y-3">
              <Input
                type="url"
                value={formData.route_info.url.web || ''}
                onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                placeholder="Web URL: https://example.com"
              />
              <Input
                type="text"
                value={formData.route_info.url.mobile || ''}
                onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                placeholder="Mobile URL: app://example"
              />
            </div>
          )}
        </div>
      </div>
      <Select
        label="Initial Tab"
        value={formData.tab_type}
        onChange={(e) => onInputChange('tab_type', e.target.value)}
        options={tabTypeOptions}
        placeholder="Select Tab type"
        required
      />
      <div className="flex gap-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          icon={Save}
          className="flex-1"
        >
          {modalType === 'create' && 'Create Toggle'}
          {modalType === 'update' && 'Update Toggle'}
          {modalType === 'createTab' && 'Create Tab'}
        </Button>
      </div>
    </form>
  );
};