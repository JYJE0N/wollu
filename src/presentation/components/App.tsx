'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BookOpen, Shuffle, Settings, X } from 'lucide-react';
import { ToastProvider } from '@/components/ToastProvider';
import { TypingPracticeView } from './TypingPracticeView';
import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { MainContent } from './Main/MainContent';
import { getTextRepository } from '@/infrastructure/di/DIContainer';
import { Language, getAllLanguages } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    textRepository.setLanguage(currentLanguage);
    const initialText = practiceMode === 'sentence' 
      ? textRepository.getSentencesByDifficulty(difficulty)[0] 
      : textRepository.getRandomWords(10);
    setCurrentText(initialText);
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
    handleLanguageChange(newLanguage);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Header 
          currentLanguage={currentLanguage}
          onLanguageToggle={handleLanguageToggle}
          onSettingsClick={handleSettingsClick}
          currentTheme={theme}
          onThemeChange={setTheme}
        />
        
        {isSettingsOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}>
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 min-w-80 max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {currentLanguage === 'ko' ? '설정' : 'Settings'}
                  </h3>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {currentLanguage === 'ko' ? '연습 모드' : 'Practice Mode'}
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleModeChange('sentence');
                          setIsSettingsOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2.5 rounded-md text-left transition-all ${
                          practiceMode === 'sentence'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
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
                        className={`w-full flex items-center px-4 py-2.5 rounded-md text-left transition-all ${
                          practiceMode === 'words'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {currentLanguage === 'ko' ? '단어 연습' : 'Word Practice'}
                      </button>
                    </div>
                  </div>

                  {practiceMode === 'sentence' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {currentLanguage === 'ko' ? '난이도' : 'Difficulty'}
                      </label>
                      <div className="space-y-2">
                        {(['easy', 'medium', 'hard'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              handleDifficultyChange(level);
                            }}
                            className={`w-full px-4 py-2 rounded-md text-left transition-all ${
                              difficulty === level
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
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
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <motion.button
                      onClick={() => {
                        handleNewText();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ko' ? '새로운 텍스트' : 'New Text'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        <MainContent 
          currentLanguage={currentLanguage}
          currentTheme={theme}
        />

        <Footer currentLanguage={currentLanguage} />
      </div>
    </>
  );
}