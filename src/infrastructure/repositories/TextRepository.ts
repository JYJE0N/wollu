import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { Language } from '@/data/languages';
import ExamplePool from '@/data/examples';

export class TextRepository implements ITextRepository {
  private currentLanguage: Language = 'ko';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getRandomSentence(): string {
    // 랜덤 난이도 선택
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    return ExamplePool.getRandomSentence(this.currentLanguage, randomDifficulty);
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
}