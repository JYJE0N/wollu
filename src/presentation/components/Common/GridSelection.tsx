'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GridSelectionOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface GridSelectionProps<T = string> {
  options: GridSelectionOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GridSelection<T = string>({
  options,
  value,
  onChange,
  columns = 2,
  size = 'md',
  className = '',
}: GridSelectionProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, option: GridSelectionOption<T>) => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const upIndex = currentIndex - columns;
        if (upIndex >= 0) {
          onChange(options[upIndex].value);
        } else {
          const lastRowStart = Math.floor((options.length - 1) / columns) * columns;
          const columnIndex = currentIndex % columns;
          const newIndex = Math.min(lastRowStart + columnIndex, options.length - 1);
          onChange(options[newIndex].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const downIndex = currentIndex + columns;
        if (downIndex < options.length) {
          onChange(options[downIndex].value);
        } else {
          const columnIndex = currentIndex % columns;
          onChange(options[columnIndex].value);
        }
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
    sm: 'p-2 text-xs h-16',
    md: 'p-3 text-sm h-20',
    lg: 'p-4 text-base h-24',
  };

  return (
    <div 
      className={`grid gap-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      role="radiogroup"
      aria-label="Selection options"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option)}
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label}${option.description ? ` - ${option.description}` : ''}`}
            tabIndex={isActive ? 0 : -1}
            className={`
              relative flex flex-col items-center justify-center space-y-1 
              transition-all duration-200 rounded-lg border-2 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              ${sizeClasses[size]}
              ${isActive
                ? 'border-transparent bg-transparent text-purple-700 dark:text-purple-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="grid-selection-indicator"
                className="absolute inset-0 border-2 border-purple-500 bg-purple-50/80 dark:bg-purple-900/25 rounded-lg shadow-sm"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center space-y-1">
              {option.icon && (
                <span className="flex-shrink-0">
                  {option.icon}
                </span>
              )}
              <span className="text-center leading-tight">
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs opacity-75 text-center leading-tight">
                  {option.description}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}