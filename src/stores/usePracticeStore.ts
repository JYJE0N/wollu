import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { PracticeSettings, Language, Theme, Difficulty } from '@/types';

interface PracticeStore extends PracticeSettings {
  // Actions
  updateSettings: (settings: Partial<PracticeSettings>) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setWordSettings: (count: number, difficulty: Difficulty, category: string) => void;
  setSentenceSettings: (count: number, length: 'short' | 'medium' | 'long', type: string) => void;
  toggleKeyboard: () => void;
  toggleSound: () => void;
  toggleStrictMode: () => void;
  resetToDefaults: () => void;
}

const defaultSettings: PracticeSettings = {
  language: 'ko',
  theme: 'light',
  wordCount: 10,
  wordDifficulty: 'easy',
  wordCategory: 'daily',
  sentenceCount: 3,
  sentenceLength: 'medium',
  sentenceType: 'general',
  showKeyboard: false,
  soundEnabled: true,
  strictMode: false,
};

export const usePracticeStore = create<PracticeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultSettings,
        
        updateSettings: (settings: Partial<PracticeSettings>) => {
          set(
            (state) => ({ ...state, ...settings }),
            false,
            'updateSettings'
          );
        },
        
        setLanguage: (language: Language) => {
          set(
            (state) => ({ ...state, language }),
            false,
            'setLanguage'
          );
        },
        
        setTheme: (theme: Theme) => {
          set(
            (state) => ({ ...state, theme }),
            false,
            'setTheme'
          );
          
          // DOM에 테마 클래스 적용
          if (typeof document !== 'undefined') {
            document.documentElement.className = theme;
          }
        },
        
        setWordSettings: (count: number, difficulty: Difficulty, category: string) => {
          set(
            (state) => ({
              ...state,
              wordCount: count,
              wordDifficulty: difficulty,
              wordCategory: category,
            }),
            false,
            'setWordSettings'
          );
        },
        
        setSentenceSettings: (count: number, length: 'short' | 'medium' | 'long', type: string) => {
          set(
            (state) => ({
              ...state,
              sentenceCount: count,
              sentenceLength: length,
              sentenceType: type,
            }),
            false,
            'setSentenceSettings'
          );
        },
        
        toggleKeyboard: () => {
          set(
            (state) => ({ ...state, showKeyboard: !state.showKeyboard }),
            false,
            'toggleKeyboard'
          );
        },
        
        toggleSound: () => {
          set(
            (state) => ({ ...state, soundEnabled: !state.soundEnabled }),
            false,
            'toggleSound'
          );
        },
        
        toggleStrictMode: () => {
          set(
            (state) => ({ ...state, strictMode: !state.strictMode }),
            false,
            'toggleStrictMode'
          );
        },
        
        resetToDefaults: () => {
          set(defaultSettings, false, 'resetToDefaults');
          
          // 테마도 기본값으로 초기화
          if (typeof document !== 'undefined') {
            document.documentElement.className = defaultSettings.theme;
          }
        },
      }),
      {
        name: 'practice-settings',
        // 테마 변경 시 즉시 DOM 반영을 위한 onRehydrateStorage
        onRehydrateStorage: () => (state) => {
          if (state?.theme && typeof document !== 'undefined') {
            document.documentElement.className = state.theme;
          }
        },
      }
    ),
    {
      name: 'practice-store',
    }
  )
);