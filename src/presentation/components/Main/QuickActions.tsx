'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Shuffle, Zap, Target, RotateCcw, Settings2, Keyboard } from 'lucide-react';
import { Language } from '@/data/languages';
import { PracticeToggle } from '../Common/PracticeToggle';
import { LanguageToggle } from '../Header/LanguageToggle';
import { SettingsPanel } from '../Header/SettingsPanel';

interface QuickActionsProps {
  practiceMode: 'sentence' | 'words';
  currentLanguage: Language;
  onLanguageToggle: () => void;
  onPracticeModeChange: (mode: 'sentence' | 'words') => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sentenceType: 'short' | 'medium' | 'long';
  onSentenceTypeChange: (type: 'short' | 'medium' | 'long') => void;
  sentenceVariant: 'basic' | 'punctuation' | 'numbers' | 'mixed';
  onSentenceVariantChange: (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => void;
  isTypingActive: boolean;
  onStartTyping?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  practiceMode,
  currentLanguage,
  onLanguageToggle,
  onPracticeModeChange,
  wordCount,
  onWordCountChange,
  sentenceType,
  onSentenceTypeChange,
  sentenceVariant,
  onSentenceVariantChange,
  isTypingActive,
  onStartTyping,
}) => {
  const getSentenceTypeColor = (type: 'short' | 'medium' | 'long') => {
    switch (type) {
      case 'short': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800';
      case 'long': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  const getSentenceTypeLabel = (type: 'short' | 'medium' | 'long') => {
    if (currentLanguage === 'ko') {
      switch (type) {
        case 'short': return '단문';
        case 'medium': return '중문';
        case 'long': return '장문';
      }
    }
    switch (type) {
      case 'short': return 'Short';
      case 'medium': return 'Medium';
      case 'long': return 'Long';
    }
  };

  const getSentenceVariantLabel = (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => {
    if (currentLanguage === 'ko') {
      switch (variant) {
        case 'basic': return '기본';
        case 'punctuation': return '구두점';
        case 'numbers': return '숫자';
        case 'mixed': return '혼합';
      }
    }
    switch (variant) {
      case 'basic': return 'Basic';
      case 'punctuation': return 'Punct';
      case 'numbers': return 'Numbers';
      case 'mixed': return 'Mixed';
    }
  };

  const getWordCountLabel = (count: number) => {
    return `${count}${currentLanguage === 'ko' ? '개' : 'w'}`;
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 첫 번째 줄: 언어 선택과 설정 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <LanguageToggle
            currentLanguage={currentLanguage}
            onToggle={onLanguageToggle}
          />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <PracticeToggle
            practiceMode={practiceMode}
            onToggle={onPracticeModeChange}
            currentLanguage={currentLanguage}
            disabled={isTypingActive}
          />
        </div>
        <div className="flex items-center">
          <SettingsPanel
            currentLanguage={currentLanguage}
            practiceMode={practiceMode}
            onModeChange={onPracticeModeChange}
            wordCount={wordCount}
            onWordCountChange={onWordCountChange}
            sentenceType={sentenceType}
            onSentenceTypeChange={onSentenceTypeChange}
            sentenceVariant={sentenceVariant}
            onSentenceVariantChange={onSentenceVariantChange}
          />
        </div>
      </div>

      {/* 두 번째 줄: 모드별 옵션 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">

          {practiceMode === 'sentence' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ko' ? '길이:' : 'Length:'}
                </span>
                <div className="flex items-center space-x-1">
                  {(['short', 'medium', 'long'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onSentenceTypeChange(type)}
                      disabled={isTypingActive}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        sentenceType === type
                          ? getSentenceTypeColor(type)
                          : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                      } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {getSentenceTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ko' ? '스타일:' : 'Style:'}
                </span>
                <div className="flex items-center space-x-1">
                  {(['basic', 'punctuation', 'numbers', 'mixed'] as const).map((variant) => (
                    <button
                      key={variant}
                      onClick={() => onSentenceVariantChange(variant)}
                      disabled={isTypingActive}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        sentenceVariant === variant
                          ? 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                      } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {getSentenceVariantLabel(variant)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {practiceMode === 'words' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentLanguage === 'ko' ? '개수:' : 'Count:'}
              </span>
              <div className="flex items-center space-x-1">
                {([10, 25, 50, 100] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => onWordCountChange(count)}
                    disabled={isTypingActive}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                      wordCount === count
                        ? 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
                        : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                    } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getWordCountLabel(count)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => onStartTyping?.()}
            whileHover={!isTypingActive ? { scale: 1.05 } : {}}
            whileTap={!isTypingActive ? { scale: 0.95 } : {}}
            disabled={isTypingActive}
            className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg shadow-lg transition-all ${
              isTypingActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={currentLanguage === 'ko' ? '숏컷: Enter' : 'Shortcut: Enter'}
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentLanguage === 'ko' ? '새 텍스트' : 'New Text'}
            </span>
          </motion.button>

          <motion.button
            onClick={() => onStartTyping?.()}
            whileHover={!isTypingActive ? { scale: 1.05 } : {}}
            whileTap={!isTypingActive ? { scale: 0.95 } : {}}
            disabled={isTypingActive}
            className={`flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm transition-all ${
              isTypingActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={currentLanguage === 'ko' ? '숏컷: Tab' : 'Shortcut: Tab'}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentLanguage === 'ko' ? '다시 시작' : 'Restart'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* 세 번째 줄: 숏컷 안내 */}
      <div className="flex items-center justify-center py-3 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4" />
            <span className="text-xs font-medium">{currentLanguage === 'ko' ? '단축키' : 'Shortcuts'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
              ⇧Enter
            </kbd>
            <span className="text-xs">{currentLanguage === 'ko' ? '시작' : 'Start'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
              Tab
            </kbd>
            <span className="text-xs">{currentLanguage === 'ko' ? '재시작' : 'Restart'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
              Enter
            </kbd>
            <span className="text-xs">{currentLanguage === 'ko' ? '새 텍스트' : 'New Text'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
              Esc
            </kbd>
            <span className="text-xs">{currentLanguage === 'ko' ? '일시정지' : 'Pause'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
              Esc×2
            </kbd>
            <span className="text-xs">{currentLanguage === 'ko' ? '초기화' : 'Reset'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};