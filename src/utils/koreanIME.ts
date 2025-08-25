/**
 * Korean IME (Input Method Editor) utility functions
 * 한글 입력 처리를 위한 공통 유틸리티
 */

/**
 * Check if a character is Korean jamo (consonant/vowel components)
 * 한글 자모(자음/모음) 판별
 */
export function isKoreanJamo(char: string): boolean {
  if (!char || char.length !== 1) return false;

  const code = char.charCodeAt(0);
  return (
    (code >= 0x3131 && code <= 0x314f) || // 한글 호환 자모 (ㄱ-ㅎ, ㅏ-ㅣ)
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모 확장
    (code >= 0xa960 && code <= 0xa97f) // 한글 확장-A
  );
}

/**
 * Check if a character is completed Korean syllable
 * 완성된 한글 음절 판별 (가-힣)
 */
export function isCompletedKorean(char: string): boolean {
  if (!char || char.length !== 1) return false;

  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3; // 한글 음절 (가-힣)
}

/**
 * Check if text contains any Korean characters (jamo or completed)
 * 텍스트에 한글이 포함되어 있는지 확인
 */
export function containsKorean(text: string): boolean {
  if (!text) return false;

  for (const char of text) {
    if (isKoreanJamo(char) || isCompletedKorean(char)) {
      return true;
    }
  }
  return false;
}

/**
 * Filter out Korean jamo from text, keeping only completed characters
 * 한글 자모를 제거하고 완성된 문자만 남김
 */
export function filterKoreanJamo(text: string): string {
  if (!text) return "";

  return text
    .split("")
    .filter((char) => !isKoreanJamo(char))
    .join("");
}

/**
 * Korean syllable decomposition utility
 * 한글 음절 분해 유틸리티
 */
export interface KoreanJamoComponents {
  initial: string;   // 초성
  medial: string;    // 중성  
  final: string;     // 종성
  hasInitial: boolean;
  hasMedial: boolean;
  hasFinal: boolean;
}

/**
 * Decompose Korean syllable into jamo components
 * 한글 음절을 자모로 분해
 */
export function decomposeKorean(char: string): KoreanJamoComponents | null {
  if (!char || char.length !== 1 || !isCompletedKorean(char)) {
    return null;
  }

  const code = char.charCodeAt(0) - 0xac00;
  
  // 초성, 중성, 종성 인덱스 계산
  const initialIndex = Math.floor(code / 588); // 588 = 21 * 28
  const medialIndex = Math.floor((code % 588) / 28);
  const finalIndex = code % 28;

  // 자모 배열 (유니코드 순서)
  const initials = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  
  const medials = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
  ];
  
  const finals = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
    'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ',
    'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  return {
    initial: initials[initialIndex],
    medial: medials[medialIndex],
    final: finals[finalIndex],
    hasInitial: true, // 한글은 항상 초성이 있음
    hasMedial: true,  // 한글은 항상 중성이 있음
    hasFinal: finalIndex > 0
  };
}

/**
 * Browser-specific IME composition handling
 * 브라우저별 IME 조합 처리
 */
export interface IMECompositionState {
  isComposing: boolean;
  lastComposedText: string;
  processedChars: Set<string>;
}

export class IMEHandler {
  private state: IMECompositionState = {
    isComposing: false,
    lastComposedText: "",
    processedChars: new Set(),
  };

  startComposition(): void {
    this.state.isComposing = true;
    this.state.processedChars.clear();
  }

  updateComposition(text: string): void {
    this.state.lastComposedText = text;
  }

  endComposition(text: string): string[] {
    this.state.isComposing = false;

    // Get only new characters that haven't been processed
    const newChars: string[] = [];

    for (const char of text) {
      const charKey = `${char}-${Date.now()}`;
      if (!this.state.processedChars.has(charKey) && !isKoreanJamo(char)) {
        newChars.push(char);
        this.state.processedChars.add(charKey);
      }
    }

    // Clear after processing
    if (!this.state.isComposing) {
      this.state.lastComposedText = "";
      this.state.processedChars.clear();
    }

    return newChars;
  }

  isComposing(): boolean {
    return this.state.isComposing;
  }

  reset(): void {
    this.state = {
      isComposing: false,
      lastComposedText: "",
      processedChars: new Set(),
    };
  }
}

/**
 * Detect browser type for IME-specific handling
 * IME 처리를 위한 브라우저 타입 감지
 */
export function getBrowserType(): "chrome" | "firefox" | "safari" | "other" {
  // 서버 사이드 렌더링 중에는 'other'를 반환하도록 수정
  if (typeof navigator === "undefined") {
    return "other";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
    return "chrome";
  } else if (userAgent.includes("firefox")) {
    return "firefox";
  } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    return "safari";
  }

  return "other";
}

/**
 * Check if the browser properly supports CompositionEvent
 * CompositionEvent 지원 여부 확인
 */
export function supportsCompositionEvent(): boolean {
  return "CompositionEvent" in window;
}
