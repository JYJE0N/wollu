import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TypingState, Keystroke, Mistake, Language } from '@/types';

interface TypingStore extends TypingState {
  // Actions
  initialize: () => void;
  setText: (text: string) => void;
  setLanguage: (language: Language) => void;
  startTyping: () => void;
  pauseTyping: () => void;
  resumeTyping: () => void;
  completeTyping: () => void;
  resetTyping: () => void;
  
  // Keystroke handling
  addKeystroke: (keystroke: Keystroke) => void;
  addMistake: (mistake: Mistake) => void;
  updateInput: (input: string, position: number) => void;
  
  // Computed values
  getProgress: () => number;
  getDuration: () => number;
  isStarted: () => boolean;
}

const initialState: TypingState = {
  currentText: '',
  currentPosition: 0,
  userInput: '',
  mistakes: [],
  keystrokes: [],
  startTime: null,
  endTime: null,
  isActive: false,
  isPaused: false,
  isCompleted: false,
  language: 'ko',
};

export const useTypingStore = create<TypingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      initialize: () => {
        set(initialState, false, 'initialize');
      },
      
      setText: (text: string) => {
        set(
          (state) => ({
            ...state,
            currentText: text,
            currentPosition: 0,
            userInput: '',
            mistakes: [],
            keystrokes: [],
            isCompleted: false,
          }),
          false,
          'setText'
        );
      },
      
      setLanguage: (language: Language) => {
        set(
          (state) => ({ ...state, language }),
          false,
          'setLanguage'
        );
      },
      
      startTyping: () => {
        const now = Date.now();
        set(
          (state) => ({
            ...state,
            isActive: true,
            isPaused: false,
            startTime: state.startTime || now,
          }),
          false,
          'startTyping'
        );
      },
      
      pauseTyping: () => {
        set(
          (state) => ({
            ...state,
            isActive: false,
            isPaused: true,
          }),
          false,
          'pauseTyping'
        );
      },
      
      resumeTyping: () => {
        set(
          (state) => ({
            ...state,
            isActive: true,
            isPaused: false,
          }),
          false,
          'resumeTyping'
        );
      },
      
      completeTyping: () => {
        const now = Date.now();
        set(
          (state) => ({
            ...state,
            isActive: false,
            isPaused: false,
            isCompleted: true,
            endTime: now,
          }),
          false,
          'completeTyping'
        );
      },
      
      resetTyping: () => {
        set(
          (state) => ({
            ...initialState,
            currentText: state.currentText,
            language: state.language,
          }),
          false,
          'resetTyping'
        );
      },
      
      addKeystroke: (keystroke: Keystroke) => {
        set(
          (state) => ({
            ...state,
            keystrokes: [...state.keystrokes, keystroke],
          }),
          false,
          'addKeystroke'
        );
      },
      
      addMistake: (mistake: Mistake) => {
        set(
          (state) => ({
            ...state,
            mistakes: [...state.mistakes, mistake],
          }),
          false,
          'addMistake'
        );
      },
      
      updateInput: (input: string, position: number) => {
        set(
          (state) => ({
            ...state,
            userInput: input,
            currentPosition: position,
          }),
          false,
          'updateInput'
        );
        
        // 텍스트 완료 체크
        const { currentText } = get();
        if (position >= currentText.length) {
          get().completeTyping();
        }
      },
      
      // Computed values
      getProgress: () => {
        const { currentPosition, currentText } = get();
        return currentText.length > 0 ? (currentPosition / currentText.length) * 100 : 0;
      },
      
      getDuration: () => {
        const { startTime, endTime, isActive } = get();
        if (!startTime) return 0;
        
        const end = endTime || (isActive ? Date.now() : startTime);
        return Math.max(0, end - startTime);
      },
      
      isStarted: () => {
        const { startTime } = get();
        return startTime !== null;
      },
    }),
    {
      name: 'typing-store',
    }
  )
);