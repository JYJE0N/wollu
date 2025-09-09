import { disassemble, assemble } from 'hangul-js';

export class TypingStats {
  constructor(
    public readonly cpm: number,  // Characters Per Minute
    public readonly wpm: number,  // Words Per Minute (한국어: cpm/2.5)
    public readonly accuracy: number,  // 입력한 글자 중 정확한 비율
    public readonly completionRate: number,  // 전체 텍스트 중 완료한 비율
    public readonly timeElapsed: number,
    public readonly correctChars: number,
    public readonly totalChars: number,
    public readonly errorCount: number = 0
  ) {}

  /**
   * 한국어 특성을 고려한 더 정확한 계산
   */
  static calculateWithKoreanSupport(
    text: string,
    userInput: string,
    timeElapsed: number,
    language: 'ko' | 'en' = 'ko'
  ): TypingStats {
    if (language === 'ko') {
      return this.calculateKorean(text, userInput, timeElapsed);
    } else {
      return this.calculateEnglish(text, userInput, timeElapsed);
    }
  }

  /**
   * 한국어 전용 계산 - 자모 조합 특성 고려
   */
  private static calculateKorean(
    text: string,
    userInput: string,
    timeElapsed: number
  ): TypingStats {
    // 한글 자모 분리하여 정확도 계산용
    const textJamos = disassemble(text);
    const inputJamos = disassemble(userInput);
    
    let correctJamos = 0;
    let errorCount = 0;

    // 자모 단위로 비교 (정확도 계산용)
    for (let i = 0; i < Math.min(inputJamos.length, textJamos.length); i++) {
      if (inputJamos[i] === textJamos[i]) {
        correctJamos++;
      } else {
        errorCount++;
      }
    }

    // 완성된 글자 단위로 계산 (CPM 계산용)
    let correctCompleteChars = 0;
    const minLength = Math.min(userInput.length, text.length);
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === text[i]) {
        correctCompleteChars++;
      }
    }

    // 자모 기준 정확도
    const jamoAccuracy = inputJamos.length > 0 
      ? (correctJamos / inputJamos.length) * 100 
      : 0;
    
    // 완성 글자 기준 정확도 
    const charAccuracy = userInput.length > 0 
      ? (correctCompleteChars / userInput.length) * 100 
      : 0;

    // 두 정확도의 가중 평균 (자모 70%, 완성글자 30%)
    const accuracy = (jamoAccuracy * 0.7) + (charAccuracy * 0.3);
    
    // 완료율은 전체 텍스트 중 얼마나 입력했는지
    const completionRate = text.length > 0 
      ? (userInput.length / text.length) * 100 
      : 0;
    
    // CPM 계산 - 완성된 글자 기준 (타 사이트와 동일)
    const cpm = timeElapsed > 0 
      ? Math.round((correctCompleteChars / timeElapsed) * 60) 
      : 0;
    
    // WPM 계산 - 한국어는 보통 2.5글자당 1단어
    const wpm = Math.round(cpm / 2.5);

    return new TypingStats(
      cpm,
      wpm,
      accuracy,
      completionRate,
      timeElapsed,
      correctCompleteChars,  // CPM과 일치하도록 완성글자 수 반환
      userInput.length,
      errorCount
    );
  }

  /**
   * 영어 전용 계산
   */
  private static calculateEnglish(
    text: string,
    userInput: string,
    timeElapsed: number
  ): TypingStats {
    let correctChars = 0;
    let errorCount = 0;

    // 입력한 부분에 대해서만 검사
    for (let i = 0; i < Math.min(userInput.length, text.length); i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      } else {
        errorCount++;
      }
    }

    // 정확도는 입력한 글자 중 정확한 글자의 비율로 계산
    const accuracy = userInput.length > 0 
      ? (correctChars / userInput.length) * 100 
      : 0;
    
    // 완료율은 전체 텍스트 중 얼마나 입력했는지
    const completionRate = text.length > 0 
      ? (userInput.length / text.length) * 100 
      : 0;
    
    // CPM (Characters Per Minute) 계산
    const cpm = timeElapsed > 0 
      ? Math.round((correctChars / timeElapsed) * 60) 
      : 0;
    
    // WPM (Words Per Minute) 계산 - 영어는 보통 5글자당 1단어
    const wpm = Math.round(cpm / 5);

    return new TypingStats(
      cpm,
      wpm,
      accuracy,
      completionRate,
      timeElapsed,
      correctChars,
      userInput.length,
      errorCount
    );
  }

  /**
   * 기존 호환성을 위한 레거시 메서드
   */
  static calculate(
    text: string,
    userInput: string,
    timeElapsed: number
  ): TypingStats {
    // 텍스트에 한글이 포함되어 있는지 확인
    const hasKorean = /[가-힣]/.test(text);
    return this.calculateWithKoreanSupport(
      text, 
      userInput, 
      timeElapsed, 
      hasKorean ? 'ko' : 'en'
    );
  }

  isComplete(targetText: string): boolean {
    return this.totalChars >= targetText.length && this.accuracy === 100;
  }
}