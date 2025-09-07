import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { Language } from '@/data/languages';
import ExamplePool from '@/data/examples';

export class TextRepository implements ITextRepository {
  private currentLanguage: Language = 'ko';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getRandomSentence(difficulty?: 'easy' | 'medium' | 'hard'): string {
    // 난이도가 지정되지 않은 경우 랜덤 선택
    const selectedDifficulty = difficulty || (() => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      return difficulties[Math.floor(Math.random() * difficulties.length)];
    })();
    
    return ExamplePool.getRandomSentence(this.currentLanguage, selectedDifficulty);
  }

  getRandomWords(count: number): string {
    return ExamplePool.getRandomWords(this.currentLanguage, count);
  }

  getSentencesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string[] {
    return ExamplePool.getSentencesByDifficulty(this.currentLanguage, difficulty);
  }

  getWordsByCategory(category: string): string[] {
    return ExamplePool.getWordsByCategory(this.currentLanguage, category, 50).split(' ');
  }

  getSentenceByTypeAndVariant(
    type: 'short' | 'medium' | 'long', 
    variant: 'basic' | 'punctuation' | 'numbers' | 'mixed'
  ): string {
    return ExamplePool.getSentenceByTypeAndVariant(this.currentLanguage, type, variant);
  }
}