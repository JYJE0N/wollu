import { useState, useEffect, useCallback } from 'react';

export interface TypingStats {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeElapsed: number;
}

export interface TypingState {
  currentText: string;
  userInput: string;
  currentIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  errors: boolean[];
  startTime: number | null;
  stats: TypingStats;
}

const initialStats: TypingStats = {
  wpm: 0,
  accuracy: 0,
  totalCharacters: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  timeElapsed: 0,
};

export function useTyping(text: string) {
  const [state, setState] = useState<TypingState>({
    currentText: text,
    userInput: '',
    currentIndex: 0,
    isStarted: false,
    isCompleted: false,
    errors: new Array(text.length).fill(false),
    startTime: null,
    stats: initialStats,
  });

  // 텍스트가 변경되면 상태 리셋
  useEffect(() => {
    setState({
      currentText: text,
      userInput: '',
      currentIndex: 0,
      isStarted: false,
      isCompleted: false,
      errors: new Array(text.length).fill(false),
      startTime: null,
      stats: initialStats,
    });
  }, [text]);

  // 통계 계산
  const calculateStats = useCallback((userInput: string, timeElapsed: number, errors: boolean[]) => {
    const totalCharacters = userInput.length;
    const correctCharacters = userInput.split('').filter((_, index) => !errors[index]).length;
    const incorrectCharacters = totalCharacters - correctCharacters;
    const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
    const timeInMinutes = timeElapsed / 60;
    const wpm = timeInMinutes > 0 ? Math.round(correctCharacters / timeInMinutes) : 0;

    return {
      wpm,
      accuracy: Math.round(accuracy * 100) / 100,
      totalCharacters,
      correctCharacters,
      incorrectCharacters,
      timeElapsed,
    };
  }, []);

  // 실시간 통계 업데이트
  useEffect(() => {
    if (state.isStarted && state.startTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeElapsed = Math.floor((now - state.startTime!) / 1000);
        const newStats = calculateStats(state.userInput, timeElapsed, state.errors);
        
        setState(prev => ({
          ...prev,
          stats: newStats,
        }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.isStarted, state.startTime, state.userInput, state.errors, calculateStats]);

  const handleKeyPress = useCallback((key: string) => {
    setState(prev => {
      // 처음 입력 시 타이머 시작
      if (!prev.isStarted) {
        const newState = {
          ...prev,
          isStarted: true,
          startTime: Date.now(),
        };
        return newState;
      }

      // 완료된 상태에서는 입력 무시
      if (prev.isCompleted) {
        return prev;
      }

      let newUserInput = prev.userInput;
      let newCurrentIndex = prev.currentIndex;
      const newErrors = [...prev.errors];

      if (key === 'Backspace') {
        if (newUserInput.length > 0) {
          newUserInput = newUserInput.slice(0, -1);
          newCurrentIndex = Math.max(0, newCurrentIndex - 1);
          newErrors[newCurrentIndex] = false;
        }
      } else if (key.length === 1) {
        if (newCurrentIndex < prev.currentText.length) {
          newUserInput += key;
          const isCorrect = key === prev.currentText[newCurrentIndex];
          newErrors[newCurrentIndex] = !isCorrect;
          newCurrentIndex++;
        }
      }

      const isCompleted = newCurrentIndex === prev.currentText.length;
      const timeElapsed = prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0;
      const newStats = calculateStats(newUserInput, timeElapsed, newErrors);

      return {
        ...prev,
        userInput: newUserInput,
        currentIndex: newCurrentIndex,
        errors: newErrors,
        isCompleted,
        stats: newStats,
      };
    });
  }, [calculateStats]);

  const reset = useCallback((newText?: string) => {
    const textToUse = newText || state.currentText;
    setState({
      currentText: textToUse,
      userInput: '',
      currentIndex: 0,
      isStarted: false,
      isCompleted: false,
      errors: new Array(textToUse.length).fill(false),
      startTime: null,
      stats: initialStats,
    });
  }, [state.currentText]);

  return {
    ...state,
    handleKeyPress,
    reset,
  };
}