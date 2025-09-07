'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, TrendingUp, Clock, Target, Keyboard } from 'lucide-react';
import { Language } from '@/data/languages';
import { getTextRepository, getHangulService } from '@/infrastructure/di/DIContainer';
import TextRenderer from '@/presentation/components/Common/TextRenderer';
import { useHangulComposition } from '@/presentation/hooks/useHangulComposition';

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

export const TypingEngine = React.forwardRef<
  { focusInput: () => void; restart: () => void; pause: () => void; resume: () => void; quit: () => void },
  TypingEngineProps
>(({ practiceMode, difficulty, currentLanguage, onTypingStateChange }, ref) => {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const {
    isComposing,
    composingChar,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    resetComposition
  } = useHangulComposition();
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    elapsed: 0,
    totalChars: 0,
    correctChars: 0,
    errors: 0,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
    restart: () => {
      handleReset();
    },
    pause: () => {
      if (isStarted && !isCompleted) {
        setIsPaused(true);
        setPausedTime(prev => prev + (startTime ? Date.now() - startTime : 0));
      }
    },
    resume: () => {
      if (isStarted && isPaused && !isCompleted) {
        setIsPaused(false);
        setStartTime(Date.now());
        inputRef.current?.focus();
      }
    },
    quit: () => {
      handleReset();
      inputRef.current?.blur();
    },
  }));
  const textRepository = getTextRepository();
  const hangulService = getHangulService();

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

  // Just focus without auto-starting timer
  const handleInputFocus = () => {
    // Timer will start when user begins typing (handleInputChange)
    // This gives users time to read and prepare
  };



  // Handle blur (optional: pause when focus is lost)
  const handleInputBlur = () => {
    // Optional: pause timer when focus is lost
    // if (isStarted && !isCompleted) {
    //   setIsPaused(true);
    // }
  };

  const handleReset = () => {
    setUserInput('');
    setIsStarted(false);
    setIsPaused(false);
    setStartTime(null);
    setPausedTime(0);
    resetComposition();
    setStats({
      wpm: 0,
      accuracy: 100,
      elapsed: 0,
      totalChars: 0,
      correctChars: 0,
      errors: 0,
    });
    // Auto focus for new session
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleNewText = () => {
    handleReset();
    // Trigger parent to get new text
    // This would need to be passed as a prop
  };

  // 완료 조건: 길이와 내용이 모두 정확해야 함
  const isCompleted = userInput.length >= targetText.length && userInput === targetText;

  const handleCompositionComplete = useCallback((data: string) => {
    // 이미 입력된 마지막 글자가 조합 완료 글자와 같으면 중복 방지
    if (data && userInput.endsWith(data)) {
      return;
    }
    
    const newInput = userInput + data;
    
    // Auto-start timer on first character
    if (!isStarted && newInput.length > 0) {
      const now = Date.now();
      setIsStarted(true);
      setStartTime(now);
      setIsPaused(false);
    }
    
    // Only allow forward typing if not completed and within bounds
    if (!isCompleted && newInput.length <= targetText.length) {
      setUserInput(newInput);
    }
  }, [userInput, isStarted, isCompleted, targetText.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    
    // Auto-start timer on first character (critical for WPM accuracy)
    if (!isStarted && newInput.length > 0) {
      const now = Date.now();
      setIsStarted(true);
      setStartTime(now); // Precise start time
      setIsPaused(false);
    }
    
    // Handle backspace
    if (newInput.length < userInput.length) {
      setUserInput(newInput);
      resetComposition(); // 백스페이스 시 조합 상태 초기화
      return;
    }
    
    // Only allow forward typing if not completed and within bounds
    if (!isCompleted && newInput.length <= targetText.length) {
      setUserInput(newInput);
    }
  };

  // 오류 상태를 추적하기 위한 errors 객체 생성 (조합 중인 현재 위치 제외)
  const errors = useCallback(() => {
    const errorMap: Record<number, boolean> = {};
    for (let i = 0; i < userInput.length; i++) {
      // 조합 중인 현재 위치는 오류 판정에서 제외
      if (isComposing && i === userInput.length - 1) {
        continue;
      }
      if (i < targetText.length && userInput[i] !== targetText[i]) {
        errorMap[i] = true;
      }
    }
    return errorMap;
  }, [userInput, targetText, isComposing])();


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer and WPM calculation - critical for accuracy
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isPaused && startTime && !isCompleted) {
      // Update every 100ms for more accurate WPM
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedMs = now - startTime + pausedTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const elapsedMinutes = elapsedMs / 60000; // More precise minutes
        
        // WPM calculation: (characters typed / 5) / minutes
        // Using correct chars only for more accurate WPM
        const charactersTyped = stats.correctChars;
        const wpm = elapsedMinutes > 0 
          ? Math.round((charactersTyped / 5) / elapsedMinutes)
          : 0;
        
        // Accuracy: correct chars / total chars typed
        const accuracy = userInput.length > 0 
          ? Math.round((stats.correctChars / userInput.length) * 100)
          : 100;

        setStats(prev => ({
          ...prev,
          elapsed: elapsedSeconds,
          wpm: Math.max(0, wpm), // Ensure non-negative
          accuracy: Math.min(100, accuracy), // Cap at 100%
          totalChars: userInput.length,
        }));
      }, 100); // Update every 100ms for smoother updates
    }
    return () => clearInterval(interval);
  }, [isStarted, isPaused, startTime, pausedTime, userInput.length, stats.correctChars, isCompleted]);

  // Stop timer when completed and calculate final stats
  useEffect(() => {
    if (isCompleted && isStarted && startTime) {
      setIsPaused(true);
      onTypingStateChange(false);
      
      // Calculate final WPM with exact completion time
      const completionTime = Date.now();
      const totalMinutes = (completionTime - startTime + pausedTime) / 60000;
      const finalWpm = totalMinutes > 0 
        ? Math.round((targetText.length / 5) / totalMinutes)
        : 0;
      
      // Set final stats
      setStats(prev => ({
        ...prev,
        wpm: finalWpm,
        accuracy: 100, // 100% since text matches exactly
        totalChars: targetText.length,
        correctChars: targetText.length,
        errors: 0,
      }));
    }
  }, [isCompleted, isStarted, startTime, pausedTime, targetText.length, onTypingStateChange]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isStarted ? stats.wpm : '--'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">WPM</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isStarted ? `${stats.accuracy}%` : '--'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentLanguage === 'ko' ? '정확도' : 'Accuracy'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isStarted ? formatTime(stats.elapsed) : '--:--'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentLanguage === 'ko' ? '시간' : 'Time'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isCompleted ? (
                <>
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {currentLanguage === 'ko' ? '다시 시작' : 'Try Again'}
                    </span>
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Keyboard className="w-4 h-4" />
                  <span>
                    {!isStarted 
                      ? (currentLanguage === 'ko' ? '준비되면 타이핑을 시작하세요 (첫 글자부터 타이머 시작)' : 'Start typing when ready (timer begins with first character)')
                      : isPaused
                      ? (currentLanguage === 'ko' ? '일시정지됨 - Space로 재개' : 'Paused - Press Space to resume')
                      : (currentLanguage === 'ko' ? '타이핑 중...' : 'Typing...')
                    }
                  </span>
                  {isPaused && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 bg-amber-500 rounded-full"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 overflow-y-auto">
            <TextRenderer
              text={targetText}
              userInput={userInput}
              currentIndex={userInput.length}
              isComposing={isComposing}
              composingChar={composingChar}
              errors={errors}
              language={currentLanguage}
              showCursor={!isCompleted}
              highlightCurrent={!isCompleted}
              showSpaces={true}
            />
          </div>

          <div className="relative">
            {/* 투명한 입력 필드 - IME 조합 과정 숨김 */}
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onCompositionStart={handleCompositionStart}
              onCompositionUpdate={handleCompositionUpdate}
              onCompositionEnd={(e) => handleCompositionEnd(e, handleCompositionComplete)}
              disabled={isCompleted}
              placeholder=""
              style={{
                color: 'transparent',
                backgroundColor: 'transparent',
                caretColor: 'transparent',
                textShadow: 'none',
                WebkitTextFillColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                outline: 'none',
                border: 'none'
              }}
              className="absolute inset-0 w-full h-32 p-4 text-lg font-mono resize-none z-10 typing-area"
            />
            
            {/* 시각적 입력 필드 - 실제 보이는 부분 */}
            <div className="w-full h-32 p-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-mono overflow-y-auto focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 dark:focus-within:ring-blue-400 transition-all hover:border-blue-400 dark:hover:border-blue-500">
              {userInput || (
                <span className="text-gray-400 dark:text-gray-500">
                  {currentLanguage === 'ko' 
                    ? '텍스트를 읽고 준비되면 타이핑을 시작하세요...' 
                    : 'Read the text above, then start typing when ready...'}
                </span>
              )}
            </div>
            
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
});

TypingEngine.displayName = 'TypingEngine';