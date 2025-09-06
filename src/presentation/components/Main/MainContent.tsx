'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypingEngine } from './TypingEngine';
import { QuickActions } from './QuickActions';
import { Language } from '@/data/languages';
import { Theme } from '@/hooks/useTheme';

interface MainContentProps {
  currentLanguage: Language;
  currentTheme: Theme;
}

export const MainContent: React.FC<MainContentProps> = ({
  currentLanguage,
  currentTheme,
}) => {
  const [practiceMode, setPracticeMode] = useState<'sentence' | 'words'>('sentence');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isTypingActive, setIsTypingActive] = useState(false);

  return (
    <motion.main 
      className="flex-1 min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex flex-col py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <QuickActions 
              practiceMode={practiceMode}
              difficulty={difficulty}
              currentLanguage={currentLanguage}
              onPracticeModeChange={setPracticeMode}
              onDifficultyChange={setDifficulty}
              isTypingActive={isTypingActive}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 min-h-0"
          >
            <TypingEngine
              practiceMode={practiceMode}
              difficulty={difficulty}
              currentLanguage={currentLanguage}
              onTypingStateChange={setIsTypingActive}
            />
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
};