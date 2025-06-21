import React from 'react';

export const CheckboxGroup = ({ 
  label, 
  options = [], 
  selectedValues = [], 
  onChange, 
  className = '' 
}) => {
  const handleChange = (value) => {
    if (value === '__all__') {
      // If "All" is clicked
      if (selectedValues.length === options.length - 1) { 
        onChange([]);
      } else {
        const allRegionValues = options
          .filter(option => option.value !== '__all__')
          .map(option => option.value);
        onChange(allRegionValues);
      }
    } else {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(newValues);
    }
    
  };

  // Check if all regions (excluding "All") are selected
  const allRegionsSelected = options
    .filter(option => option.value !== '__all__')
    .every(option => selectedValues.includes(option.value));

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map(option => (
          <label 
            key={option.value} 
            className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-colors duration-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={
                option.value === '__all__' 
                  ? allRegionsSelected 
                  : selectedValues.includes(option.value)
              }
              onChange={() => handleChange(option.value)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};