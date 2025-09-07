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
  practiceMode: 'sentence' | 'words';
  onModeChange: (mode: 'sentence' | 'words') => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sentenceType: 'short' | 'medium' | 'long';
  onSentenceTypeChange: (type: 'short' | 'medium' | 'long') => void;
  sentenceVariant: 'basic' | 'punctuation' | 'numbers' | 'mixed';
  onSentenceVariantChange: (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  currentLanguage,
  currentTheme,
  practiceMode,
  onModeChange,
  wordCount,
  onWordCountChange,
  sentenceType,
  onSentenceTypeChange,
  sentenceVariant,
  onSentenceVariantChange,
}) => {
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [escPressCount, setEscPressCount] = useState(0);
  const [escTimer, setEscTimer] = useState<NodeJS.Timeout | null>(null);
  const typingEngineRef = useRef<{ 
    focusInput: () => void; 
    restart: () => void; 
    loadNewText: () => void;
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
      
      // Tab: Restart (더 쉬운 단일 키)
      if (e.key === 'Tab' && !isInputField) {
        e.preventDefault();
        e.stopPropagation();
        typingEngineRef.current?.restart();
        return;
      }
      
      // Enter: New Text (새 텍스트 생성)
      if (e.key === 'Enter' && !e.shiftKey && !isInputField) {
        e.preventDefault();
        e.stopPropagation();
        typingEngineRef.current?.loadNewText();
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
              currentLanguage={currentLanguage}
              onPracticeModeChange={onModeChange}
              wordCount={wordCount}
              onWordCountChange={onWordCountChange}
              sentenceType={sentenceType}
              onSentenceTypeChange={onSentenceTypeChange}
              sentenceVariant={sentenceVariant}
              onSentenceVariantChange={onSentenceVariantChange}
              isTypingActive={isTypingActive}
              onStartTyping={() => typingEngineRef.current?.loadNewText()}
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
              wordCount={wordCount}
              sentenceType={sentenceType}
              sentenceVariant={sentenceVariant}
              currentLanguage={currentLanguage}
              onTypingStateChange={setIsTypingActive}
            />
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
};