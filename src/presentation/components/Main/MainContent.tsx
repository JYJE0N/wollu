'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [escPressCount, setEscPressCount] = useState(0);
  const [escTimer, setEscTimer] = useState<NodeJS.Timeout | null>(null);
  const typingEngineRef = useRef<{ 
    focusInput: () => void; 
    restart: () => void; 
    pause: () => void; 
    resume: () => void; 
    quit: () => void; 
  }>(null);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field (except our typing area)
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          (target.tagName === 'TEXTAREA' && !target.className.includes('typing-area'));
      
      // Shift+Enter: Start/Focus
      if (e.shiftKey && e.key === 'Enter' && !isInputField) {
        e.preventDefault();
        e.stopPropagation();
        typingEngineRef.current?.focusInput();
        return;
      }
      
      // Ctrl+Shift+R: Restart (avoid conflict with browser refresh Ctrl+R)
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && !isInputField) {
        e.preventDefault();
        e.stopPropagation();
        typingEngineRef.current?.restart();
        return;
      }
      
      // Spacebar: Resume (only if paused)
      if (e.key === ' ' && !isInputField && !isTypingActive) {
        e.preventDefault();
        e.stopPropagation();
        typingEngineRef.current?.resume();
        return;
      }
      
      // Esc: Pause or Quit (double press)
      if (e.key === 'Escape' && !isInputField) {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear previous timer
        if (escTimer) {
          clearTimeout(escTimer);
        }
        
        const newCount = escPressCount + 1;
        setEscPressCount(newCount);
        
        if (newCount === 1) {
          // First Esc - pause
          typingEngineRef.current?.pause();
          
          // Set timer to reset count after 500ms
          const timer = setTimeout(() => {
            setEscPressCount(0);
          }, 500);
          setEscTimer(timer);
        } else if (newCount >= 2) {
          // Double Esc - quit/reset
          typingEngineRef.current?.quit();
          setEscPressCount(0);
          if (escTimer) clearTimeout(escTimer);
          setEscTimer(null);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (escTimer) clearTimeout(escTimer);
    };
  }, [isTypingActive, escPressCount, escTimer]);

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
              onStartTyping={() => typingEngineRef.current?.focusInput()}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 min-h-0"
          >
            <TypingEngine
              ref={typingEngineRef}
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