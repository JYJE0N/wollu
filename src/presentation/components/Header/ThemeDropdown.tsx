'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

interface ThemeDropdownProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentLanguage: 'ko' | 'en';
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  currentTheme,
  onThemeChange,
  currentLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: currentLanguage === 'ko' ? '라이트' : 'Light',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      value: 'dark',
      label: currentLanguage === 'ko' ? '다크' : 'Dark',
      icon: <Moon className="w-4 h-4" />,
    },
    {
      value: 'system',
      label: currentLanguage === 'ko' ? '시스템' : 'System',
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  const currentOption = themeOptions.find(option => option.value === currentTheme) || themeOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (theme: Theme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={currentLanguage === 'ko' ? '테마 선택' : 'Select theme'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {currentOption.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          >
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  currentTheme === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={currentTheme === option.value ? 'text-blue-600 dark:text-blue-400' : ''}>
                    {option.icon}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </div>
                {currentTheme === option.value && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};