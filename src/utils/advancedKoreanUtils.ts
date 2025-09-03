/**
 * 고급 한글 처리 유틸리티
 * 초성, 중성, 종성의 실시간 조합 처리
 */

// 한글 자소 매핑
export const KOREAN_CONSONANTS = {
  // 초성
  'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7, 'ㅃ': 8,
  'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13, 'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18
} as const;

export const KOREAN_VOWELS = {
  'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7, 'ㅗ': 8,
  'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14, 'ㅞ': 15, 'ㅟ': 16, 'ㅠ': 17,
  'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
} as const;

export const KOREAN_FINAL_CONSONANTS = {
  '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 3, 'ㄴ': 4, 'ㄵ': 5, 'ㄶ': 6, 'ㄷ': 7, 'ㄹ': 8,
  'ㄺ': 9, 'ㄻ': 10, 'ㄼ': 11, 'ㄽ': 12, 'ㄾ': 13, 'ㄿ': 14, 'ㅀ': 15, 'ㅁ': 16, 'ㅂ': 17,
  'ㅄ': 18, 'ㅅ': 19, 'ㅆ': 20, 'ㅇ': 21, 'ㅈ': 22, 'ㅊ': 23, 'ㅋ': 24, 'ㅌ': 25, 'ㅍ': 26, 'ㅎ': 27
} as const;

// 복합 자음 조합 규칙
export const COMPOUND_CONSONANTS = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ'
} as const;

// 복합 모음 조합 규칙
export const COMPOUND_VOWELS = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ'
} as const;

/**
 * 한글 조합 상태
 */
export interface KoreanComposition {
  initial: string;  // 초성
  medial: string;   // 중성
  final: string;    // 종성
  composed: string; // 조합된 결과
  isComplete: boolean;
}

/**
 * 자소를 한글로 조합
 */
export function composeKorean(initial: string, medial: string, final: string = ''): string {
  if (!initial || !medial) return '';
  
  const initialIndex = KOREAN_CONSONANTS[initial as keyof typeof KOREAN_CONSONANTS];
  const medialIndex = KOREAN_VOWELS[medial as keyof typeof KOREAN_VOWELS];
  const finalIndex = KOREAN_FINAL_CONSONANTS[final as keyof typeof KOREAN_FINAL_CONSONANTS] || 0;
  
  if (initialIndex === undefined || medialIndex === undefined) return '';
  
  const unicode = 0xAC00 + (initialIndex * 21 * 28) + (medialIndex * 28) + finalIndex;
  return String.fromCharCode(unicode);
}

/**
 * 한글을 자소로 분해
 */
export function decomposeKorean(char: string): KoreanComposition {
  if (!char || char.length !== 1) {
    return { initial: '', medial: '', final: '', composed: char, isComplete: false };
  }
  
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) {
    return { initial: '', medial: '', final: '', composed: char, isComplete: false };
  }
  
  const initialIndex = Math.floor(code / (21 * 28));
  const medialIndex = Math.floor((code % (21 * 28)) / 28);
  const finalIndex = code % 28;
  
  const initialChars = Object.keys(KOREAN_CONSONANTS);
  const medialChars = Object.keys(KOREAN_VOWELS);
  const finalChars = Object.keys(KOREAN_FINAL_CONSONANTS);
  
  return {
    initial: initialChars[initialIndex] || '',
    medial: medialChars[medialIndex] || '',
    final: finalChars[finalIndex] || '',
    composed: char,
    isComplete: true
  };
}

/**
 * 키 입력으로부터 조합 상태 업데이트
 */
export function updateComposition(current: KoreanComposition, input: string): KoreanComposition {
  // 자음인지 모음인지 확인
  const isConsonant = input in KOREAN_CONSONANTS || input in KOREAN_FINAL_CONSONANTS;
  const isVowel = input in KOREAN_VOWELS;
  
  if (!isConsonant && !isVowel) {
    return current;
  }
  
  let newComposition = { ...current };
  
  if (isConsonant) {
    if (!current.initial) {
      // 초성 설정
      newComposition.initial = input;
    } else if (current.medial && !current.final) {
      // 종성 시도
      newComposition.final = input;
    } else if (current.final) {
      // 복합 종성 시도
      const compound = COMPOUND_CONSONANTS[`${current.final}${input}` as keyof typeof COMPOUND_CONSONANTS];
      if (compound) {
        newComposition.final = compound;
      }
    }
  } else if (isVowel) {
    if (current.initial && !current.medial) {
      // 중성 설정
      newComposition.medial = input;
    } else if (current.medial) {
      // 복합 모음 시도
      const compound = COMPOUND_VOWELS[`${current.medial}${input}` as keyof typeof COMPOUND_VOWELS];
      if (compound) {
        newComposition.medial = compound;
      }
    }
  }
  
  // 조합된 문자 생성
  if (newComposition.initial && newComposition.medial) {
    newComposition.composed = composeKorean(
      newComposition.initial,
      newComposition.medial,
      newComposition.final
    );
    newComposition.isComplete = true;
  }
  
  return newComposition;
}

/**
 * 문자가 한글인지 확인
 */
export function isKorean(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (code >= 0xAC00 && code <= 0xD7A3) || // 완성형 한글
         (code >= 0x3131 && code <= 0x318E);   // 한글 자모
}

/**
 * 입력 진행률 계산 (자소 단위)
 */
export function calculateKoreanProgress(target: string, current: KoreanComposition): number {
  if (!isKorean(target)) return current.composed === target ? 1 : 0;
  
  const targetDecomposed = decomposeKorean(target);
  let progress = 0;
  let totalSteps = 0;
  
  // 초성
  if (targetDecomposed.initial) {
    totalSteps++;
    if (current.initial === targetDecomposed.initial) progress++;
  }
  
  // 중성
  if (targetDecomposed.medial) {
    totalSteps++;
    if (current.medial === targetDecomposed.medial) progress++;
  }
  
  // 종성
  if (targetDecomposed.final) {
    totalSteps++;
    if (current.final === targetDecomposed.final) progress++;
  }
  
  return totalSteps > 0 ? progress / totalSteps : 0;
}

/**
 * 다음에 입력해야 할 자소 힌트
 */
export function getNextInputHint(target: string, current: KoreanComposition): string {
  if (!isKorean(target)) return target;
  
  const targetDecomposed = decomposeKorean(target);
  
  if (!current.initial) {
    return `초성 '${targetDecomposed.initial}' 입력`;
  } else if (!current.medial) {
    return `중성 '${targetDecomposed.medial}' 입력`;
  } else if (targetDecomposed.final && !current.final) {
    return `종성 '${targetDecomposed.final}' 입력`;
  } else {
    return '완성!';
  }
}