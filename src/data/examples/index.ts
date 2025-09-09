// 예제 Pool 통합 인덱스
import { Language } from '@/data/languages';

// 한글 문장 imports
import { koreanShortSentencesByType } from './korean/sentences/short/index';
import { koreanMediumSentencesByType } from './korean/sentences/medium/index';
import { koreanLongSentencesByType } from './korean/sentences/long/index';

// 영어 문장 imports
import { englishShortSentencesByType } from './english/sentences/short/index';
import { englishMediumSentencesByType } from './english/sentences/medium/index';
import { englishLongSentencesByType } from './english/sentences/long/index';

// 단어 imports
import { allKoreanWords, koreanWordPools } from './words/korean';
import { allEnglishWords, englishWordPools } from './words/english';

// 길이별 + 속성별 문장 구조
export const sentenceExamples = {
  ko: {
    short: koreanShortSentencesByType,
    medium: koreanMediumSentencesByType,
    long: koreanLongSentencesByType,
  },
  en: {
    short: englishShortSentencesByType,
    medium: englishMediumSentencesByType,
    long: englishLongSentencesByType,
  }
};

// 단어 예제 통합
export const wordExamples = {
  ko: {
    all: allKoreanWords,
    pools: koreanWordPools,
  },
  en: {
    all: allEnglishWords,
    pools: englishWordPools,
  }
};

// 타입 정의
export type SentenceLength = 'short' | 'medium' | 'long';
export type SentenceVariant = 'basic' | 'punctuation' | 'numbers' | 'mixed';

// 유틸리티 함수들
export class ExamplePool {
  // 사용된 문장들을 추적하는 Set (언어별, 길이별, 속성별)
  private static usedSentences: Map<string, Set<string>> = new Map();
  
  /**
   * 사용된 문장 키 생성
   */
  private static getUsedKey(
    language: Language, 
    length: SentenceLength, 
    variant: SentenceVariant
  ): string {
    return `${language}-${length}-${variant}`;
  }
  
  /**
   * 사용된 문장 초기화
   */
  static resetUsedSentences(
    language?: Language, 
    length?: SentenceLength, 
    variant?: SentenceVariant
  ): void {
    if (language && length && variant) {
      const key = this.getUsedKey(language, length, variant);
      this.usedSentences.delete(key);
    } else {
      this.usedSentences.clear();
    }
  }

  /**
   * 길이와 속성에 따른 문장 가져오기
   */
  static getSentencesByLengthAndVariant(
    language: Language,
    length: SentenceLength,
    variant: SentenceVariant
  ): string[] {
    const lengthData = sentenceExamples[language][length];
    
    if (!lengthData) {
      console.warn(`No data found for ${language} ${length} sentences`);
      return [];
    }
    
    const variantData = lengthData[variant];
    
    if (!variantData) {
      console.warn(`No ${variant} sentences found for ${language} ${length}`);
      // fallback to all sentences of that length
      return lengthData.all || [];
    }
    
    return variantData;
  }

  /**
   * 랜덤 문장 가져오기 (중복 방지)
   */
  static getRandomSentence(
    language: Language,
    length: SentenceLength,
    variant: SentenceVariant
  ): string {
    const sentences = this.getSentencesByLengthAndVariant(language, length, variant);
    
    if (sentences.length === 0) {
      // fallback: 해당 길이의 모든 문장에서 선택
      const allSentences = sentenceExamples[language][length]?.all || [];
      if (allSentences.length === 0) {
        return "No sentences available";
      }
      const randomIndex = Math.floor(Math.random() * allSentences.length);
      return allSentences[randomIndex];
    }
    
    const key = this.getUsedKey(language, length, variant);
    
    // 타이핑 연습에 적합한 문장들만 필터링
    const typingFriendlySentences = sentences.filter(sentence => 
      this.isTypingFriendly(sentence)
    );
    
    if (typingFriendlySentences.length === 0) {
      // 적합한 문장이 없으면 원본에서 선택
      const randomIndex = Math.floor(Math.random() * sentences.length);
      return sentences[randomIndex];
    }
    
    // 해당 카테고리의 사용된 문장 Set 가져오기 또는 생성
    if (!this.usedSentences.has(key)) {
      this.usedSentences.set(key, new Set());
    }
    const usedSet = this.usedSentences.get(key)!;
    
    // 아직 사용하지 않은 문장들 필터링
    const availableSentences = typingFriendlySentences.filter(sentence => !usedSet.has(sentence));
    
    // 모든 문장을 사용했다면 사용 기록 초기화
    if (availableSentences.length === 0) {
      usedSet.clear();
      return this.getRandomSentence(language, length, variant); // 재귀 호출
    }
    
    // 사용 가능한 문장 중 랜덤 선택
    const randomIndex = Math.floor(Math.random() * availableSentences.length);
    const selectedSentence = availableSentences[randomIndex];
    
    // 선택된 문장을 사용된 목록에 추가
    usedSet.add(selectedSentence);
    
    return selectedSentence;
  }

  /**
   * 랜덤 단어들 가져오기
   */
  static getRandomWords(
    language: Language,
    count: number = 10
  ): string {
    const words = wordExamples[language].all;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).join(' ');
  }

  /**
   * 특정 카테고리 단어들 가져오기
   */
  static getWordsByCategory(
    language: Language,
    category: string,
    count: number = 10
  ): string {
    const pools = wordExamples[language].pools;
    const categoryWords = pools[category as keyof typeof pools];
    
    if (!categoryWords) {
      return this.getRandomWords(language, count);
    }

    const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).join(' ');
  }

  /**
   * 문장 통계 정보 (새로운 구조)
   */
  static getSentenceStats(language: Language) {
    const lengths: SentenceLength[] = ['short', 'medium', 'long'];
    const variants: SentenceVariant[] = ['basic', 'punctuation', 'numbers', 'mixed'];
    
    const stats: Record<SentenceLength, Record<SentenceVariant, number>> = {
      short: { basic: 0, punctuation: 0, numbers: 0, mixed: 0 },
      medium: { basic: 0, punctuation: 0, numbers: 0, mixed: 0 },
      long: { basic: 0, punctuation: 0, numbers: 0, mixed: 0 }
    };
    
    let totalCount = 0;
    
    for (const length of lengths) {
      for (const variant of variants) {
        const sentences = this.getSentencesByLengthAndVariant(language, length, variant);
        stats[length][variant] = sentences.length;
        totalCount += sentences.length;
      }
    }
    
    return {
      byLength: stats,
      totalCount
    };
  }

  /**
   * 단어 통계 정보
   */
  static getWordStats(language: Language) {
    const pools = wordExamples[language].pools;
    const categories = Object.keys(pools);
    
    const categoryStats = categories.reduce((acc, category) => {
      acc[category] = pools[category as keyof typeof pools].length;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);

    return {
      categories: categoryStats,
      totalCategories: categories.length,
      totalWords: total,
    };
  }

  /**
   * 구두점 포함 여부 검사
   */
  private static hasPunctuation(text: string): boolean {
    const punctuationRegex = /[.,!?:;"'()\[\]{}\-\/~`@#$%^&*+=<>|\\]/;
    return punctuationRegex.test(text);
  }
  
  /**
   * 숫자 포함 여부 검사
   */
  private static hasNumbers(text: string): boolean {
    const numberRegex = /\d/;
    return numberRegex.test(text);
  }
  
  /**
   * 키보드에 없는 특수기호 필터링
   */
  private static filterSpecialCharacters(text: string): string {
    // 키보드에 없는 특수기호들 제거
    const specialCharsRegex = /[¶〖〗⎡⎛⎜⎝⎞⎟⎠⎤⎥⎦⎧⎨⎩⎪⎫⎬⎭①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻★☆♪♫♬♭♯♮…‥※‡†§『』「」｢｣〈〉《》【】〔〕〘〙〚〛]/g;
    
    return text.replace(specialCharsRegex, '');
  }
  
  /**
   * 타이핑 연습에 적합한 문장인지 검사
   */
  private static isTypingFriendly(text: string): boolean {
    const cleaned = this.filterSpecialCharacters(text);
    // 특수기호 제거 후 원본과 다르면 부적합한 문장
    if (cleaned !== text) return false;
    
    // 너무 긴 문장 제외 (200자 초과)
    if (text.length > 200) return false;
    
    // 연속된 공백 제외
    if (/\s{3,}/.test(text)) return false;
    
    return true;
  }

  /**
   * 전체 예제 통계
   */
  static getAllStats() {
    return {
      sentences: {
        ko: this.getSentenceStats('ko'),
        en: this.getSentenceStats('en'),
      },
      words: {
        ko: this.getWordStats('ko'),
        en: this.getWordStats('en'),
      }
    };
  }
}

export default ExamplePool;