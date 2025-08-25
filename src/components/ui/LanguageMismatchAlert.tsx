"use client";

import { Toast, ToastType } from './Toast';
import { useToast } from '@/hooks/useToast';
import { useEffect } from 'react';

interface LanguageMismatchAlertProps {
  show: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
  onDismiss?: () => void;
  autoHideDelay?: number;
}

export function LanguageMismatchAlert({
  show,
  message,
  severity,
  onDismiss,
  autoHideDelay = 4000
}: LanguageMismatchAlertProps) {
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (show) {
      const toastType: ToastType = severity === 'error' ? 'alert' : 
                                   severity === 'warning' ? 'chat' : 'info';
      showToast(message, { type: toastType });
    }
  }, [show, message, severity, showToast]);

  const handleDismiss = () => {
    hideToast();
    onDismiss?.();
  };

  return (
    <Toast
      show={toast.show}
      message={toast.message}
      type={toast.type}
      onDismiss={handleDismiss}
      autoHideDelay={autoHideDelay}
    />
  );
}