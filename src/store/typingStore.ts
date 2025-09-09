import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TypingStats as DomainTypingStats } from '@/domain/valueObjects/TypingStats';

export interface TypingStats {
  cpm: number;  // Characters Per Minute
  wpm: number;  // Words Per Minute
  accuracy: number;  // 입력한 글자 중 정확한 비율
  completionRate: number;  // 전체 텍스트 중 완료한 비율
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeElapsed: number;
}

export interface TypingState {
  // 현재 세션 상태
  currentText: string;
  userInput: string;
  currentIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  errors: boolean[];
  startTime: number | null;
  stats: TypingStats;
  
  // 설정
  practiceMode: 'sentence' | 'words';
  
  // 전체 통계
  totalSessions: number;
  bestCpm: number;
  bestWpm: number;
  bestAccuracy: number;
  totalTimeSpent: number;
  
  // 액션
  setCurrentText: (text: string) => void;
  handleKeyPress: (key: string) => void;
  resetSession: (newText?: string) => void;
  setPracticeMode: (mode: 'sentence' | 'words') => void;
  startTyping: () => void;
  updateStats: () => void;
  completeSession: () => void;
}

const initialStats: TypingStats = {
  cpm: 0,
  wpm: 0,
  accuracy: 0,
  completionRate: 0,
  totalCharacters: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  timeElapsed: 0,
};

export const useTypingStore = create<TypingState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      currentText: '',
      userInput: '',
      currentIndex: 0,
      isStarted: false,
      isCompleted: false,
      errors: [],
      startTime: null,
      stats: initialStats,
      practiceMode: 'sentence',
      totalSessions: 0,
      bestCpm: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTimeSpent: 0,

      // 액션들
      setCurrentText: (text: string) =>
        set((state) => ({
          currentText: text,
          userInput: '',
          currentIndex: 0,
          isStarted: false,
          isCompleted: false,
          errors: new Array(text.length).fill(false),
          startTime: null,
          stats: initialStats,
        })),

      handleKeyPress: (key: string) =>
        set((state) => {
          if (state.isCompleted) return state;

          let newUserInput = state.userInput;
          let newCurrentIndex = state.currentIndex;
          const newErrors = [...state.errors];
          let newStartTime = state.startTime;
          let newIsStarted = state.isStarted;

          // 첫 입력 시 타이머 시작
          if (!newIsStarted) {
            newIsStarted = true;
            newStartTime = Date.now();
          }

          if (key === 'Backspace') {
            if (newUserInput.length > 0) {
              newUserInput = newUserInput.slice(0, -1);
              newCurrentIndex = Math.max(0, newCurrentIndex - 1);
              newErrors[newCurrentIndex] = false;
            }
          } else if (key.length === 1) {
            if (newCurrentIndex < state.currentText.length) {
              newUserInput += key;
              const isCorrect = key === state.currentText[newCurrentIndex];
              newErrors[newCurrentIndex] = !isCorrect;
              newCurrentIndex++;
            }
          }

          const isCompleted = newCurrentIndex === state.currentText.length;
          
          return {
            ...state,
            userInput: newUserInput,
            currentIndex: newCurrentIndex,
            errors: newErrors,
            isStarted: newIsStarted,
            startTime: newStartTime,
            isCompleted,
          };
        }),

      updateStats: () =>
        set((state) => {
          if (!state.startTime || !state.isStarted) return state;

          const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
          
          // 도메인 TypingStats를 사용하여 계산
          const domainStats = DomainTypingStats.calculate(
            state.currentText,
            state.userInput,
            timeElapsed
          );

          const incorrectCharacters = domainStats.totalChars - domainStats.correctChars;

          return {
            ...state,
            stats: {
              cpm: domainStats.cpm,
              wpm: domainStats.wpm,
              accuracy: Math.round(domainStats.accuracy * 100) / 100,
              completionRate: Math.round(domainStats.completionRate * 100) / 100,
              totalCharacters: domainStats.totalChars,
              correctCharacters: domainStats.correctChars,
              incorrectCharacters,
              timeElapsed: domainStats.timeElapsed,
            },
          };
        }),

      completeSession: () =>
        set((state) => {
          const newBestCpm = Math.max(state.bestCpm, state.stats.cpm);
          const newBestWpm = Math.max(state.bestWpm, state.stats.wpm);
          const newBestAccuracy = Math.max(state.bestAccuracy, state.stats.accuracy);
          
          return {
            ...state,
            totalSessions: state.totalSessions + 1,
            bestCpm: newBestCpm,
            bestWpm: newBestWpm,
            bestAccuracy: newBestAccuracy,
            totalTimeSpent: state.totalTimeSpent + state.stats.timeElapsed,
          };
        }),

      resetSession: (newText?: string) =>
        set((state) => {
          const textToUse = newText || state.currentText;
          return {
            ...state,
            currentText: textToUse,
            userInput: '',
            currentIndex: 0,
            isStarted: false,
            isCompleted: false,
            errors: new Array(textToUse.length).fill(false),
            startTime: null,
            stats: initialStats,
          };
        }),

      setPracticeMode: (mode: 'sentence' | 'words') =>
        set(() => ({ practiceMode: mode })),

      startTyping: () =>
        set((state) => ({
          ...state,
          isStarted: true,
          startTime: Date.now(),
        })),
    }),
    {
      name: 'typing-store',
    }
  )
);