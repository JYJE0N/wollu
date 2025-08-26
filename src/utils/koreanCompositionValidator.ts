import { isKoreanSyllable } from './koreanStrokeCalculator';

/**
 * 한글 자모 조합 검증 유틸리티
 * iPad mini의 가상 키보드 한글 입력 문제 해결용
 */

// 한글 자모 유니코드 범위
const KOREAN_JAMO_RANGES = [
  { start: 0x3131, end: 0x314F }, // 호환 자모 (ㄱ-ㅣ)
  { start: 0x1100, end: 0x11FF }, // 첫소리 자모
  { start: 0x3130, end: 0x318F }, // 호환 자모 확장
  { start: 0xA960, end: 0xA97F }  // 자모 확장-A
];

/**
 * 한글 자모인지 확인
 */
export const isKoreanJamo = (char: string): boolean => {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  
  return KOREAN_JAMO_RANGES.some(range => 
    code >= range.start && code <= range.end
  );
};

/**
 * 불완전한 한글 자모인지 확인
 * 완성된 한글 문자가 아닌 조합 중인 자모들
 */
export const isIncompleteKoreanJamo = (input: string): boolean => {
  if (!input) return false;
  
  // 마지막 문자 확인
  const lastChar = input[input.length - 1];
  
  // 자모이면서 완성된 한글이 아닌 경우
  return isKoreanJamo(lastChar) && !isKoreanSyllable(lastChar);
};

/**
 * 완성된 한글 문자인지 확인
 */
export const isCompleteHangul = (char: string): boolean => {
  return isKoreanSyllable(char);
};

/**
 * 한글 조합이 완료되었는지 확인
 * iPad 가상 키보드에서 자모 조합 완료 대기용
 */
export const validateKoreanComposition = (input: string): boolean => {
  if (!input) return true;
  
  const lastChar = input[input.length - 1];
  
  // 한글 자모이면서 완성된 문자가 아닌 경우 - 조합 미완료
  if (isKoreanJamo(lastChar) && !isCompleteHangul(lastChar)) {
    return false;
  }
  
  return true;
};

/**
 * 한글 조합 상태 분석
 */
interface KoreanCompositionState {
  hasIncompleteJamo: boolean;
  incompleteJamoCount: number;
  lastChar: string;
  isWaitingForComposition: boolean;
  compositionLength: number;
}

export const analyzeKoreanComposition = (input: string): KoreanCompositionState => {
  if (!input) {
    return {
      hasIncompleteJamo: false,
      incompleteJamoCount: 0,
      lastChar: '',
      isWaitingForComposition: false,
      compositionLength: 0
    };
  }

  let incompleteCount = 0;
  let compositionLength = 0;
  const lastChar = input[input.length - 1];
  
  // 뒤에서부터 연속된 미완성 자모 확인
  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i];
    
    if (isKoreanJamo(char) && !isCompleteHangul(char)) {
      incompleteCount++;
      compositionLength++;
    } else {
      break;
    }
  }

  return {
    hasIncompleteJamo: incompleteCount > 0,
    incompleteJamoCount: incompleteCount,
    lastChar,
    isWaitingForComposition: incompleteCount > 0,
    compositionLength
  };
};

/**
 * 한글 조합 대기 시간 계산
 * 미완성 자모의 개수에 따라 대기 시간을 다르게 설정
 */
export const getCompositionWaitTime = (
  compositionState: KoreanCompositionState,
  isVirtualKeyboard: boolean = false
): number => {
  if (!compositionState.hasIncompleteJamo) {
    return 0;
  }

  // iPad 가상 키보드는 더 긴 대기 시간
  const baseWait = isVirtualKeyboard ? 150 : 50;
  
  // 미완성 자모 개수에 따라 대기 시간 증가
  const additionalWait = compositionState.incompleteJamoCount * 30;
  
  return baseWait + additionalWait;
};

/**
 * 한글 입력 처리 지연 여부 결정
 */
export const shouldDelayKoreanInput = (
  input: string,
  isIPadVirtualKeyboard: boolean = false
): { shouldDelay: boolean; waitTime: number; reason: string } => {
  if (!isIPadVirtualKeyboard) {
    return { shouldDelay: false, waitTime: 0, reason: 'Not iPad virtual keyboard' };
  }

  const compositionState = analyzeKoreanComposition(input);
  
  if (!compositionState.hasIncompleteJamo) {
    return { shouldDelay: false, waitTime: 0, reason: 'No incomplete jamo' };
  }

  const waitTime = getCompositionWaitTime(compositionState, true);
  
  return {
    shouldDelay: true,
    waitTime,
    reason: `Waiting for composition: ${compositionState.incompleteJamoCount} incomplete jamo`
  };
};

/**
 * 한글 조합 재시도 로직
 * 일정 시간 후에도 조합이 완료되지 않으면 강제 처리
 */
export class KoreanCompositionHandler {
  private pendingComposition: string = '';
  private compositionTimeout: NodeJS.Timeout | null = null;
  private onCompositionComplete: ((text: string) => void) | null = null;

  constructor(onComplete?: (text: string) => void) {
    this.onCompositionComplete = onComplete || null;
  }

  /**
   * 한글 입력 처리
   */
  handleInput(input: string, isIPadVirtualKeyboard: boolean = false): boolean {
    const delayInfo = shouldDelayKoreanInput(input, isIPadVirtualKeyboard);
    
    if (!delayInfo.shouldDelay) {
      // 즉시 처리
      this.completePendingComposition();
      this.processInput(input);
      return true;
    }

    // 조합 대기
    this.pendingComposition = input;
    this.scheduleCompositionCompletion(delayInfo.waitTime);
    return false; // 처리 지연됨
  }

  /**
   * 조합 완료 스케줄링
   */
  private scheduleCompositionCompletion(waitTime: number): void {
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
    }

    this.compositionTimeout = setTimeout(() => {
      this.completePendingComposition();
    }, waitTime);
  }

  /**
   * 대기 중인 조합 완료 처리
   */
  private completePendingComposition(): void {
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
      this.compositionTimeout = null;
    }

    if (this.pendingComposition) {
      this.processInput(this.pendingComposition);
      this.pendingComposition = '';
    }
  }

  /**
   * 실제 입력 처리
   */
  private processInput(input: string): void {
    if (this.onCompositionComplete) {
      this.onCompositionComplete(input);
    }
  }

  /**
   * 강제 조합 완료
   */
  forceComplete(): void {
    this.completePendingComposition();
  }

  /**
   * 정리
   */
  cleanup(): void {
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
      this.compositionTimeout = null;
    }
    this.pendingComposition = '';
  }
}