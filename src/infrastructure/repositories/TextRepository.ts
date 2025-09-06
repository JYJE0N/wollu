import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { Language, getLanguageData } from '@/data/languages';

export class TextRepository implements ITextRepository {
  private currentLanguage: Language = 'ko';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  private getCurrentLanguageData() {
    return getLanguageData(this.currentLanguage);
  }

  getRandomSentence(): string {
    const languageData = this.getCurrentLanguageData();
    const allSentences = [
      ...languageData.sentences.easy,
      ...languageData.sentences.medium,
      ...languageData.sentences.hard
    ];
    return allSentences[Math.floor(Math.random() * allSentences.length)];
  }

  getRandomWords(count: number): string {
    const languageData = this.getCurrentLanguageData();
    const allWords = [
      ...languageData.words.common,
      ...languageData.words.tech,
      ...languageData.words.business
    ];
    
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      selected.push(allWords[Math.floor(Math.random() * allWords.length)]);
    }
    
    return selected.join(' ');
  }

  getSentencesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const languageData = this.getCurrentLanguageData();
    return languageData.sentences[difficulty];
  }

  getWordsByCategory(category: string): string[] {
    const languageData = this.getCurrentLanguageData();
    return languageData.words[category as keyof typeof languageData.words] || [];
  }
}