import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CheckboxGroup } from '../common/CheckboxGroup';
import { Button } from '../common/Button';
import { tabService } from '../../services/tabService';
import { toggleService } from '../../services/toggleService';

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
  
  const hasSetCategoryLinkType = useRef(false);

  useEffect(() => {
    // Only set link type to DIRECT for CATEGORY if it's not already set and we haven't set it before
    if (formData.toggle_type === 'CATEGORY' && 
        formData.route_info.link_type !== 'DIRECT' && 
        !hasSetCategoryLinkType.current) {
      hasSetCategoryLinkType.current = true;
      onInputChange('route_info.link_type', 'DIRECT');
    }
    
    // Reset the flag when toggle type changes
    if (formData.toggle_type !== 'CATEGORY') {
      hasSetCategoryLinkType.current = false;
    }
  }, [formData.toggle_type, onInputChange]);

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
    if (modalType === 'editAll' || validateDates()) {
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

  const regionOptions = [
    { value: '__all__', label: 'All' },
    ...config.regions.map(region => ({ value: region, label: region }))
  ];

  const tabTypeOptions = config.tab_types.map(type => ({
    value: type,
    label: type
  }));

  const showLinkTypeSelect = formData.toggle_type !== 'CATEGORY';

  if (modalType === 'createTab') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Select Tab Type"
          value={formData.tab_type}
          onChange={e => onInputChange('tab_type', e.target.value)}
          options={tabTypeOptions.filter(option => !selectedToggle?.tabs?.includes(option.value))}
          placeholder="Select tab type"
          required
        />
        <Input
          label="Toggle Title"
          value={selectedToggle ? selectedToggle.title : formData.title}
          readOnly
        />
        <Input
          label="Toggle Type"
          value={selectedToggle ? selectedToggle.type : formData.toggle_type}
          readOnly
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
          selectedValues={
            formData.regions.length === config.regions.length && config.regions.length > 0
              ? ['__all__', ...formData.regions]
              : formData.regions
          }
          onChange={onRegionChange}
        />
        {showLinkTypeSelect ? (
          <Select
            label="Link Type"
            value={formData.route_info.link_type}
            onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
            options={linkTypeOptions}
            required
          />
        ) : (
          <Input
            label="Link Type"
            value="DIRECT"
            readOnly
            disabled
          />
        )}
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
                minLength={5}
              />
            ) : formData.route_info.link_type === 'ACTIVITY' ? (
              <ActivityLinksInput
                value={formData.route_info.url}
                onChange={linksObj => onInputChange('route_info.url', linksObj)}
                required
              />
            ) : (
              <div className="space-y-3">
                <Input
                  type="url"
                  value={formData.route_info.url.web || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                  placeholder=" https://example.com"
                />
                <Input
                  type="text"
                  value={formData.route_info.url.mobile || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                  placeholder=" app://example"
                />
              </div>
            )}
          </div>
        </div>
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

  if (modalType === 'editAll') {
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
            Update Toggle (All Tabs)
          </Button>
        </div>
      </form>
    );
  }

  if (modalType === 'update') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Select Tab Type"
          value={formData.tab_type}
          onChange={e => onInputChange('tab_type', e.target.value)}
          options={tabTypeOptions.filter(option => selectedToggle?.tabs?.includes(option.value))}
          placeholder="Select tab type"
          required
        />
        <Input
          label="Toggle Title"
          value={selectedToggle ? selectedToggle.title : formData.title}
          readOnly
        />
        <Input
          label="Toggle Type"
          value={selectedToggle ? selectedToggle.type : formData.toggle_type}
          readOnly
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
          selectedValues={
            formData.regions.length === config.regions.length && config.regions.length > 0
              ? ['__all__', ...formData.regions]
              : formData.regions
          }
          onChange={onRegionChange}
        />
        {showLinkTypeSelect ? (
          <Select
            label="Link Type"
            value={formData.route_info.link_type}
            onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
            options={linkTypeOptions}
            required
          />
        ) : (
          <Input
            label="Link Type"
            value="DIRECT"
            readOnly
            disabled
          />
        )}
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
                minLength={5}
              />
            ) : formData.route_info.link_type === 'ACTIVITY' ? (
              <ActivityLinksInput
                value={formData.route_info.url}
                onChange={linksObj => onInputChange('route_info.url', linksObj)}
                required
              />
            ) : (
              <div className="space-y-3">
                <Input
                  type="url"
                  value={formData.route_info.url.web || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                  placeholder=" https://example.com"
                />
                <Input
                  type="text"
                  value={formData.route_info.url.mobile || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                  placeholder=" app://example"
                />
              </div>
            )}
          </div>
        </div>
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
            Update Tab
          </Button>
        </div>
      </form>
    );
  }

  if (modalType === 'create') {
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
        <Input
          label="Image URL"
          type="url"
          value={formData.image_url}
          onChange={(e) => onInputChange('image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <CheckboxGroup
          label="Regions"
          options={regionOptions}
          selectedValues={
            formData.regions.length === config.regions.length && config.regions.length > 0
              ? ['__all__', ...formData.regions]
              : formData.regions
          }
          onChange={onRegionChange}
        />
        {showLinkTypeSelect ? (
          <Select
            label="Link Type"
            value={formData.route_info.link_type}
            onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
            options={linkTypeOptions}
            required
          />
        ) : (
          <Input
            label="Link Type"
            value="DIRECT"
            readOnly
            disabled
          />
        )}
        <Select
          label="Tab Type"
          value={formData.tab_type}
          onChange={(e) => onInputChange('tab_type', e.target.value)}
          options={tabTypeOptions}
          placeholder="Select Tab type"
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
                minLength={5}
              />
            ) : formData.route_info.link_type === 'ACTIVITY' ? (
              <ActivityLinksInput
                value={formData.route_info.url}
                onChange={linksObj => onInputChange('route_info.url', linksObj)}
                required
              />
            ) : (
              <div className="space-y-3">
                <Input
                  type="url"
                  value={formData.route_info.url.web || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                  placeholder=" https://example.com"
                />
                <Input
                  type="text"
                  value={formData.route_info.url.mobile || ''}
                  onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                  placeholder=" app://example"
                />
              </div>
            )}
          </div>
        </div>
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
            Create Toggle
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
        readOnly={modalType === 'update'}
        required
      />
      <Select
        label="Toggle Type"
        value={formData.toggle_type}
        onChange={(e) => onInputChange('toggle_type', e.target.value)}
        options={toggleTypeOptions}
        placeholder="Select toggle type"
        required={modalType !== 'createTab' && modalType !== 'update'}
      />
      <Input
        label="Image URL"
        type="url"
        value={formData.image_url}
        onChange={(e) => onInputChange('image_url', e.target.value)}
        placeholder="https://example.com/image.jpg"
      />
      <CheckboxGroup
        label="Regions"
        options={regionOptions}
        selectedValues={
          formData.regions.length === config.regions.length && config.regions.length > 0
            ? ['__all__', ...formData.regions]
            : formData.regions
        }
        onChange={onRegionChange}
      />
      {showLinkTypeSelect ? (
        <Select
          label="Link Type"
          value={formData.route_info.link_type}
          onChange={(e) => onInputChange('route_info.link_type', e.target.value)}
          options={linkTypeOptions}
          required
        />
      ) : (
        <Input
          label="Link Type"
          value="DIRECT"
          readOnly
          disabled
        />
      )}
      <Select
        label="Tab Type"
        value={formData.tab_type}
        onChange={(e) => onInputChange('tab_type', e.target.value)}
        options={tabTypeOptions}
        placeholder="Select Tab type"
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
              minLength={5}
            />
          ) : formData.route_info.link_type === 'ACTIVITY' ? (
            <ActivityLinksInput
              value={formData.route_info.url}
              onChange={linksObj => onInputChange('route_info.url', linksObj)}
              required
            />
          ) : (
            <div className="space-y-3">
              <Input
                type="url"
                value={formData.route_info.url.web || ''}
                onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, web: e.target.value })}
                placeholder=" https://example.com"
              />
              <Input
                type="text"
                value={formData.route_info.url.mobile || ''}
                onChange={(e) => onInputChange('route_info.url', { ...formData.route_info.url, mobile: e.target.value })}
                placeholder=" app://example"
              />
            </div>
          )}
        </div>
      </div>
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

const ActivityLinksInput = ({ value = {}, onChange, required }) => {
  const [pairs, setPairs] = React.useState(
    Object.entries(value).length > 0
      ? Object.entries(value).map(([key, url]) => ({ key, url }))
      : [{ key: '', url: '' }]
  );

  // Update pairs when value prop changes (but only if it's different)
  React.useEffect(() => {
    const newPairs = Object.entries(value).length > 0
      ? Object.entries(value).map(([key, url]) => ({ key, url }))
      : [{ key: '', url: '' }];
    
    // Only update if the pairs are actually different
    const currentPairsStr = JSON.stringify(pairs);
    const newPairsStr = JSON.stringify(newPairs);
    
    if (currentPairsStr !== newPairsStr) {
      setPairs(newPairs);
    }
  }, [value]);

  // Convert pairs to object and call onChange when pairs change
  React.useEffect(() => {
    const obj = {};
    pairs.forEach(({ key, url }) => {
      if (key && url) obj[key] = url;
    });
    
    // Only call onChange if the object is different from the current value
    const currentValueStr = JSON.stringify(value);
    const newValueStr = JSON.stringify(obj);
    
    if (currentValueStr !== newValueStr) {
      onChange(obj);
    }
  }, [pairs, onChange, value]);

  const handlePairChange = (idx, field, val) => {
    setPairs(prev => prev.map((pair, i) => i === idx ? { ...pair, [field]: val } : pair));
  };

  const handleAdd = () => {
    setPairs(prev => [...prev, { key: '', url: '' }]);
  };

  const handleRemove = (idx) => {
    setPairs(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            placeholder="Key (e.g. ethnic)"
            value={pair.key}
            onChange={e => handlePairChange(idx, 'key', e.target.value)}
            required={required}
          />
          <input
            type="url"
            className="border rounded px-2 py-1 flex-1"
            placeholder="URL for this key"
            value={pair.url}
            onChange={e => handlePairChange(idx, 'url', e.target.value)}
            required={required}
          />
          {pairs.length > 1 && (
            <button
              type="button"
              className="text-red-500 hover:text-red-700 px-2"
              onClick={() => handleRemove(idx)}
              title="Remove"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        onClick={handleAdd}
      >
        + Add Key/URL
      </button>
    </div>
  );
};