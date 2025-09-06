import { Language } from '@/data/languages';

export interface ITextRepository {
  setLanguage(language: Language): void;
  getRandomSentence(): string;
  getRandomWords(count: number): string;
  getSentencesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string[];
  getWordsByCategory(category: string): string[];
}