'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, BookOpen, Zap, Hash, Type, FileText, Book, CheckSquare, Calculator, Shuffle as MixIcon } from 'lucide-react';
import { MdFormatQuote, MdTextFields } from 'react-icons/md';
import { TiSortNumerically } from 'react-icons/ti';
import { IoDuplicate, IoEllipsisHorizontal, IoReorderTwo, IoRemoveOutline, IoReorderThree, IoReorderFour } from 'react-icons/io5';
import { Language } from '@/data/languages';
import { Toggle } from '../Common/Toggle';
import { ButtonGroup } from '../Common/ButtonGroup';

interface SettingsPanelProps {
  currentLanguage: Language;
  practiceMode: 'sentence' | 'words';
  onModeChange: (mode: 'sentence' | 'words') => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sentenceType: 'short' | 'medium' | 'long';
  onSentenceTypeChange: (type: 'short' | 'medium' | 'long') => void;
  sentenceVariant: 'basic' | 'punctuation' | 'numbers' | 'mixed';
  onSentenceVariantChange: (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentLanguage,
  practiceMode,
  onModeChange,
  wordCount,
  onWordCountChange,
  sentenceType,
  onSentenceTypeChange,
  sentenceVariant,
  onSentenceVariantChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const wordCountOptions = [
    { 
      value: 10, 
      label: '10',
      icon: (
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      )
    },
    { 
      value: 25, 
      label: '25',
      icon: (
        <div className="grid grid-cols-3 gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      )
    },
    { 
      value: 50, 
      label: '50',
      icon: (
        <div className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
          ))}
        </div>
      )
    },
    { 
      value: 100, 
      label: '100',
      icon: (
        <div className="grid grid-cols-5 gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
          ))}
        </div>
      )
    },
  ];
  
  const sentenceTypes = [
    { 
      value: 'short' as const, 
      label: currentLanguage === 'ko' ? '단문' : 'Short',
      icon: <IoRemoveOutline className="w-3 h-3" />
    },
    { 
      value: 'medium' as const, 
      label: currentLanguage === 'ko' ? '중문' : 'Medium',
      icon: <IoReorderThree className="w-3 h-3" />
    },
    { 
      value: 'long' as const, 
      label: currentLanguage === 'ko' ? '장문' : 'Long',
      icon: <IoReorderFour className="w-3 h-3" />
    },
  ];

  const sentenceVariants = [
    { 
      value: 'basic' as const, 
      label: currentLanguage === 'ko' ? '기본' : 'Basic',
      icon: <MdTextFields className="w-3 h-3" />,
      description: 'ABC'
    },
    { 
      value: 'punctuation' as const, 
      label: currentLanguage === 'ko' ? '구두점' : 'Punct',
      icon: <MdFormatQuote className="w-3 h-3" />,
      description: 'A,B.'
    },
    { 
      value: 'numbers' as const, 
      label: currentLanguage === 'ko' ? '숫자' : 'Numbers',
      icon: <TiSortNumerically className="w-3 h-3" />,
      description: 'A1B2'
    },
    { 
      value: 'mixed' as const, 
      label: currentLanguage === 'ko' ? '혼합' : 'Mixed',
      icon: <IoDuplicate className="w-3 h-3" />,
      description: 'A1,B2.'
    },
  ];

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label={currentLanguage === 'ko' ? '설정 메뉴 열기' : 'Open settings menu'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute right-0 top-full mt-2 w-80 sm:w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-5 z-50"
            role="dialog"
            aria-modal="false"
            aria-labelledby="settings-title"
          >
            <div className="space-y-6">
              <div>
                <h3 id="settings-title" className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {currentLanguage === 'ko' ? '설정' : 'Settings'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentLanguage === 'ko' ? '연습 옵션을 선택하세요' : 'Choose your practice options'}
                </p>
              </div>

              {/* 모드 선택 */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {currentLanguage === 'ko' ? '모드' : 'Mode'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {currentLanguage === 'ko' ? '단어 또는 문장 기반 선택' : 'Word or sentence based selection'}
                  </p>
                </div>
                <Toggle
                  leftOption={{
                    value: 'words',
                    label: currentLanguage === 'ko' ? '단어' : 'Words',
                    icon: <IoEllipsisHorizontal className="w-4 h-4" />
                  }}
                  rightOption={{
                    value: 'sentence',
                    label: currentLanguage === 'ko' ? '문장' : 'Sentence',
                    icon: <IoReorderTwo className="w-4 h-4" />
                  }}
                  value={practiceMode}
                  onChange={onModeChange}
                  className="w-full"
                />
              </div>

              {/* 단어 모드 설정 */}
              {practiceMode === 'words' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 sm:space-y-4"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {currentLanguage === 'ko' ? '목표' : 'Target'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {currentLanguage === 'ko' ? '단어 개수' : 'Word count'}
                    </p>
                  </div>
                  <ButtonGroup
                    options={wordCountOptions}
                    value={wordCount}
                    onChange={onWordCountChange}
                    size="sm"
                    className="w-full"
                  />
                </motion.div>
              )}

              {/* 문장 모드 설정 */}
              {practiceMode === 'sentence' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* 문장 길이 */}
                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {currentLanguage === 'ko' ? '길이' : 'Length'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {currentLanguage === 'ko' ? '단문 · 중문 · 장문' : 'Short · Medium · Long'}
                      </p>
                    </div>
                    <ButtonGroup
                      options={sentenceTypes}
                      value={sentenceType}
                      onChange={onSentenceTypeChange}
                      size="sm"
                      className="w-full"
                    />
                  </div>

                  {/* 문장 유형 */}
                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {currentLanguage === 'ko' ? '스타일' : 'Style'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {currentLanguage === 'ko' ? '일반 · 구두점 · 숫자 · 혼합' : 'Basic · Punctuation · Numbers · Mixed'}
                      </p>
                    </div>
                    <ButtonGroup
                      options={sentenceVariants.map(variant => ({
                        value: variant.value,
                        label: variant.description,
                        icon: variant.icon
                      }))}
                      value={sentenceVariant}
                      onChange={onSentenceVariantChange}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};