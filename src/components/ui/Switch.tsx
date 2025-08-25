"use client";

import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Switch({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'md',
  className = '' 
}: SwitchProps) {
  const sizeConfig = {
    sm: { 
      width: '32px', 
      height: '18px', 
      thumbSize: '14px',
      translateX: '14px'
    },
    md: { 
      width: '44px', 
      height: '24px', 
      thumbSize: '20px',
      translateX: '20px'
    },
    lg: { 
      width: '52px', 
      height: '28px', 
      thumbSize: '24px',
      translateX: '24px'
    }
  };

  const config = sizeConfig[size];

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{
        width: config.width,
        height: config.height,
        backgroundColor: checked 
          ? 'var(--color-interactive-primary)' 
          : 'var(--color-background-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: checked 
          ? 'var(--color-interactive-primary)' 
          : 'var(--color-border)'
      }}
    >
      <span
        className="inline-block rounded-full shadow-sm transition-transform duration-200 ease-in-out"
        style={{
          width: config.thumbSize,
          height: config.thumbSize,
          backgroundColor: 'white',
          transform: checked ? `translateX(${config.translateX})` : 'translateX(2px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}
      />
    </button>
  );
}