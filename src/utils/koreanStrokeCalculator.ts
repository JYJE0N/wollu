/**
 * Korean Stroke Calculator
 * 한글 타이핑의 실제 스트로크 수를 계산하여 공정한 CPM 측정
 * 
 * 목적: 영문 대비 한글의 불리함을 해소하고, 실제 키 입력 횟수를 반영
 */

// 초성 스트로크 맵 (쌍자음은 2타)
const CHOSUNG_STROKES: Record<string, number> = {
  'ㄱ': 1, 'ㄲ': 2, 'ㄴ': 1, 'ㄷ': 1, 'ㄸ': 2, 'ㄹ': 1, 'ㅁ': 1, 
  'ㅂ': 1, 'ㅃ': 2, 'ㅅ': 1, 'ㅆ': 2, 'ㅇ': 1, 'ㅈ': 1, 'ㅉ': 2, 
  'ㅊ': 1, 'ㅋ': 1, 'ㅌ': 1, 'ㅍ': 1, 'ㅎ': 1
}

// 중성 스트로크 맵 (몽키타입과 유사하게 더 관대한 계산)
const JUNGSUNG_STROKES: Record<string, number> = {
  // 모든 기본 모음을 1타로 단순화 (더 관대하게)
  'ㅏ': 1, 'ㅓ': 1, 'ㅗ': 1, 'ㅜ': 1, 'ㅡ': 1, 'ㅣ': 1, 'ㅔ': 1, 'ㅕ': 1,
  // 시프트 필요 모음도 1타로 관대하게 (실제로는 2타지만 몽키타입 스타일)
  'ㅑ': 1, 'ㅛ': 1, 'ㅠ': 1, 'ㅐ': 1, 'ㅖ': 1,
  // 복합 모음만 2타로 유지
  'ㅒ': 2, 'ㅘ': 2, 'ㅙ': 2, 'ㅚ': 2, 'ㅝ': 2, 'ㅞ': 2, 'ㅟ': 2, 'ㅢ': 2
}

// 종성 스트로크 맵 (겹받침은 2타)
const JONGSUNG_STROKES: Record<string, number> = {
  '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 2, 'ㄴ': 1, 'ㄵ': 2, 'ㄶ': 2, 
  'ㄷ': 1, 'ㄹ': 1, 'ㄺ': 2, 'ㄻ': 2, 'ㄼ': 2, 'ㄽ': 2, 'ㄾ': 2, 
  'ㄿ': 2, 'ㅀ': 2, 'ㅁ': 1, 'ㅂ': 1, 'ㅄ': 2, 'ㅅ': 1, 'ㅆ': 2, 
  'ㅇ': 1, 'ㅈ': 1, 'ㅊ': 1, 'ㅋ': 1, 'ㅌ': 1, 'ㅍ': 1, 'ㅎ': 1
}

// 초성, 중성, 종성 배열 (decompose용)
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

/**
 * 한글 완성형 음절인지 확인
 */
export function isKoreanSyllable(char: string): boolean {
  if (!char || char.length !== 1) return false
  const code = char.charCodeAt(0)
  return code >= 0xAC00 && code <= 0xD7A3
}

/**
 * 한글 완성형 음절을 초성, 중성, 종성으로 분해
 */
export function decomposeKorean(char: string): { chosung: string, jungsung: string, jongsung: string } {
  if (!isKoreanSyllable(char)) {
    throw new Error(`Not a Korean syllable: ${char}`)
  }

  const code = char.charCodeAt(0) - 0xAC00
  const chosungIndex = Math.floor(code / 588)
  const jungsungIndex = Math.floor((code % 588) / 28)
  const jongsungIndex = code % 28

  return {
    chosung: CHOSUNG[chosungIndex],
    jungsung: JUNGSUNG[jungsungIndex], 
    jongsung: JONGSUNG[jongsungIndex]
  }
}

/**
 * 단일 한글 음절의 스트로크 수 계산
 */
export function calculateKoreanCharStrokes(char: string): number {
  if (!isKoreanSyllable(char)) {
    // 한글이 아닌 경우 (영문, 숫자, 기호 등)
    return 1
  }

  const { chosung, jungsung, jongsung } = decomposeKorean(char)
  
  const chosungStrokes = CHOSUNG_STROKES[chosung] || 1
  const jungsungStrokes = JUNGSUNG_STROKES[jungsung] || 1
  const jongsungStrokes = JONGSUNG_STROKES[jongsung] || 0

  const totalStrokes = chosungStrokes + jungsungStrokes + jongsungStrokes
  

  return totalStrokes
}

/**
 * 텍스트 전체의 스트로크 수 계산
 */
export function calculateTextStrokes(text: string): number {
  if (!text) return 0

  let totalStrokes = 0

  for (const char of text) {
    if (char === ' ') {
      totalStrokes += 1 // 스페이스
    } else if (char === '\n' || char === '\r') {
      totalStrokes += 1 // 엔터
    } else {
      totalStrokes += calculateKoreanCharStrokes(char)
    }
  }

  return totalStrokes
}

/**
 * 관대한 한글 CPM 계산 (스트로크 기반)
 * 
 * @param completedText 완성된 텍스트
 * @param timeInMinutes 경과 시간 (분)
 * @param accuracyRate 정확도 비율 (0~1)
 * @returns 스트로크 기반 CPM
 */
export function calculateKoreanStrokeCPM(
  completedText: string, 
  timeInMinutes: number,
  accuracyRate: number = 1.0
): number {
  if (timeInMinutes <= 0 || !completedText) return 0

  // 🚀 몽키타입 스타일: 한글도 글자 수 기준으로 더 관대하게 계산
  const totalStrokes = calculateTextStrokes(completedText)
  // 한글 글자는 평균 2타로 가정하고, 실제 스트로크에서 비율 조정
  const koreanChars = (completedText.match(/[가-힣]/g) || []).length
  const otherChars = completedText.length - koreanChars
  
  // 🚀🚀 몽키타입 수준으로 더욱 상향 조정: 모든 글자 = 1타로 매우 관대하게!
  // 공백, 특수문자, 한글, 영문 모두 1타로 동일하게 처리 (MonkeyType 방식)
  const adjustedStrokes = completedText.length  // 단순히 글자 수 = 타수
  const rawStrokeCPM = adjustedStrokes / timeInMinutes
  
  // 정확도 보정 완전 제거 (몽키타입은 거의 보정 안함)
  const adjustedAccuracy = Math.max(1.0, accuracyRate) // 100% 보장
  const adjustedCPM = Math.round(rawStrokeCPM * adjustedAccuracy * 1.2)  // 20% 추가 보너스


  return adjustedCPM
}

/**
 * 스트로크 기반 WPM 계산 (참고용)
 * 일반적으로 5타 = 1단어로 계산하지만, 한글은 스트로크를 고려
 */
export function calculateKoreanStrokeWPM(
  completedText: string,
  timeInMinutes: number, 
  accuracyRate: number = 1.0
): number {
  const strokeCPM = calculateKoreanStrokeCPM(completedText, timeInMinutes, accuracyRate)
  // 한글의 경우 평균 3스트로크 = 1단어로 가정 (영문의 5타보다 관대)
  return Math.round(strokeCPM / 3)
}

/**
 * 텍스트의 언어별 스트로크 통계
 */
export function analyzeTextStrokes(text: string): {
  totalStrokes: number
  koreanChars: number
  koreanStrokes: number
  nonKoreanChars: number
  averageStrokesPerChar: number
} {
  if (!text) return {
    totalStrokes: 0,
    koreanChars: 0, 
    koreanStrokes: 0,
    nonKoreanChars: 0,
    averageStrokesPerChar: 0
  }

  let totalStrokes = 0
  let koreanChars = 0
  let koreanStrokes = 0
  let nonKoreanChars = 0

  for (const char of text) {
    if (isKoreanSyllable(char)) {
      const strokes = calculateKoreanCharStrokes(char)
      koreanChars++
      koreanStrokes += strokes
      totalStrokes += strokes
    } else if (char === ' ' || char === '\n' || char === '\r') {
      totalStrokes += 1
      nonKoreanChars++
    } else {
      totalStrokes += 1
      nonKoreanChars++
    }
  }

  const totalChars = koreanChars + nonKoreanChars
  const averageStrokesPerChar = totalChars > 0 ? totalStrokes / totalChars : 0

  return {
    totalStrokes,
    koreanChars,
    koreanStrokes,
    nonKoreanChars,
    averageStrokesPerChar: Math.round(averageStrokesPerChar * 100) / 100
  }
}