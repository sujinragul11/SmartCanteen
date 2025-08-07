import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'warning', // 'warning', 'danger', 'success', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is typically done in the parent component
      console.error('Confirm action error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
    >
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} mb-4`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        
        <div className="flex space-x-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${config.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;