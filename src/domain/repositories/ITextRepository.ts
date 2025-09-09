import { Language } from '@/data/languages';

export type SentenceLength = 'short' | 'medium' | 'long';
export type SentenceVariant = 'basic' | 'punctuation' | 'numbers' | 'mixed';

export interface ITextRepository {
  setLanguage(language: Language): void;
  getRandomSentence(length?: SentenceLength, variant?: SentenceVariant): string;
  getRandomWords(count: number): string;
  getSentencesByLengthAndVariant(length: SentenceLength, variant: SentenceVariant): string[];
  getWordsByCategory(category: string): string[];
  getSentenceByTypeAndVariant(type: SentenceLength, variant: SentenceVariant): string;
}