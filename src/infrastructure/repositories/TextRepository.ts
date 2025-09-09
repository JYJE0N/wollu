import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { Language } from '@/data/languages';
import ExamplePool, { SentenceLength, SentenceVariant } from '@/data/examples';

export class TextRepository implements ITextRepository {
  private currentLanguage: Language = 'ko';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getRandomSentence(length: SentenceLength = 'short', variant: SentenceVariant = 'basic'): string {
    return ExamplePool.getRandomSentence(this.currentLanguage, length, variant);
  }

  getRandomWords(count: number): string {
    return ExamplePool.getRandomWords(this.currentLanguage, count);
  }

  getSentencesByLengthAndVariant(length: SentenceLength, variant: SentenceVariant): string[] {
    return ExamplePool.getSentencesByLengthAndVariant(this.currentLanguage, length, variant);
  }

  getWordsByCategory(category: string): string[] {
    return ExamplePool.getWordsByCategory(this.currentLanguage, category, 50).split(' ');
  }

  getSentenceByTypeAndVariant(
    type: SentenceLength, 
    variant: SentenceVariant
  ): string {
    return ExamplePool.getRandomSentence(this.currentLanguage, type, variant);
  }
}