import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '',
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-green-600 to-lime-600 text-white hover:shadow-lg transform hover:scale-105',
    secondary: 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-md',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-md',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};