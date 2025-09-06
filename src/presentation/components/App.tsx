'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BookOpen, Shuffle, Settings, Globe, ChevronDown, X } from 'lucide-react';
import { ToastProvider } from '@/components/ToastProvider';
import { TypingPracticeView } from './TypingPracticeView';
import { getTextRepository } from '@/infrastructure/di/DIContainer';
import { Language, getAllLanguages } from '@/data/languages';

export default function App() {
  const [currentText, setCurrentText] = useState('');
  const [practiceMode, setPracticeMode] = useState<'sentence' | 'words'>('sentence');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const textRepository = getTextRepository();
  const availableLanguages = getAllLanguages();
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textRepository.setLanguage(currentLanguage);
    const initialText = practiceMode === 'sentence' 
      ? textRepository.getSentencesByDifficulty(difficulty)[0] 
      : textRepository.getRandomWords(10);
    setCurrentText(initialText);
    setIsInitialized(true);
  }, [currentLanguage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleNewText = (showToast: boolean = true) => {
    const newText = practiceMode === 'sentence' 
      ? textRepository.getSentencesByDifficulty(difficulty)[0] 
      : textRepository.getRandomWords(10);
    setCurrentText(newText);
    if (showToast) {
      const message = currentLanguage === 'ko' 
        ? `새로운 ${practiceMode === 'sentence' ? '문장' : '단어'} 연습!`
        : `New ${practiceMode === 'sentence' ? 'sentence' : 'word'} practice!`;
      toast.success(message);
    }
  };

  const handleModeChange = (mode: 'sentence' | 'words') => {
    setPracticeMode(mode);
    const newText = mode === 'sentence' 
      ? textRepository.getSentencesByDifficulty(difficulty)[0]
      : textRepository.getRandomWords(10);
    setCurrentText(newText);
    const message = currentLanguage === 'ko'
      ? `${mode === 'sentence' ? '문장' : '단어'} 연습 모드로 변경!`
      : `Changed to ${mode === 'sentence' ? 'sentence' : 'word'} practice mode!`;
    toast.success(message);
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    if (practiceMode === 'sentence') {
      const newText = textRepository.getSentencesByDifficulty(newDifficulty)[0];
      setCurrentText(newText);
      const difficultyText = currentLanguage === 'ko'
        ? (newDifficulty === 'easy' ? '쉬움' : newDifficulty === 'medium' ? '보통' : '어려움')
        : (newDifficulty === 'easy' ? 'Easy' : newDifficulty === 'medium' ? 'Medium' : 'Hard');
      const message = currentLanguage === 'ko' 
        ? `난이도 변경: ${difficultyText}`
        : `Difficulty changed: ${difficultyText}`;
      toast.success(message);
    }
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    textRepository.setLanguage(language);
    const newText = practiceMode === 'sentence' 
      ? textRepository.getSentencesByDifficulty(difficulty)[0]
      : textRepository.getRandomWords(10);
    setCurrentText(newText);
    const languageName = availableLanguages.find(l => l.code === language)?.name || '';
    const message = currentLanguage === 'ko' 
      ? `언어 변경: ${languageName}`
      : `Language changed: ${languageName}`;
    toast.success(message);
  };

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <motion.header 
          className="bg-white shadow-lg border-b"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex-1" />
              <motion.h1 
                className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {currentLanguage === 'ko' ? '한글 타자연습' : 'Typing Practice'}
              </motion.h1>
              <div className="flex-1 flex justify-end">
                <motion.div className="flex space-x-2 items-center">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as Language)}
                      className={`px-3 py-1 rounded-md transition-all ${
                        currentLanguage === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Globe className="w-4 h-4 inline mr-1" />
                      {lang.name}
                    </button>
                  ))}
                  
                  <div className="relative" ref={settingsRef}>
                    <motion.button
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="w-5 h-5 text-gray-700" />
                    </motion.button>
                    
                    {isSettingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border p-4 min-w-64 z-10"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-800">
                            {currentLanguage === 'ko' ? '설정' : 'Settings'}
                          </h3>
                          <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {currentLanguage === 'ko' ? '연습 모드' : 'Practice Mode'}
                            </label>
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  handleModeChange('sentence');
                                  setIsSettingsOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-all ${
                                  practiceMode === 'sentence'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                {currentLanguage === 'ko' ? '문장 연습' : 'Sentence Practice'}
                              </button>
                              <button
                                onClick={() => {
                                  handleModeChange('words');
                                  setIsSettingsOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-all ${
                                  practiceMode === 'words'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                {currentLanguage === 'ko' ? '단어 연습' : 'Word Practice'}
                              </button>
                            </div>
                          </div>

                          {practiceMode === 'sentence' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'ko' ? '난이도' : 'Difficulty'}
                              </label>
                              <div className="space-y-1">
                                {(['easy', 'medium', 'hard'] as const).map((level) => (
                                  <button
                                    key={level}
                                    onClick={() => {
                                      handleDifficultyChange(level);
                                    }}
                                    className={`w-full px-3 py-1 rounded-md text-left transition-all text-sm ${
                                      difficulty === level
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                  >
                                    {currentLanguage === 'ko' 
                                      ? (level === 'easy' ? '쉬움' : level === 'medium' ? '보통' : '어려움')
                                      : (level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard')
                                    }
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={handleNewText}
                className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-5 h-5 mr-2" />
                {currentLanguage === 'ko' ? '새로운 텍스트' : 'New Text'}
              </motion.button>
            </motion.div>
          </div>
        </motion.header>

        <main className="flex-1 py-8">
          {isInitialized && currentText ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <TypingPracticeView 
                mode={practiceMode}
                difficulty={difficulty}
                text={currentText} 
                onComplete={() => {
                  setTimeout(() => {
                    handleNewText(false); // 자동 완성 시에는 토스트 메시지 생략
                  }, 2000);
                }}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <div className="text-lg text-gray-600">{currentLanguage === 'ko' ? '로딩 중...' : 'Loading...'}</div>
              </div>
            </motion.div>
          )}
        </main>

        <motion.footer
          className="bg-white border-t mt-auto py-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-gray-600 text-sm">
              {currentLanguage === 'ko' 
                ? '© 2024 타자연습 앱. 모든 권리 보유.' 
                : '© 2024 Typing Practice App. All rights reserved.'
              }
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {currentLanguage === 'ko'
                ? '한글과 영문 타자연습을 통해 실력을 향상시키세요.'
                : 'Improve your skills with Korean and English typing practice.'
              }
            </p>
          </div>
        </motion.footer>
      </div>
    </>
  );
}