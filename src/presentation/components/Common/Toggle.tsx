'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleProps {
  leftOption: ToggleOption;
  rightOption: ToggleOption;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Toggle({
  leftOption,
  rightOption,
  value,
  onChange,
  className = '',
}: ToggleProps) {
  const isLeft = value === leftOption.value;

  return (
    <div className={`relative flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 h-10 ${className}`}>
      <motion.div
        className="absolute bg-blue-600 rounded-md shadow-lg shadow-blue-600/25 z-0"
        initial={false}
        animate={{
          transform: isLeft ? 'translateX(0px)' : 'translateX(calc(100% + 4px))',
        }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4, stiffness: 200 }}
        style={{ 
          height: 'calc(100% - 8px)', 
          top: '4px',
          left: '4px',
          width: 'calc(50% - 4px)'
        }}
      />
      
      <button
        onClick={() => onChange(leftOption.value)}
        className={`
          relative z-10 flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md font-medium transition-colors duration-200
          ${isLeft 
            ? 'text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }
        `}
      >
        {leftOption.icon && <span className="flex-shrink-0 flex items-center">{leftOption.icon}</span>}
        <span className="whitespace-nowrap">{leftOption.label}</span>
      </button>
      
      <button
        onClick={() => onChange(rightOption.value)}
        className={`
          relative z-10 flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md font-medium transition-colors duration-200
          ${!isLeft 
            ? 'text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }
        `}
      >
        {rightOption.icon && <span className="flex-shrink-0 flex items-center">{rightOption.icon}</span>}
        <span className="whitespace-nowrap">{rightOption.label}</span>
      </button>
    </div>
  );
}