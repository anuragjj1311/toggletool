import React from 'react';

export const CheckboxGroup = ({ 
  label, 
  options = [], 
  selectedValues = [], 
  onChange, 
  className = '' 
}) => {
  const handleChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map(option => (
          <label 
            key={option} 
            className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-colors duration-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => handleChange(option)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};