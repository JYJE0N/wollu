/**
 * 언어 감지 및 한영 자동 변환 유틸리티
 * 한글 텍스트 중 영문 입력 감지 및 변환 제안
 */

// 한글-영문 키보드 매핑 (QWERTY)
const KOREAN_TO_ENGLISH_MAP: Record<string, string> = {
  // 첫번째 줄
  'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't', 
  'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
  // 두번째 줄  
  'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
  'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
  // 세번째 줄
  'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b',
  'ㅜ': 'n', 'ㅡ': 'm'
};

const ENGLISH_TO_KOREAN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(KOREAN_TO_ENGLISH_MAP).map(([k, v]) => [v, k])
);

// 복합 자음/모음 매핑
const COMPLEX_KOREAN_TO_ENGLISH: Record<string, string> = {
  'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T',
  'ㅒ': 'O', 'ㅖ': 'P'
};

const COMPLEX_ENGLISH_TO_KOREAN: Record<string, string> = Object.fromEntries(
  Object.entries(COMPLEX_KOREAN_TO_ENGLISH).map(([k, v]) => [v, k])
);

/**
 * 문자가 한글인지 확인
 */
export function isKoreanChar(char: string): boolean {
  const code = char.charCodeAt(0);
  // 한글 완성형 (가-힣)
  if (code >= 0xAC00 && code <= 0xD7A3) return true;
  // 한글 자모 (ㄱ-ㅎ, ㅏ-ㅣ)
  if (code >= 0x3131 && code <= 0x318E) return true;
  return false;
}

/**
 * 문자가 영문인지 확인
 */
export function isEnglishChar(char: string): boolean {
  return /^[a-zA-Z]$/.test(char);
}

/**
 * 텍스트의 주요 언어 감지
 */
export function detectTextLanguage(text: string): 'korean' | 'english' | 'mixed' {
  let koreanCount = 0;
  let englishCount = 0;
  
  for (const char of text) {
    if (isKoreanChar(char)) koreanCount++;
    else if (isEnglishChar(char)) englishCount++;
  }
  
  const total = koreanCount + englishCount;
  if (total === 0) return 'mixed';
  
  const koreanRatio = koreanCount / total;
  if (koreanRatio > 0.8) return 'korean';
  if (koreanRatio < 0.2) return 'english';
  return 'mixed';
}

/**
 * 한글 자모를 영문으로 변환
 */
export function convertKoreanToEnglish(text: string): string {
  return text.split('').map(char => {
    // 복합 자음/모음 우선 처리
    if (COMPLEX_KOREAN_TO_ENGLISH[char]) {
      return COMPLEX_KOREAN_TO_ENGLISH[char];
    }
    // 기본 자모 처리
    return KOREAN_TO_ENGLISH_MAP[char] || char;
  }).join('');
}

/**
 * 영문을 한글 자모로 변환
 */
export function convertEnglishToKorean(text: string): string {
  return text.split('').map(char => {
    // 복합 자음/모음 우선 처리 (Shift+키)
    if (COMPLEX_ENGLISH_TO_KOREAN[char]) {
      return COMPLEX_ENGLISH_TO_KOREAN[char];
    }
    // 기본 키 처리
    return ENGLISH_TO_KOREAN_MAP[char.toLowerCase()] || char;
  }).join('');
}

/**
 * 입력과 예상 텍스트 간의 언어 불일치 감지
 */
export function detectLanguageMismatch(
  input: string, 
  expected: string
): {
  hasMismatch: boolean;
  inputLanguage: 'korean' | 'english' | 'mixed';
  expectedLanguage: 'korean' | 'english' | 'mixed';
  suggestedConversion?: string;
  confidence: number;
} {
  const inputLang = detectTextLanguage(input);
  const expectedLang = detectTextLanguage(expected);
  
  // 언어 불일치가 없으면 바로 반환
  if (inputLang === expectedLang || inputLang === 'mixed' || expectedLang === 'mixed') {
    return {
      hasMismatch: false,
      inputLanguage: inputLang,
      expectedLanguage: expectedLang,
      confidence: 0
    };
  }
  
  // 변환 시도 및 일치도 계산
  let suggestedConversion: string | undefined;
  let confidence = 0;
  
  if (inputLang === 'english' && expectedLang === 'korean') {
    // 영문 → 한글 변환
    suggestedConversion = convertEnglishToKorean(input);
    confidence = calculateSimilarity(suggestedConversion, expected);
  } else if (inputLang === 'korean' && expectedLang === 'english') {
    // 한글 → 영문 변환
    suggestedConversion = convertKoreanToEnglish(input);
    confidence = calculateSimilarity(suggestedConversion, expected);
  }
  
  return {
    hasMismatch: true,
    inputLanguage: inputLang,
    expectedLanguage: expectedLang,
    suggestedConversion,
    confidence
  };
}

/**
 * 두 문자열의 유사도 계산 (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1.length === 0 && str2.length === 0) return 100;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const maxLength = Math.max(str1.length, str2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return Math.round((matches / maxLength) * 100);
}

/**
 * 한영키 전환 힌트 생성
 */
export function generateLanguageSwitchHint(
  mismatchInfo: ReturnType<typeof detectLanguageMismatch>
): string {
  if (!mismatchInfo.hasMismatch) return '';
  
  const { expectedLanguage, confidence } = mismatchInfo;
  
  if (confidence < 70) {
    // 신뢰도가 낮으면 일반적인 안내
    if (expectedLanguage === 'korean') {
      return '한글 입력이 필요합니다. 한/영키를 눌러 한글 모드로 전환하세요.';
    } else {
      return '영문 입력이 필요합니다. 한/영키를 눌러 영문 모드로 전환하세요.';
    }
  }
  
  // 신뢰도가 높으면 구체적인 변환 제안
  if (expectedLanguage === 'korean') {
    return `한글 모드로 전환 후 "${mismatchInfo.suggestedConversion}" 입력해보세요.`;
  } else {
    return `영문 모드로 전환 후 "${mismatchInfo.suggestedConversion}" 입력해보세요.`;
  }
}

/**
 * 실시간 언어 감지 및 힌트 제공
 */
export class LanguageDetector {
  private recentMismatches: Array<{ timestamp: number; confidence: number }> = [];
  
  /**
   * 키 입력에 대한 언어 불일치 검사
   */
  checkInput(input: string, expected: string): {
    showHint: boolean;
    hintMessage: string;
    severity: 'info' | 'warning' | 'error';
  } {
    const mismatch = detectLanguageMismatch(input, expected);
    
    if (!mismatch.hasMismatch) {
      return { showHint: false, hintMessage: '', severity: 'info' };
    }
    
    // 최근 불일치 기록 추가
    this.recentMismatches.push({
      timestamp: Date.now(),
      confidence: mismatch.confidence
    });
    
    // 5초 이상 된 기록 제거
    this.recentMismatches = this.recentMismatches.filter(
      record => Date.now() - record.timestamp < 5000
    );
    
    // 연속된 불일치 패턴 감지
    const severity = this.calculateSeverity(mismatch.confidence);
    const hintMessage = generateLanguageSwitchHint(mismatch);
    
    return {
      showHint: true,
      hintMessage,
      severity
    };
  }
  
  /**
   * 힌트 심각도 계산
   */
  private calculateSeverity(confidence: number): 'info' | 'warning' | 'error' {
    if (confidence > 85) return 'error';  // 확실한 언어 불일치
    if (confidence > 70) return 'warning';  // 가능한 언어 불일치
    return 'info';  // 불확실한 불일치
  }
  
  /**
   * 감지기 초기화
   */
  reset(): void {
    this.recentMismatches = [];
  }
}