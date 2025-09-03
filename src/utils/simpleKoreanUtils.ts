/**
 * 간소화된 한글 처리 유틸리티
 * 초성, 중성, 종성 구조를 반영한 기본적인 타이핑 검증
 */

// Hangul-js 없이 기본 한글 처리
export function isKoreanCharacter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0xAC00 && code <= 0xD7A3) || // 완성형 한글
         (code >= 0x3131 && code <= 0x318E);   // 한글 자모
}

export function isSpaceCharacter(char: string): boolean {
  return char === ' ' || char === '\u00A0';
}

export interface SimpleKoreanInputState {
  targetChar: string;
  currentInput: string;
  isComplete: boolean;
  isCorrect: boolean;
  status: 'correct' | 'incorrect' | 'current' | 'pending';
}

/**
 * 간단한 문자 비교 (띄어쓰기 포함)
 */
export function analyzeSimpleInput(targetChar: string, userInput: string, index: number): SimpleKoreanInputState {
  const userChar = index < userInput.length ? userInput[index] : '';
  
  if (index < userInput.length) {
    // 이미 입력된 문자
    const isCorrect = targetChar === userChar;
    return {
      targetChar,
      currentInput: userChar,
      isComplete: true,
      isCorrect,
      status: isCorrect ? 'correct' : 'incorrect'
    };
  } else if (index === userInput.length) {
    // 현재 입력할 문자
    return {
      targetChar,
      currentInput: '',
      isComplete: false,
      isCorrect: true,
      status: 'current'
    };
  } else {
    // 아직 입력하지 않은 문자
    return {
      targetChar,
      currentInput: '',
      isComplete: false,
      isCorrect: true,
      status: 'pending'
    };
  }
}

/**
 * 전체 텍스트 분석
 */
export function analyzeFullText(targetText: string, userInput: string): SimpleKoreanInputState[] {
  const results = [];
  
  for (let i = 0; i < targetText.length; i++) {
    const analysis = analyzeSimpleInput(targetText[i], userInput, i);
    results.push(analysis);
  }
  
  return results;
}

/**
 * 정확도 계산
 */
export function calculateSimpleAccuracy(targetText: string, userInput: string): number {
  if (userInput.length === 0) return 0;
  
  let correct = 0;
  const minLength = Math.min(targetText.length, userInput.length);
  
  for (let i = 0; i < minLength; i++) {
    if (targetText[i] === userInput[i]) {
      correct++;
    }
  }
  
  return (correct / minLength) * 100;
}

/**
 * WPM 계산
 */
export function calculateSimpleWPM(correctCharacters: number, timeInMinutes: number): number {
  if (timeInMinutes <= 0) return 0;
  
  // 한글의 경우 한 글자당 가중치 적용
  const weightedCharacters = correctCharacters * 1.5; // 한글 가중치
  return Math.round(weightedCharacters / timeInMinutes);
}

/**
 * 힌트 생성
 */
export function generateSimpleHint(targetChar: string): string {
  if (isSpaceCharacter(targetChar)) {
    return '스페이스바를 누르세요';
  }
  
  if (isKoreanCharacter(targetChar)) {
    return `'${targetChar}' 문자를 입력하세요`;
  }
  
  return `'${targetChar}' 키를 누르세요`;
}