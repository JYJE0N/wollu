// 언어 타입
export type Language = 'ko' | 'en';

// 난이도 타입
export type Difficulty = 'easy' | 'medium' | 'hard';

// 테마 타입
export type Theme = 'light' | 'dark' | 'neon';

// 티어 레벨 타입
export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

// 텍스트 모듈 타입
export interface TextModule {
  id: string;
  name: string;
  description: string;
  language: Language;
  type: 'words' | 'sentences';
  category: string;
  difficulty: Difficulty;
  tags: string[];
  version: string;
  source: 'original' | 'public_domain' | 'inspired';
  metadata: ModuleMetadata;
  content: ModuleContent;
}

export interface ModuleMetadata {
  author?: string;
  createdAt: string;
  updatedAt: string;
  characterCount: number;
  wordCount: number;
  averageWordLength: number;
  specialCharacters: string[];
}

export interface ModuleContent {
  texts: string[];
  weights?: number[];
  context?: string[];
}

// 타자연습 관련 타입
export interface TypingState {
  currentText: string;
  currentPosition: number;
  userInput: string;
  mistakes: Mistake[];
  keystrokes: Keystroke[];
  startTime: number | null;
  endTime: number | null;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  language: Language;
}

export interface Mistake {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
}

export interface Keystroke {
  key: string;
  timestamp: number;
  isCorrect: boolean;
  position: number;
  language: Language;
}

// 통계 관련 타입
export interface TypingStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  consistency: number;
  errorRate: number;
  duration: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  mistakeCount: number;
}

export interface DetailedStats extends TypingStats {
  characterAccuracy: Record<string, number>;
  speedProgress: { timestamp: number; wpm: number }[];
  mistakeAnalysis: MistakeAnalysis;
  difficultyScore: number;
}

export interface MistakeAnalysis {
  mostCommonMistakes: Array<{
    character: string;
    count: number;
    accuracy: number;
  }>;
  mistakePattern: string;
  improvementSuggestions: string[];
}

// 연습 설정 관련 타입
export interface PracticeSettings {
  language: Language;
  theme: Theme;
  wordCount: number;
  wordDifficulty: Difficulty;
  wordCategory: string;
  sentenceCount: number;
  sentenceLength: 'short' | 'medium' | 'long';
  sentenceType: string;
  showKeyboard: boolean;
  soundEnabled: boolean;
  strictMode: boolean;
}

// 티어 시스템 관련 타입
export interface TierRequirement {
  minWpm: number;
  minAccuracy: number;
  consecutiveSuccesses: number;
  specialRequirements?: string[];
}

export interface TierAttempt {
  id: string;
  targetTier: TierLevel;
  stats: TypingStats;
  success: boolean;
  timestamp: number;
  textId: string;
  duration: number;
}

export interface PromotionEvaluation {
  eligible: boolean;
  currentProgress: {
    wpm: boolean;
    accuracy: boolean;
    consecutiveSuccesses: boolean;
    specialRequirements: boolean;
  };
  remainingRequirements: string[];
  nextAttemptRecommendation: string;
}

// 사용자 관련 타입
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  currentTier: TierLevel;
  tierPoints: number;
  preferredLanguage: Language;
  joinedAt: string;
  lastActiveAt: string;
  statistics: UserStatistics;
  settings: PracticeSettings;
}

export interface UserStatistics {
  totalTests: number;
  totalTime: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  streak: number;
  longestStreak: number;
  tierHistory: TierAttempt[];
}

// 키보드 숏컷 관련 타입
export interface KeyBinding {
  key: string;
  modifiers: string[];
  action: string;
  description: string;
  scope: 'global' | 'practice' | 'results';
}

export interface ShortcutAction {
  id: string;
  handler: () => void;
  description: string;
  enabled: boolean;
}

// IME 관련 타입
export interface IMEState {
  isComposing: boolean;
  compositionText: string;
  lastCompositionEnd: number;
  language: Language;
}

// 이벤트 관련 타입
export interface TypingEvent {
  type: 'start' | 'pause' | 'resume' | 'complete' | 'mistake' | 'keystroke';
  timestamp: number;
  data?: any;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 데이터베이스 모델 타입 (Prisma와 호환)
export interface User {
  id: string;
  email?: string;
  name?: string;
  currentTier: TierLevel;
  tierPoints: number;
  preferredLanguage: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface Practice {
  id: string;
  userId: string;
  textId: string;
  textContent: string;
  wpm: number;
  accuracy: number;
  errors: Mistake[];
  keystrokes: Keystroke[];
  duration: number;
  completedAt: Date;
  language: Language;
}