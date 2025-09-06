'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, TrendingUp, Clock, Target } from 'lucide-react';
import { Language } from '@/data/languages';
import { getTextRepository } from '@/infrastructure/di/DIContainer';

interface TypingEngineProps {
  practiceMode: 'sentence' | 'words';
  difficulty: 'easy' | 'medium' | 'hard';
  currentLanguage: Language;
  onTypingStateChange: (isActive: boolean) => void;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  elapsed: number;
  totalChars: number;
  correctChars: number;
  errors: number;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  practiceMode,
  difficulty,
  currentLanguage,
  onTypingStateChange,
}) => {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    elapsed: 0,
    totalChars: 0,
    correctChars: 0,
    errors: 0,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textRepository = getTextRepository();

  useEffect(() => {
    textRepository.setLanguage(currentLanguage);
    const newText = practiceMode === 'sentence'
      ? textRepository.getSentencesByDifficulty(difficulty)[0]
      : textRepository.getRandomWords(10);
    setTargetText(newText);
    handleReset();
  }, [practiceMode, difficulty, currentLanguage]);

  useEffect(() => {
    onTypingStateChange(isStarted && !isPaused);
  }, [isStarted, isPaused, onTypingStateChange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const minutes = elapsed / 60;
        const wpm = minutes > 0 ? Math.round((userInput.length / 5) / minutes) : 0;
        const accuracy = userInput.length > 0 
          ? Math.round((stats.correctChars / userInput.length) * 100)
          : 100;

        setStats(prev => ({
          ...prev,
          elapsed,
          wpm,
          accuracy,
          totalChars: userInput.length,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isPaused, startTime, userInput.length, stats.correctChars]);

  const calculateCorrectChars = useCallback(() => {
    let correct = 0;
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (i < targetText.length && userInput[i] === targetText[i]) {
        correct++;
      } else {
        errors++;
      }
    }
    return { correct, errors };
  }, [userInput, targetText]);

  useEffect(() => {
    const { correct, errors } = calculateCorrectChars();
    setStats(prev => ({
      ...prev,
      correctChars: correct,
      errors: errors,
    }));
  }, [calculateCorrectChars]);

  const handleStart = () => {
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
      inputRef.current?.focus();
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleReset = () => {
    setUserInput('');
    setIsStarted(false);
    setIsPaused(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      elapsed: 0,
      totalChars: 0,
      correctChars: 0,
      errors: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isStarted && !isPaused) {
      setUserInput(e.target.value);
    }
  };

  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let className = 'transition-colors duration-100';
      
      if (index < userInput.length) {
        className += userInput[index] === char 
          ? ' bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
          : ' bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
      } else if (index === userInput.length) {
        className += ' bg-blue-400 text-white animate-pulse';
      } else {
        className += ' text-gray-700 dark:text-gray-300';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCompleted = userInput.length >= targetText.length && userInput === targetText;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wpm}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">WPM</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentLanguage === 'ko' ? '정확도' : 'Accuracy'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(stats.elapsed)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentLanguage === 'ko' ? '시간' : 'Time'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg transition-all"
              >
                {isStarted && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{currentLanguage === 'ko' ? '일시정지' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{currentLanguage === 'ko' ? '시작' : 'Start'}</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 overflow-y-auto">
            <div className="text-xl leading-relaxed font-mono">
              {renderText()}
            </div>
          </div>

          <div className="relative">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              disabled={!isStarted || isPaused || isCompleted}
              placeholder={currentLanguage === 'ko' 
                ? '여기에 타이핑을 시작하세요...' 
                : 'Start typing here...'}
              className="w-full h-32 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            />
            
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-green-500/90 to-emerald-600/90 rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-4xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <div className="text-2xl font-bold mb-2">
                    {currentLanguage === 'ko' ? '완료!' : 'Completed!'}
                  </div>
                  <div className="text-sm opacity-90">
                    {stats.wpm} WPM • {stats.accuracy}% {currentLanguage === 'ko' ? '정확도' : 'Accuracy'}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};