'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard, BarChart3, Trophy, Home } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeDropdown, Theme } from './ThemeDropdown';
import { SettingsPanel } from './SettingsPanel';

interface HeaderProps {
  currentLanguage: 'ko' | 'en';
  onLanguageToggle: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  practiceMode: 'sentence' | 'words';
  onModeChange: (mode: 'sentence' | 'words') => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sentenceType: 'short' | 'medium' | 'long';
  onSentenceTypeChange: (type: 'short' | 'medium' | 'long') => void;
  sentenceVariant: 'basic' | 'punctuation' | 'numbers' | 'mixed';
  onSentenceVariantChange: (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageToggle,
  currentTheme,
  onThemeChange,
  practiceMode,
  onModeChange,
  wordCount,
  onWordCountChange,
  sentenceType,
  onSentenceTypeChange,
  sentenceVariant,
  onSentenceVariantChange,
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
        {/* 첫 번째 줄: BI + 네비게이션 */}
        <div className="flex items-center justify-between h-16 bg-white dark:bg-gray-900">
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

            {/* 구분선 - 옅은 배경으로 대체 */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

            {/* 언어 토글 */}
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onToggle={onLanguageToggle}
            />
            
            {/* 테마 */}
            <ThemeDropdown
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              currentLanguage={currentLanguage}
            />

            {/* 설정 */}
            <SettingsPanel
              currentLanguage={currentLanguage}
              practiceMode={practiceMode}
              onModeChange={onModeChange}
              wordCount={wordCount}
              onWordCountChange={onWordCountChange}
              sentenceType={sentenceType}
              onSentenceTypeChange={onSentenceTypeChange}
              sentenceVariant={sentenceVariant}
              onSentenceVariantChange={onSentenceVariantChange}
            />
          </div>
        </div>

        {/* 두 번째 줄: 숏컷 안내 영역 - 더 옅은 배경색으로 구분 */}
        <div className="hidden lg:flex items-center justify-center py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4" />
              <span className="text-xs font-medium">{currentLanguage === 'ko' ? '단축키' : 'Shortcuts'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Shift+Enter
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '시작' : 'Start'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Esc
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '일시정지' : 'Pause'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Tab
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '재시작' : 'Restart'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Enter
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '새 텍스트' : 'New Text'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Esc×2
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '초기화' : 'Reset'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <kbd className="font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-xs shadow-sm">
                Space
              </kbd>
              <span className="text-xs">{currentLanguage === 'ko' ? '재개' : 'Resume'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};