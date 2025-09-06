'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Keyboard } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeDropdown, Theme } from './ThemeDropdown';

interface HeaderProps {
  currentLanguage: 'ko' | 'en';
  onLanguageToggle: () => void;
  onSettingsClick: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageToggle,
  onSettingsClick,
  currentTheme,
  onThemeChange,
}) => {
  const [displayText, setDisplayText] = useState('');
  const brandText = '월루타자기';
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const typeNextChar = () => {
      if (currentIndex < brandText.length) {
        setDisplayText(brandText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, 150);
      }
    };
    
    typeNextChar();

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="inline-block">{displayText}</span>
                <span 
                  className={`inline-block w-0.5 h-6 bg-blue-500 ml-0.5 ${
                    showCursor ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transition: 'opacity 0.1s' }}
                />
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Keyboard className="w-4 h-4" />
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                Shift + Enter
              </span>
              <span>시작</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onToggle={onLanguageToggle}
            />
            
            <ThemeDropdown
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              currentLanguage={currentLanguage}
            />

            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="설정"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};