'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ToastProvider } from '@/components/ToastProvider';
import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { MainContent } from './Main/MainContent';
import { getTextRepository } from '@/infrastructure/di/DIContainer';
import { Language, getAllLanguages } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  const [practiceMode, setPracticeMode] = useState<'sentence' | 'words'>('sentence');
  const [currentText, setCurrentText] = useState('');
  // difficulty는 더 이상 사용하지 않음 - sentenceType으로 대체
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


  const handleModeChange = useCallback((mode: 'sentence' | 'words') => {
    setPracticeMode(mode);
    const message = currentLanguage === 'ko'
      ? `${mode === 'sentence' ? '문장' : '단어'} 연습 모드로 변경!`
      : `Changed to ${mode === 'sentence' ? 'sentence' : 'word'} practice mode!`;
    toast.success(message);
  }, [currentLanguage]);

  // difficulty 관련 핸들러는 더 이상 사용하지 않음

  const handleLanguageChange = useCallback((language: Language) => {
    setCurrentLanguage(language);
    textRepository.setLanguage(language);
    const newText = practiceMode === 'sentence' 
      ? textRepository.getSentenceByTypeAndVariant(sentenceType, sentenceVariant)
      : textRepository.getRandomWords(wordCount);
    setCurrentText(newText);
    const languageName = availableLanguages.find(l => l.code === language)?.name || '';
    const message = currentLanguage === 'ko' 
      ? `언어 변경: ${languageName}`
      : `Language changed: ${languageName}`;
    toast.success(message);
  }, [practiceMode, sentenceType, sentenceVariant, wordCount, currentLanguage, textRepository, availableLanguages]);

  const handleLanguageToggle = useCallback(() => {
    const newLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
    handleLanguageChange(newLanguage);
  }, [currentLanguage, handleLanguageChange]);

  // 세팅 패널 핸들러들
  const handleWordCountChange = useCallback((count: number) => {
    setWordCount(count);
    if (practiceMode === 'words') {
      const newText = textRepository.getRandomWords(count);
      setCurrentText(newText);
    }
  }, [practiceMode, textRepository]);

  const handleSentenceTypeChange = useCallback((type: 'short' | 'medium' | 'long') => {
    setSentenceType(type);
    if (practiceMode === 'sentence') {
      const newText = textRepository.getSentenceByTypeAndVariant(type, sentenceVariant);
      setCurrentText(newText);
    }
  }, [practiceMode, sentenceVariant, textRepository]);

  const handleSentenceVariantChange = useCallback((variant: 'basic' | 'punctuation' | 'numbers' | 'mixed') => {
    setSentenceVariant(variant);
    if (practiceMode === 'sentence') {
      const newText = textRepository.getSentenceByTypeAndVariant(sentenceType, variant);
      setCurrentText(newText);
    }
  }, [practiceMode, sentenceType, textRepository]);


  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Header
          currentLanguage={currentLanguage}
          currentTheme={theme}
          onThemeChange={setTheme}
        />
        

        <MainContent
          currentLanguage={currentLanguage}
          onLanguageToggle={handleLanguageToggle}
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