import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  analyzeFullText, 
  calculateSimpleAccuracy, 
  calculateSimpleWPM,
  SimpleKoreanInputState
} from '@/utils/simpleKoreanUtils';

export interface SimpleTypingStats {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeElapsed: number;
}

export interface SimpleTypingState {
  // 현재 세션 상태
  currentText: string;
  userInput: string;
  currentIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  stats: SimpleTypingStats;
  characterStates: SimpleKoreanInputState[];
  
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
  updateStats: () => void;
  completeSession: () => void;
}

const initialStats: SimpleTypingStats = {
  wpm: 0,
  accuracy: 0,
  totalCharacters: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  timeElapsed: 0,
};

export const useSimpleTypingStore = create<SimpleTypingState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      currentText: '',
      userInput: '',
      currentIndex: 0,
      isStarted: false,
      isCompleted: false,
      startTime: null,
      stats: initialStats,
      characterStates: [],
      practiceMode: 'sentence',
      totalSessions: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTimeSpent: 0,

      setCurrentText: (text: string) =>
        set(() => {
          const characterStates = analyzeFullText(text, '');
          return {
            currentText: text,
            userInput: '',
            currentIndex: 0,
            isStarted: false,
            isCompleted: false,
            startTime: null,
            stats: initialStats,
            characterStates,
          };
        }),

      handleKeyPress: (key: string) =>
        set((state) => {
          if (state.isCompleted) return state;

          let newUserInput = state.userInput;
          let newCurrentIndex = state.currentIndex;
          let newIsStarted = state.isStarted;
          let newStartTime = state.startTime;

          // 첫 입력 시 타이머 시작
          if (!newIsStarted && key !== 'Backspace') {
            newIsStarted = true;
            newStartTime = Date.now();
          }

          if (key === 'Backspace') {
            if (newUserInput.length > 0) {
              newUserInput = newUserInput.slice(0, -1);
              newCurrentIndex = newUserInput.length;
            }
          } else if (key.length === 1) {
            if (newCurrentIndex < state.currentText.length) {
              newUserInput += key;
              newCurrentIndex = newUserInput.length;
            }
          }

          // 완료 여부 확인
          const isCompleted = newCurrentIndex >= state.currentText.length && 
                             newUserInput.length >= state.currentText.length;
          
          // 문자 상태 분석
          const characterStates = analyzeFullText(state.currentText, newUserInput);

          return {
            ...state,
            userInput: newUserInput,
            currentIndex: newCurrentIndex,
            isStarted: newIsStarted,
            startTime: newStartTime,
            isCompleted,
            characterStates,
          };
        }),

      updateStats: () =>
        set((state) => {
          if (!state.startTime || !state.isStarted) return state;

          const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const totalCharacters = Math.min(state.userInput.length, state.currentText.length);
          
          // 정확도 계산
          const accuracy = calculateSimpleAccuracy(state.currentText, state.userInput);
          
          // 정확한 문자 수 계산
          let correctCharacters = 0;
          for (let i = 0; i < Math.min(state.userInput.length, state.currentText.length); i++) {
            if (state.userInput[i] === state.currentText[i]) {
              correctCharacters++;
            }
          }
          
          const incorrectCharacters = totalCharacters - correctCharacters;
          const timeInMinutes = timeElapsed / 60;
          const wpm = calculateSimpleWPM(correctCharacters, timeInMinutes);

          return {
            ...state,
            stats: {
              wpm,
              accuracy,
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
          const characterStates = analyzeFullText(textToUse, '');
          
          return {
            ...state,
            currentText: textToUse,
            userInput: '',
            currentIndex: 0,
            isStarted: false,
            isCompleted: false,
            startTime: null,
            stats: initialStats,
            characterStates,
          };
        }),

      setPracticeMode: (mode: 'sentence' | 'words') =>
        set(() => ({ practiceMode: mode })),
    }),
    {
      name: 'simple-typing-store',
    }
  )
);