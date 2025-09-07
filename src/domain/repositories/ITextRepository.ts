import { Language } from '@/data/languages';

export interface ITextRepository {
  setLanguage(language: Language): void;
  getRandomSentence(difficulty?: 'easy' | 'medium' | 'hard'): string;
  getRandomWords(count: number): string;
  getSentencesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string[];
  getWordsByCategory(category: string): string[];
}