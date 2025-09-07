'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
  
  // 새로운 설정 상태들
  const [wordCount, setWordCount] = useState<number>(25);
  const [sentenceType, setSentenceType] = useState<'short' | 'medium' | 'long'>('medium');
  const [sentenceVariant, setSentenceVariant] = useState<'basic' | 'punctuation' | 'numbers' | 'mixed'>('basic');
  
  const textRepository = getTextRepository();
  const availableLanguages = getAllLanguages();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    textRepository.setLanguage(currentLanguage);
    const initialText = practiceMode === 'sentence' 
      ? textRepository.getSentenceByTypeAndVariant(sentenceType, sentenceVariant)
      : textRepository.getRandomWords(wordCount);
    setCurrentText(initialText);
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);


  const handleNewText = (showToast: boolean = true) => {
    const newText = practiceMode === 'sentence' 
      ? textRepository.getSentenceByTypeAndVariant(sentenceType, sentenceVariant)
      : textRepository.getRandomWords(wordCount);
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
      ? textRepository.getSentenceByTypeAndVariant(sentenceType, sentenceVariant)
      : textRepository.getRandomWords(wordCount);
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

  // 세팅 패널 핸들러들
  const handleWordCountChange = (count: number) => {
    setWordCount(count);
    if (practiceMode === 'words') {
      const newText = textRepository.getRandomWords(count);
      setCurrentText(newText);
    }
  };

  const handleSentenceTypeChange = (type: 'short' | 'medium' | 'long') => {
    setSentenceType(type);
    if (practiceMode === 'sentence') {
      const newText = textRepository.getSentenceByTypeAndVariant(type, sentenceVariant);
      setCurrentText(newText);
    }
  };

  const handleSentenceVariantChange = (variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => {
    setSentenceVariant(variant);
    if (practiceMode === 'sentence') {
      const newText = textRepository.getSentenceByTypeAndVariant(sentenceType, variant);
      setCurrentText(newText);
    }
  };


  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Header 
          currentLanguage={currentLanguage}
          onLanguageToggle={handleLanguageToggle}
          currentTheme={theme}
          onThemeChange={setTheme}
          practiceMode={practiceMode}
          onModeChange={handleModeChange}
          wordCount={wordCount}
          onWordCountChange={handleWordCountChange}
          sentenceType={sentenceType}
          onSentenceTypeChange={handleSentenceTypeChange}
          sentenceVariant={sentenceVariant}
          onSentenceVariantChange={handleSentenceVariantChange}
        />
        

        <MainContent 
          currentLanguage={currentLanguage}
          currentTheme={theme}
          practiceMode={practiceMode}
          onModeChange={handleModeChange}
          wordCount={wordCount}
          onWordCountChange={handleWordCountChange}
          sentenceType={sentenceType}
          onSentenceTypeChange={handleSentenceTypeChange}
          sentenceVariant={sentenceVariant}
          onSentenceVariantChange={handleSentenceVariantChange}
        />

        <Footer currentLanguage={currentLanguage} />
      </div>
    </>
  );
}