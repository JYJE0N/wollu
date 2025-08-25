import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ui/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  type?: ToastType;
  autoHideDelay?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    setToast({
      show: true,
      message,
      type: options.type || 'info'
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // 편의 메서드들
  const showAlert = useCallback((message: string) => {
    showToast(message, { type: 'alert' });
  }, [showToast]);

  const showChat = useCallback((message: string) => {
    showToast(message, { type: 'chat' });
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, { type: 'info' });
  }, [showToast]);

  const showNotice = useCallback((message: string) => {
    showToast(message, { type: 'notice' });
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showAlert,
    showChat,
    showInfo,
    showNotice
  };
}