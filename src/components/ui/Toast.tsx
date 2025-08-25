"use client";

import { useEffect, useState } from "react";
import { 
  IoAlertCircle, 
  IoChatbubbleEllipses, 
  IoInformationCircle, 
  IoNotificationsCircle,
  IoClose 
} from "react-icons/io5";

export type ToastType = 'alert' | 'chat' | 'info' | 'notice';

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onDismiss?: () => void;
  autoHideDelay?: number;
}

export function Toast({
  show,
  message,
  type,
  onDismiss,
  autoHideDelay = 4000
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (!show) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'alert':
        return {
          icon: IoAlertCircle,
          bgColor: 'var(--color-feedback-error)',
          textColor: 'white',
          borderColor: 'var(--color-feedback-error)'
        };
      case 'chat':
        return {
          icon: IoChatbubbleEllipses,
          bgColor: 'var(--color-feedback-warning)',
          textColor: 'var(--color-text-primary)',
          borderColor: 'var(--color-feedback-warning)'
        };
      case 'info':
        return {
          icon: IoInformationCircle,
          bgColor: 'var(--color-feedback-info)',
          textColor: 'white',
          borderColor: 'var(--color-feedback-info)'
        };
      case 'notice':
      default:
        return {
          icon: IoNotificationsCircle,
          bgColor: 'var(--color-interactive-primary)',
          textColor: 'white',
          borderColor: 'var(--color-interactive-primary)'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div 
      className={`toast-container fixed top-6 right-6 z-50 transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={{
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div
        className="toast-content rounded-lg shadow-lg border backdrop-blur-sm"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          borderColor: config.borderColor,
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex items-start gap-3 p-4">
          <IconComponent 
            className="flex-shrink-0 mt-0.5" 
            size={20}
          />
          
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {message}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 hover:bg-opacity-10 transition-all duration-200"
            aria-label="토스트 닫기"
          >
            <IoClose size={16} />
          </button>
        </div>
        
        {/* 진행률 표시줄 */}
        {autoHideDelay > 0 && (
          <div 
            className="h-1 rounded-b-lg overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }}
          >
            <div
              className="h-full transition-all ease-linear"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                width: isVisible ? '0%' : '100%',
                transitionDuration: `${autoHideDelay}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}