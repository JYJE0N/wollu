import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Hangul from 'hangul-js';
import { 
  analyzeKoreanInput, 
  analyzeTextInput, 
  calculateKoreanAccuracy, 
  calculateKoreanWPM,
  isSpaceCharacter,
  getKoreanCompositionState
} from '@/utils/enhancedKoreanUtils';

export interface EnhancedTypingStats {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeElapsed: number;
  componentAccuracy: number; // 자소 단위 정확도
}

export interface CharacterState {
  targetChar: string;
  currentInput: string;
  isComplete: boolean;
  isCorrect: boolean;
  progress: number;
  status: 'correct' | 'incorrect' | 'current' | 'pending';
  expectedNext?: string;
}

export interface EnhancedTypingState {
  // 현재 세션 상태
  currentText: string;
  userInput: string;
  currentIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  stats: EnhancedTypingStats;
  characterStates: CharacterState[];
  
  // 한글 특화 상태
  currentComposition: string; // 현재 조합 중인 문자
  isComposing: boolean; // IME 조합 상태
  
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
  handleComposition: (compositionData: string) => void;
  resetSession: (newText?: string) => void;
  setPracticeMode: (mode: 'sentence' | 'words') => void;
  updateStats: () => void;
  completeSession: () => void;
}

const initialStats: EnhancedTypingStats = {
  wpm: 0,
  accuracy: 0,
  totalCharacters: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  timeElapsed: 0,
  componentAccuracy: 0,
};

export const useEnhancedTypingStore = create<EnhancedTypingState>()(
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
      currentComposition: '',
      isComposing: false,
      practiceMode: 'sentence',
      totalSessions: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTimeSpent: 0,

      setCurrentText: (text: string) =>
        set(() => {
          const characterStates = analyzeTextInput(text, '', 0);
          return {
            currentText: text,
            userInput: '',
            currentIndex: 0,
            isStarted: false,
            isCompleted: false,
            startTime: null,
            stats: initialStats,
            characterStates,
            currentComposition: '',
            isComposing: false,
          };
        }),

      handleComposition: (compositionData: string) =>
        set((state) => ({
          ...state,
          currentComposition: compositionData,
          isComposing: compositionData.length > 0,
        })),

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
              // 한글 조합 중인 경우 처리
              const composition = getKoreanCompositionState(newUserInput);
              
              if (composition && !composition.isComplete && composition.components.length > 1) {
                // 한글 조합 중이면 한 자소씩 제거
                const newComponents = composition.components.slice(0, -1);
                const newChar = Hangul.assemble(newComponents);
                newUserInput = newUserInput.slice(0, -1) + newChar;
              } else {
                // 일반적인 백스페이스
                newUserInput = newUserInput.slice(0, -1);
                newCurrentIndex = Math.max(0, newCurrentIndex - 1);
              }
            }
          } else if (key.length === 1) {
            // 일반 문자 입력
            if (newCurrentIndex < state.currentText.length) {
              newUserInput += key;
              
              // 현재 문자와 입력 비교
              const targetChar = state.currentText[newCurrentIndex];
              const analysis = analyzeKoreanInput(targetChar, key);
              
              // 완전한 문자가 입력되었거나 공백/특수문자인 경우 인덱스 증가
              if (analysis.isComplete || !Hangul.isHangul(targetChar)) {
                newCurrentIndex++;
              }
            }
          }

          // 완료 여부 확인
          const isCompleted = newCurrentIndex >= state.currentText.length && 
                             newUserInput.length >= state.currentText.length;
          
          // 문자 상태 분석
          const characterStates = analyzeTextInput(state.currentText, newUserInput, newCurrentIndex);

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
          
          // 정확도 계산 (한글 특성 반영)
          const accuracy = calculateKoreanAccuracy(state.currentText, state.userInput);
          const componentAccuracy = accuracy; // 자소 단위 정확도와 동일
          
          // 정확한 문자 수 계산
          let correctCharacters = 0;
          for (let i = 0; i < Math.min(state.userInput.length, state.currentText.length); i++) {
            if (state.userInput[i] === state.currentText[i]) {
              correctCharacters++;
            }
          }
          
          const incorrectCharacters = totalCharacters - correctCharacters;
          const timeInMinutes = timeElapsed / 60;
          const wpm = calculateKoreanWPM(correctCharacters, timeInMinutes);

          return {
            ...state,
            stats: {
              wpm,
              accuracy,
              componentAccuracy,
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
          const characterStates = analyzeTextInput(textToUse, '', 0);
          
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
            currentComposition: '',
            isComposing: false,
          };
        }),

      setPracticeMode: (mode: 'sentence' | 'words') =>
        set(() => ({ practiceMode: mode })),
    }),
    {
      name: 'enhanced-typing-store',
    }
  )
);