import React from 'react';

export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  required = false, 
  disabled = false,
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
    </div>
  );
};