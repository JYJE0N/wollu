import Hangul from 'hangul-js';

/**
 * 향상된 한글 처리 유틸리티
 * 초성, 중성, 종성 구조를 반영한 정확한 타이핑 검증
 */

export interface KoreanInputState {
  targetChar: string;
  currentInput: string;
  isComplete: boolean;
  isCorrect: boolean;
  progress: number; // 0-1 범위의 진행률
  expectedNext: string; // 다음에 입력해야 할 문자
}

/**
 * 한글 문자의 입력 상태 분석
 */
export function analyzeKoreanInput(targetChar: string, currentInput: string): KoreanInputState {
  // 영문, 숫자, 특수문자 처리
  if (!Hangul.isHangul(targetChar)) {
    const isCorrect = currentInput === targetChar;
    return {
      targetChar,
      currentInput,
      isComplete: isCorrect,
      isCorrect,
      progress: isCorrect ? 1 : 0,
      expectedNext: isCorrect ? '' : targetChar
    };
  }

  // 한글 문자 처리
  const targetComponents = Hangul.disassemble(targetChar);
  const inputComponents = Hangul.disassemble(currentInput);
  
  let isCorrect = true;
  let matchCount = 0;
  
  // 입력된 자소들이 목표와 일치하는지 확인
  for (let i = 0; i < inputComponents.length; i++) {
    if (i >= targetComponents.length || targetComponents[i] !== inputComponents[i]) {
      isCorrect = false;
      break;
    }
    matchCount++;
  }
  
  // 완성 여부 확인
  const isComplete = matchCount === targetComponents.length && currentInput === targetChar;
  
  // 진행률 계산
  const progress = isCorrect ? matchCount / targetComponents.length : 0;
  
  // 다음 예상 입력 계산
  let expectedNext = '';
  if (isCorrect && !isComplete && matchCount < targetComponents.length) {
    expectedNext = targetComponents[matchCount];
  }
  
  return {
    targetChar,
    currentInput,
    isComplete,
    isCorrect,
    progress,
    expectedNext
  };
}

/**
 * 문자열 전체의 입력 상태 분석
 */
export function analyzeTextInput(targetText: string, userInput: string, currentIndex: number) {
  const results = [];
  const chars = targetText.split('');
  const userChars = userInput.split('');
  
  for (let i = 0; i < chars.length; i++) {
    const targetChar = chars[i];
    const userChar = i < userChars.length ? userChars[i] : '';
    
    if (i < currentIndex) {
      // 이미 완료된 문자들
      const analysis = analyzeKoreanInput(targetChar, userChar);
      results.push({
        ...analysis,
        status: analysis.isCorrect ? 'correct' : 'incorrect'
      });
    } else if (i === currentIndex) {
      // 현재 입력 중인 문자
      const analysis = analyzeKoreanInput(targetChar, userChar);
      results.push({
        ...analysis,
        status: 'current'
      });
    } else {
      // 아직 입력하지 않은 문자들
      results.push({
        targetChar,
        currentInput: '',
        isComplete: false,
        isCorrect: true,
        progress: 0,
        expectedNext: '',
        status: 'pending'
      });
    }
  }
  
  return results;
}

/**
 * 한글 조합 상태 확인 (미완성 글자 처리)
 */
export function getKoreanCompositionState(input: string) {
  if (!input) return null;
  
  const lastChar = input[input.length - 1];
  
  if (!Hangul.isHangul(lastChar)) return null;
  
  const components = Hangul.disassemble(lastChar);
  const isComplete = Hangul.isComplete(lastChar);
  
  return {
    char: lastChar,
    components,
    isComplete,
    needsMoreInput: !isComplete
  };
}

/**
 * 띄어쓰기 처리를 위한 공백 문자 검증
 */
export function isSpaceCharacter(char: string): boolean {
  return char === ' ' || char === '\u00A0'; // 일반 공백과 non-breaking space
}

/**
 * 한글 키보드 입력 시뮬레이션 (자소 단위)
 */
export function simulateKoreanInput(targetChar: string): string[] {
  if (!Hangul.isHangul(targetChar)) {
    return [targetChar];
  }
  
  const components = Hangul.disassemble(targetChar);
  const steps = [];
  
  for (let i = 1; i <= components.length; i++) {
    const assembled = Hangul.assemble(components.slice(0, i));
    steps.push(assembled);
  }
  
  return steps;
}

/**
 * 타이핑 정확도 계산 (한글 특성 반영)
 */
export function calculateKoreanAccuracy(targetText: string, userInput: string): number {
  const targetChars = targetText.split('');
  const userChars = userInput.split('');
  
  let totalComponents = 0;
  let correctComponents = 0;
  
  for (let i = 0; i < Math.min(targetChars.length, userChars.length); i++) {
    const targetChar = targetChars[i];
    const userChar = userChars[i];
    
    if (Hangul.isHangul(targetChar)) {
      const targetComponents = Hangul.disassemble(targetChar);
      const userComponents = Hangul.disassemble(userChar);
      
      totalComponents += targetComponents.length;
      
      for (let j = 0; j < targetComponents.length; j++) {
        if (j < userComponents.length && targetComponents[j] === userComponents[j]) {
          correctComponents++;
        }
      }
    } else {
      totalComponents += 1;
      if (targetChar === userChar) {
        correctComponents += 1;
      }
    }
  }
  
  return totalComponents > 0 ? (correctComponents / totalComponents) * 100 : 0;
}

/**
 * WPM 계산 (한글 특성 반영)
 */
export function calculateKoreanWPM(correctCharacters: number, timeInMinutes: number): number {
  if (timeInMinutes <= 0) return 0;
  
  // 한글의 경우 한 글자를 평균 2.5자소로 계산
  const adjustedCharacters = correctCharacters * 2.5;
  return Math.round(adjustedCharacters / timeInMinutes);
}

/**
 * 한글 타이핑 힌트 생성
 */
export function generateKoreanHint(targetChar: string, currentInput: string): string {
  const analysis = analyzeKoreanInput(targetChar, currentInput);
  
  if (!Hangul.isHangul(targetChar)) {
    return `'${targetChar}' 키를 누르세요`;
  }
  
  if (analysis.expectedNext) {
    const keyName = getKoreanKeyName(analysis.expectedNext);
    return `${keyName} 키를 누르세요`;
  }
  
  if (analysis.isComplete) {
    return '완료!';
  }
  
  return '계속 입력하세요';
}

/**
 * 한글 자소에 대응하는 키 이름 반환
 */
function getKoreanKeyName(jaso: string): string {
  const keyMap: Record<string, string> = {
    // 자음
    'ㄱ': 'ㄱ(R)', 'ㄴ': 'ㄴ(S)', 'ㄷ': 'ㄷ(E)', 'ㄹ': 'ㄹ(F)', 'ㅁ': 'ㅁ(A)',
    'ㅂ': 'ㅂ(Q)', 'ㅅ': 'ㅅ(T)', 'ㅇ': 'ㅇ(D)', 'ㅈ': 'ㅈ(W)', 'ㅊ': 'ㅊ(C)',
    'ㅋ': 'ㅋ(Z)', 'ㅌ': 'ㅌ(X)', 'ㅍ': 'ㅍ(V)', 'ㅎ': 'ㅎ(G)',
    
    // 모음
    'ㅏ': 'ㅏ(K)', 'ㅑ': 'ㅑ(I)', 'ㅓ': 'ㅓ(J)', 'ㅕ': 'ㅕ(U)', 'ㅗ': 'ㅗ(H)',
    'ㅛ': 'ㅛ(Y)', 'ㅜ': 'ㅜ(N)', 'ㅠ': 'ㅠ(B)', 'ㅡ': 'ㅡ(M)', 'ㅣ': 'ㅣ(L)',
    'ㅐ': 'ㅐ(O)', 'ㅔ': 'ㅔ(P)'
  };
  
  return keyMap[jaso] || jaso;
}