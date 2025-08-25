// 언어팩 인터페이스
export interface LanguagePack {
  id: string;
  name: string;
  font: string;
  wordLists: {
    plain: string[];         // 순수 단어 리스트 (구두점, 숫자 제외)
  };
  sentences: {
    short: {
      plain: string[];       // 단문 - 일반
      punctuation: string[]; // 단문 - 구두점
      numbers: string[];     // 단문 - 숫자
      mixed: string[];       // 단문 - 혼합
    };
    medium: {
      plain: string[];       // 중문 - 일반
      punctuation: string[]; // 중문 - 구두점
      numbers: string[];     // 중문 - 숫자
      mixed: string[];       // 중문 - 혼합
    };
    long: {
      plain: string[];       // 장문 - 일반
      punctuation: string[]; // 장문 - 구두점
      numbers: string[];     // 장문 - 숫자
      mixed: string[];       // 장문 - 혼합
    };
  };
  // 레거시 호환용 (제거 예정)
  shortSentences?: string[];
  mediumSentences?: string[];
  longSentences?: string[];
}

// 테마 인터페이스
export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    correct: string;         // 올바른 타이핑 색상
    incorrect: string;       // 오타 색상
    current: string;         // 현재 문자 커서
    accent: string;
  };
}

// 키스트로크 데이터
export interface Keystroke {
  key: string;
  timestamp: number;
  correct: boolean;
  timeDelta: number;        // 이전 키 입력과의 시간차
}

// 실수 데이터
export interface Mistake {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
}

// 테스트 모드
export type TestMode = 'words' | 'sentences';

// 단어 모드용 스타일 (순수 단어만)
export type WordStyle = 'plain';

// 문장 모드용 스타일
export type SentenceStyle = 'plain' | 'punctuation' | 'numbers' | 'mixed';

// 문장 길이
export type SentenceLength = 'short' | 'medium' | 'long';

// 레거시 텍스트 타입 (호환성 유지)
export type TextType = 'words' | 'punctuation' | 'numbers' | 'sentences' | 'short-sentences' | 'medium-sentences' | 'long-sentences';

// 디바이스 타입
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 언어 타입
export type Language = 'korean' | 'english';

// 사용자 진행 데이터 타입
export interface TestRecord {
  id: string;
  cpm: number;
  wpm: number;
  accuracy: number;
  consistency?: number;
  testTime: number;
  completedAt: Date;
  language: Language;
  textType: TextType;
  testMode: TestMode;
  mistakeCount: number;
  totalCharacters: number;
}

export interface WeakCharacter {
  char: string;
  errorCount: number;
  totalCount: number;
  errorRate: number;
  lastSeen: Date;
}

export interface MistakePattern {
  intended: string;
  typed: string;
  count: number;
  lastOccurrence: Date;
}

// 타이핑 세션 데이터
export interface TypingSession {
  id: string;
  language: string;
  mode: TestMode;           // 시간 기반 vs 단어 수 기반
  target: number;           // 목표 (초 또는 단어 수)
  textType: TextType;
  device: DeviceType;
  
  // 결과 데이터
  wpm: number;              // Words Per Minute
  rawWpm: number;           // 오타 포함 WPM
  cpm: number;              // Characters Per Minute (분당 타수)
  rawCpm: number;           // 오타 포함 CPM
  accuracy: number;         // 정확도 (%)
  consistency: number;      // 일관성 점수
  
  keystrokes: Keystroke[];
  mistakes: Mistake[];
  
  // 텍스트 정보
  targetText?: string;      // 테스트 대상 텍스트
  userInput?: string;       // 사용자 입력 텍스트
  
  // 시간 정보
  startTime?: Date;
  endTime?: Date;
  duration?: number;        // 실제 소요 시간 (ms)
}

// 타이핑 상태
export interface TypingState {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentIndex: number;
  targetText: string;
  userInput: string;
  startTime: Date | null;
  endTime: Date | null;
}

// 실시간 통계
export interface LiveStats {
  wpm: number;
  rawWpm: number;
  cpm: number;              // Characters Per Minute (분당 타수/스트로크)
  rawCpm: number;           // 오타 포함 CPM
  accuracy: number;
  consistency: number;
  timeElapsed: number;      // 경과 시간 (초)
  charactersTyped: number;
  errorsCount: number;
  
  // 한글 특화 통계 (선택적)
  koreanStrokes?: number;   // 한글 조합 스트로크 수
  isKoreanText?: boolean;   // 한글 텍스트 여부
}

// 설정 인터페이스
export interface Settings {
  language: string;
  theme: string;
  testMode: TestMode;
  testTarget: number;       // 시간(초) 또는 단어 수
  textType: TextType;
  soundEnabled: boolean;
  showKeyboard: boolean;
  fontSize: number;
}

// 키보드 레이아웃
export interface KeyboardLayout {
  id: string;
  name: string;
  language: string;
  keys: KeyDefinition[][];
}

export interface KeyDefinition {
  key: string;
  display: string;
  width?: number;           // 키 너비 (기본값: 1)
  type?: 'normal' | 'space' | 'modifier';
}

// 문장 카테고리
export type SentenceCategory = 
  | 'classic-literature'     // 고전 문학
  | 'philosophy'            // 철학
  | 'science'              // 과학
  | 'history'              // 역사
  | 'news'                 // 뉴스/시사
  | 'poetry'               // 시
  | 'technical'            // 기술/IT
  | 'business'             // 비즈니스
  | 'everyday'             // 일상 회화
  | 'academic'             // 학술
  | 'quotes'               // 명언/격언
  | 'proverbs'             // 속담
  | 'learning'             // 학습
  | 'relationships'        // 인간관계
  | 'nature'               // 자연
  | 'literature'           // 문학
  | 'growth'               // 성장
  | 'practice'             // 연습
  | 'travel'               // 여행
  | 'health'               // 건강
  | 'innovation'           // 혁신
  | 'environment'          // 환경
  | 'technology';          // 기술

// 문장 난이도
export type SentenceDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// 문장 데이터
export interface Sentence {
  id: string;
  text: string;
  category: SentenceCategory;
  difficulty: SentenceDifficulty;
  language: string;
  sourceId: string;         // ContentSource 참조
  tags?: string[];          // 추가 태그 (예: '구두점많음', '긴문장', '숫자포함')
  metadata?: {
    wordCount: number;
    characterCount: number;
    avgWordLength: number;
    punctuationCount: number;
    numberCount: number;
    estimatedWPM: number;   // 예상 평균 WPM
  };
}

// 문장 컬렉션 (여러 문장을 그룹화)
export interface SentenceCollection {
  id: string;
  name: string;
  description: string;
  category: SentenceCategory;
  difficulty: SentenceDifficulty;
  language: string;
  sentences: string[];      // Sentence ID 리스트
  sourceId: string;
  isDefault: boolean;       // 기본 컬렉션 여부
  tags?: string[];
  metadata: {
    totalSentences: number;
    avgWordLength: number;
    avgSentenceLength: number;
    estimatedTime: number;  // 예상 완료 시간 (분)
  };
}

// 콘텐츠 소스 (저작권 추적용)
export interface ContentSource {
  id: string;
  name: string;
  license: 'public-domain' | 'cc0' | 'mit' | 'original';
  source?: string;          // 원본 소스 URL
  attribution?: string;     // 저작자 표시
  year?: number;           // 출간/작성 연도
  author?: string;         // 저자
  description?: string;    // 설명
}

// 성능 메트릭
export interface PerformanceMetrics {
  inputLatency: number;     // 입력 지연시간 (ms)
  renderTime: number;       // 렌더링 시간 (ms)
  memoryUsage: number;      // 메모리 사용량 (MB)
}