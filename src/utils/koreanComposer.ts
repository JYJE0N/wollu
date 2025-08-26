/**
 * 아이패드에서 분리된 한글 자모를 완성형 한글로 조합하는 유틸리티
 */

// 한글 초성, 중성, 종성 매핑
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

/**
 * 자모를 초성/중성/종성으로 분류
 */
function classifyJamo(jamo: string): 'chosung' | 'jungsung' | 'jongsung' | 'unknown' {
  if (CHOSUNG.includes(jamo)) return 'chosung'
  if (JUNGSUNG.includes(jamo)) return 'jungsung'  
  if (JONGSUNG.includes(jamo) && jamo !== '') return 'jongsung'
  return 'unknown'
}

/**
 * 초성, 중성, 종성을 완성형 한글로 조합
 */
function combineToSyllable(cho: string, jung: string, jong: string = ''): string {
  const choIndex = CHOSUNG.indexOf(cho)
  const jungIndex = JUNGSUNG.indexOf(jung)
  const jongIndex = jong ? JONGSUNG.indexOf(jong) : 0

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
    return cho + jung + jong // 조합 실패 시 그대로 연결
  }

  // 한글 완성형 유니코드 계산
  const syllableCode = 0xAC00 + (choIndex * 21 * 28) + (jungIndex * 28) + jongIndex
  return String.fromCharCode(syllableCode)
}

/**
 * 아이패드용 한글 자모 버퍼 관리 클래스
 */
export class KoreanComposer {
  private buffer: string[] = []
  
  /**
   * 자모를 추가하고 완성된 글자가 있으면 반환
   */
  addJamo(jamo: string): string | null {
    // 한글 자모가 아니면 버퍼 비우고 바로 반환
    if (classifyJamo(jamo) === 'unknown') {
      const result = this.flushBuffer()
      return result ? result + jamo : jamo
    }

    this.buffer.push(jamo)
    
    // 조합 시도
    const composed = this.tryCompose()
    if (composed) {
      this.buffer = []
      return composed
    }

    // 버퍼가 너무 길어지면 강제로 비움
    if (this.buffer.length >= 4) {
      return this.flushBuffer()
    }

    return null // 아직 조합 중
  }

  /**
   * 버퍼 내용으로 한글 조합 시도
   */
  private tryCompose(): string | null {
    if (this.buffer.length < 2) return null

    const types = this.buffer.map(classifyJamo)
    
    // 초성 + 중성 패턴
    if (this.buffer.length === 2 && types[0] === 'chosung' && types[1] === 'jungsung') {
      return combineToSyllable(this.buffer[0], this.buffer[1])
    }
    
    // 초성 + 중성 + 종성 패턴
    if (this.buffer.length === 3 && 
        types[0] === 'chosung' && types[1] === 'jungsung' && types[2] === 'jongsung') {
      return combineToSyllable(this.buffer[0], this.buffer[1], this.buffer[2])
    }

    return null
  }

  /**
   * 버퍼 내용을 모두 비움
   */
  flushBuffer(): string {
    const result = this.buffer.join('')
    this.buffer = []
    return result
  }

  /**
   * 현재 버퍼 상태
   */
  getBufferInfo(): { buffer: string[], length: number } {
    return {
      buffer: [...this.buffer],
      length: this.buffer.length
    }
  }
}