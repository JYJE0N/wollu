'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Shuffle, Zap, Target, RotateCcw } from 'lucide-react';
import { Language } from '@/data/languages';

interface QuickActionsProps {
  practiceMode: 'sentence' | 'words';
  difficulty: 'easy' | 'medium' | 'hard';
  currentLanguage: Language;
  onPracticeModeChange: (mode: 'sentence' | 'words') => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  isTypingActive: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  practiceMode,
  difficulty,
  currentLanguage,
  onPracticeModeChange,
  onDifficultyChange,
  isTypingActive,
}) => {
  const getDifficultyColor = (level: 'easy' | 'medium' | 'hard') => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  const getDifficultyLabel = (level: 'easy' | 'medium' | 'hard') => {
    if (currentLanguage === 'ko') {
      switch (level) {
        case 'easy': return '쉬움';
        case 'medium': return '보통';
        case 'hard': return '어려움';
      }
    }
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => onPracticeModeChange('sentence')}
              disabled={isTypingActive}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                practiceMode === 'sentence'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{currentLanguage === 'ko' ? '문장 연습' : 'Sentences'}</span>
            </button>
            <button
              onClick={() => onPracticeModeChange('words')}
              disabled={isTypingActive}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                practiceMode === 'words'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap className="w-4 h-4" />
              <span>{currentLanguage === 'ko' ? '단어 연습' : 'Words'}</span>
            </button>
          </div>

          {practiceMode === 'sentence' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentLanguage === 'ko' ? '난이도:' : 'Level:'}
              </span>
              <div className="flex items-center space-x-1">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onDifficultyChange(level)}
                    disabled={isTypingActive}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                      difficulty === level
                        ? getDifficultyColor(level)
                        : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                    } ${isTypingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getDifficultyLabel(level)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={!isTypingActive ? { scale: 1.05 } : {}}
            whileTap={!isTypingActive ? { scale: 0.95 } : {}}
            disabled={isTypingActive}
            className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg shadow-lg transition-all ${
              isTypingActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentLanguage === 'ko' ? '새 텍스트' : 'New Text'}
            </span>
          </motion.button>

          <motion.button
            whileHover={!isTypingActive ? { scale: 1.05 } : {}}
            whileTap={!isTypingActive ? { scale: 0.95 } : {}}
            disabled={isTypingActive}
            className={`flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm transition-all ${
              isTypingActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentLanguage === 'ko' ? '다시 시작' : 'Restart'}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};