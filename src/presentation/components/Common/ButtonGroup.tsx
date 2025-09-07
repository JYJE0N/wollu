'use client';

import React from 'react';

interface ButtonGroupOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface ButtonGroupProps<T = string> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonGroup<T = string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: ButtonGroupProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-10',
    md: 'px-4 py-2.5 text-sm h-11',
    lg: 'px-5 py-3 text-base h-12',
  };

  return (
    <div className={`flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {options.map((option, index) => {
        const isActive = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={`
              relative flex-1 flex items-center justify-center space-x-1.5 font-medium transition-all duration-200
              ${sizeClasses[size]}
              ${!isFirst ? 'border-l border-gray-200 dark:border-gray-600' : ''}
              ${isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
            `}
          >
            {option.icon && (
              <span className="flex-shrink-0">
                {option.icon}
              </span>
            )}
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}