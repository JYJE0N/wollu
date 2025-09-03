import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface TypingStats {
  wpm: number;
  accuracy: number;
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
  wpm: 0,
  accuracy: 0,
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
          const totalCharacters = state.userInput.length;
          const correctCharacters = state.userInput
            .split('')
            .filter((_, index) => !state.errors[index]).length;
          const incorrectCharacters = totalCharacters - correctCharacters;
          const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
          const timeInMinutes = timeElapsed / 60;
          const wpm = timeInMinutes > 0 ? Math.round(correctCharacters / timeInMinutes) : 0;

          return {
            ...state,
            stats: {
              wpm,
              accuracy: Math.round(accuracy * 100) / 100,
              totalCharacters,
              correctCharacters,
              incorrectCharacters,
              timeElapsed,
            },
          };
        }),

      completeSession: () =>
        set((state) => {
          const newBestWpm = Math.max(state.bestWpm, state.stats.wpm);
          const newBestAccuracy = Math.max(state.bestAccuracy, state.stats.accuracy);
          
          return {
            ...state,
            totalSessions: state.totalSessions + 1,
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