import Hangul from 'hangul-js';

/**
 * 한글 문자 분해/조합 유틸리티 함수들
 */

/**
 * 한글 문자를 자음과 모음으로 분해
 */
export function disassembleKorean(text: string): string[] {
  return Hangul.disassemble(text);
}

/**
 * 분해된 자음/모음을 다시 조합
 */
export function assembleKorean(components: string[]): string {
  return Hangul.assemble(components);
}

/**
 * 문자가 한글인지 확인
 */
export function isKorean(char: string): boolean {
  return Hangul.isHangul(char);
}

/**
 * 완성된 한글 문자인지 확인 (자음+모음 조합 완료)
 */
export function isCompleteKorean(char: string): boolean {
  return Hangul.isComplete(char);
}

/**
 * 한글 자음인지 확인
 */
export function isKoreanConsonant(char: string): boolean {
  return Hangul.isConsonant(char);
}

/**
 * 한글 모음인지 확인
 */
export function isKoreanVowel(char: string): boolean {
  return Hangul.isVowel(char);
}

/**
 * 한글 타이핑에서 현재 입력 중인 글자의 진행률 계산
 * 예: '한' -> 완성 (1.0), 'ㅎ' -> 1/3 진행 (0.33), 'ㅎㅏ' -> 2/3 진행 (0.67)
 */
export function getKoreanTypingProgress(targetChar: string, typedChars: string): number {
  if (!isKorean(targetChar)) return typedChars === targetChar ? 1 : 0;
  
  const targetComponents = disassembleKorean(targetChar);
  const typedComponents = disassembleKorean(typedChars);
  
  let matchCount = 0;
  for (let i = 0; i < Math.min(targetComponents.length, typedComponents.length); i++) {
    if (targetComponents[i] === typedComponents[i]) {
      matchCount++;
    } else {
      break; // 순서가 맞지 않으면 중단
    }
  }
  
  return matchCount / targetComponents.length;
}

/**
 * 한글 타이핑에서 부분 입력을 검증
 * 예: 목표 '한글' -> 현재 'ㅎ' (올바른 시작), 'ㅎㅏ' (올바른 진행), 'ㅎㅏㄴ' (완성)
 */
export function isValidKoreanPartialInput(targetChar: string, partialInput: string): boolean {
  if (!isKorean(targetChar)) return false;
  
  const targetComponents = disassembleKorean(targetChar);
  const inputComponents = disassembleKorean(partialInput);
  
  if (inputComponents.length > targetComponents.length) return false;
  
  for (let i = 0; i < inputComponents.length; i++) {
    if (targetComponents[i] !== inputComponents[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * 한글 문자열을 초성/중성/종성으로 분리하여 단계별 힌트 제공
 */
export function getKoreanHints(text: string): Array<{
  char: string;
  components: string[];
  steps: string[];
}> {
  return text.split('').map(char => {
    if (!isKorean(char)) {
      return {
        char,
        components: [char],
        steps: [char]
      };
    }
    
    const components = disassembleKorean(char);
    const steps: string[] = [];
    
    // 단계별로 조합해가며 힌트 생성
    for (let i = 1; i <= components.length; i++) {
      const step = assembleKorean(components.slice(0, i));
      steps.push(step);
    }
    
    return {
      char,
      components,
      steps
    };
  });
}

/**
 * 두 한글 문자의 유사도 계산 (0-1 범위)
 */
export function calculateKoreanSimilarity(char1: string, char2: string): number {
  if (char1 === char2) return 1;
  if (!isKorean(char1) || !isKorean(char2)) return 0;
  
  const components1 = disassembleKorean(char1);
  const components2 = disassembleKorean(char2);
  
  const maxLength = Math.max(components1.length, components2.length);
  let matchCount = 0;
  
  for (let i = 0; i < maxLength; i++) {
    if (components1[i] === components2[i]) {
      matchCount++;
    }
  }
  
  return matchCount / maxLength;
}

/**
 * 한글 문자열의 총 입력 단계 수 계산
 * 타이핑 연습에서 진행률 계산에 사용
 */
export function getTotalKoreanSteps(text: string): number {
  return text.split('').reduce((total, char) => {
    if (!isKorean(char)) return total + 1;
    return total + disassembleKorean(char).length;
  }, 0);
}

/**
 * 현재 입력 진행률을 백분율로 계산
 */
export function calculateTypingProgress(targetText: string, currentInput: string): number {
  const totalSteps = getTotalKoreanSteps(targetText);
  const currentSteps = getTotalKoreanSteps(currentInput);
  
  return Math.min((currentSteps / totalSteps) * 100, 100);
}