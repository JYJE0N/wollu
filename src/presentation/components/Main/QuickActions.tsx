'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shuffle, Zap, Target, RotateCcw, Settings2, Keyboard, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '@/data/languages';
import { PracticeToggle } from '../Common/PracticeToggle';
import { LanguageToggle } from '../Header/LanguageToggle';

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
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="flex flex-col space-y-4">
      {/* 첫 번째 줄: 언어 선택, 연습 모드, 설정 토글 */}
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
        <div className="flex items-center space-x-2">
          {/* 현재 설정 요약 표시 */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {practiceMode === 'sentence'
              ? `${getSentenceTypeLabel(sentenceType)} · ${getSentenceVariantLabel(sentenceVariant)}`
              : `${getWordCountLabel(wordCount)}`
            }
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isTypingActive}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showSettings
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Settings2 className="w-4 h-4" />
            <span>{currentLanguage === 'ko' ? '설정' : 'Settings'}</span>
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 상세 설정 (숨김/표시) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex flex-col space-y-4">

                {practiceMode === 'sentence' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col space-y-4"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
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
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
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
                    className="flex items-center space-x-4"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 액션 버튼 (간소화) */}
      <div className="flex items-center justify-center">
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
      </div>
    </div>
  );
};