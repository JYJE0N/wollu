'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedControlOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function SegmentedControl<T = string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'primary',
  className = '',
}: SegmentedControlProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, option: SegmentedControlOption<T>) => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
        break;
      case 'Home':
        e.preventDefault();
        onChange(options[0].value);
        break;
      case 'End':
        e.preventDefault();
        onChange(options[options.length - 1].value);
        break;
    }
  };
  const sizeClasses = {
    sm: 'text-xs px-3 py-2 h-8',
    md: 'text-sm px-4 py-2.5 h-10',
    lg: 'text-base px-5 py-3 h-12',
  };

  const variantClasses = {
    primary: {
      container: 'bg-blue-100 dark:bg-blue-900/20',
      active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/25',
      inactive: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    },
    secondary: {
      container: 'bg-blue-100 dark:bg-blue-900/20',
      active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/25',
      inactive: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    },
  };

  return (
    <div 
      className={`inline-flex p-1 rounded-lg border border-blue-200 dark:border-blue-800 ${variantClasses[variant].container} ${className}`}
      role="tablist"
      aria-orientation="horizontal"
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${String(option.value)}`}
            tabIndex={isActive ? 0 : -1}
            className={`
              relative flex items-center justify-center space-x-1 font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-100 dark:focus:ring-offset-blue-900/20
              ${sizeClasses[size]}
              ${isActive 
                ? variantClasses[variant].active 
                : variantClasses[variant].inactive
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-control-${variant}`}
                className="absolute inset-0 rounded-md bg-blue-600 shadow-lg shadow-blue-600/25"
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4, stiffness: 200 }}
              />
            )}
            
            <span className="relative z-10 flex items-center space-x-1">
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span>{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}