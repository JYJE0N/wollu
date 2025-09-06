// 예제 Pool 통합 인덱스
import { easyKoreanSentences } from './korean/sentences/easy';
import { mediumKoreanSentences } from './korean/sentences/medium';
import { hardKoreanSentences } from './korean/sentences/hard';
import { easyEnglishSentences } from './english/sentences/easy';
import { mediumEnglishSentences } from './english/sentences/medium';
import { hardEnglishSentences } from './english/sentences/hard';
import { allKoreanWords, koreanWordPools } from './words/korean';
import { allEnglishWords, englishWordPools } from './words/english';
import { Language } from '@/data/languages';

// 문장 예제 통합
export const sentenceExamples = {
  ko: {
    easy: easyKoreanSentences,
    medium: mediumKoreanSentences,
    hard: hardKoreanSentences,
  },
  en: {
    easy: easyEnglishSentences,
    medium: mediumEnglishSentences,
    hard: hardEnglishSentences,
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

// 유틸리티 함수들
export class ExamplePool {
  // 사용된 문장들을 추적하는 Set (언어별, 난이도별)
  private static usedSentences: Map<string, Set<string>> = new Map();
  
  /**
   * 사용된 문장 키 생성
   */
  private static getUsedKey(language: Language, difficulty: 'easy' | 'medium' | 'hard'): string {
    return `${language}-${difficulty}`;
  }
  
  /**
   * 사용된 문장 초기화
   */
  static resetUsedSentences(language?: Language, difficulty?: 'easy' | 'medium' | 'hard'): void {
    if (language && difficulty) {
      const key = this.getUsedKey(language, difficulty);
      this.usedSentences.delete(key);
    } else {
      this.usedSentences.clear();
    }
  }
  /**
   * 난이도별 문장 가져오기
   */
  static getSentencesByDifficulty(
    language: Language,
    difficulty: 'easy' | 'medium' | 'hard'
  ): string[] {
    return sentenceExamples[language][difficulty];
  }

  /**
   * 랜덤 문장 가져오기 (중복 방지)
   */
  static getRandomSentence(
    language: Language,
    difficulty: 'easy' | 'medium' | 'hard'
  ): string {
    const sentences = this.getSentencesByDifficulty(language, difficulty);
    const key = this.getUsedKey(language, difficulty);
    
    // 해당 카테고리의 사용된 문장 Set 가져오기 또는 생성
    if (!this.usedSentences.has(key)) {
      this.usedSentences.set(key, new Set());
    }
    const usedSet = this.usedSentences.get(key)!;
    
    // 아직 사용하지 않은 문장들 필터링
    const availableSentences = sentences.filter(sentence => !usedSet.has(sentence));
    
    // 모든 문장을 사용했다면 사용 기록 초기화
    if (availableSentences.length === 0) {
      usedSet.clear();
      return this.getRandomSentence(language, difficulty); // 재귀 호출
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
   * 문장 통계 정보 (사용 현황 포함)
   */
  static getSentenceStats(language: Language) {
    const stats = {
      easy: sentenceExamples[language].easy.length,
      medium: sentenceExamples[language].medium.length,
      hard: sentenceExamples[language].hard.length,
    };
    
    // 사용된 문장 수 계산
    const usedStats = {
      easy: this.usedSentences.get(this.getUsedKey(language, 'easy'))?.size || 0,
      medium: this.usedSentences.get(this.getUsedKey(language, 'medium'))?.size || 0,
      hard: this.usedSentences.get(this.getUsedKey(language, 'hard'))?.size || 0,
    };
    
    return {
      total: stats,
      used: usedStats,
      available: {
        easy: stats.easy - usedStats.easy,
        medium: stats.medium - usedStats.medium,
        hard: stats.hard - usedStats.hard,
      },
      totalCount: stats.easy + stats.medium + stats.hard,
      totalUsed: usedStats.easy + usedStats.medium + usedStats.hard,
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