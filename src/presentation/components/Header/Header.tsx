'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Home } from 'lucide-react';
import { ThemeDropdown, Theme } from './ThemeDropdown';

interface HeaderProps {
  currentLanguage: 'ko' | 'en';
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
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
  }, [brandText]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* BI (브랜드 아이덴티티) */}
          <div className="flex items-center">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="inline-block">{displayText}</span>
                <span
                  className={`inline-block w-0.5 h-6 bg-blue-500 ml-0.5 ${
                    showCursor ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transition: 'opacity 0.1s' }}
                />
              </h1>
            </a>
          </div>

          {/* 네비게이션 영역 */}
          <div className="flex items-center space-x-1">
            {/* 홈 */}
            <a
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:block">
                {currentLanguage === 'ko' ? '홈' : 'Home'}
              </span>
            </a>

            {/* 통계 */}
            <a
              href="/stats"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:block">
                {currentLanguage === 'ko' ? '통계' : 'Stats'}
              </span>
            </a>

            {/* 티어/순위 */}
            <a
              href="/leaderboard"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:block">
                {currentLanguage === 'ko' ? '티어' : 'Tier'}
              </span>
            </a>

            {/* 구분선 */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

            {/* 테마 드롭다운 */}
            <ThemeDropdown
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>
      </div>
    </header>
  );
};