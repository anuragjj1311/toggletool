import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../common/Button';

export const EmptyState = ({ onCreateToggle }) => {
  return (
    <div className="text-center py-20">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plus size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Toggles Found</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first toggle</p>
        <Button onClick={onCreateToggle}>
          Create Your Tabs
        </Button>
      </div>
    </div>
  );
};