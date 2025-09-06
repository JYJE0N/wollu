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
   * 랜덤 문장 가져오기
   */
  static getRandomSentence(
    language: Language,
    difficulty: 'easy' | 'medium' | 'hard'
  ): string {
    const sentences = this.getSentencesByDifficulty(language, difficulty);
    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
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
   * 문장 통계 정보
   */
  static getSentenceStats(language: Language) {
    const stats = {
      easy: sentenceExamples[language].easy.length,
      medium: sentenceExamples[language].medium.length,
      hard: sentenceExamples[language].hard.length,
    };
    
    return {
      ...stats,
      total: stats.easy + stats.medium + stats.hard,
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