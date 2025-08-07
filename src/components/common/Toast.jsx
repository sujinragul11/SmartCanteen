import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  type = 'info', 
  message, 
  isVisible, 
  onClose, 
  duration = 4000,
  position = 'top-right' 
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!isVisible) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ${
      isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`max-w-sm w-full ${config.bgColor} border ${config.borderColor} rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`inline-flex ${config.textColor} hover:opacity-75 focus:outline-none`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
          position={toast.position}
        />
      ))}
    </>
  );
};

export default Toast;