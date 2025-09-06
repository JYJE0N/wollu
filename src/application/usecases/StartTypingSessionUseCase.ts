import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { ITextRepository } from '@/domain/repositories/ITextRepository';

export class StartTypingSessionUseCase {
  constructor(private textRepository: ITextRepository) {}

  execute(mode: 'sentence' | 'words', difficulty?: 'easy' | 'medium' | 'hard'): TypingSessionEntity {
    const sessionId = this.generateSessionId();
    let text: string;

    if (mode === 'sentence') {
      if (difficulty) {
        const sentences = this.textRepository.getSentencesByDifficulty(difficulty);
        text = sentences[Math.floor(Math.random() * sentences.length)];
      } else {
        text = this.textRepository.getRandomSentence();
      }
    } else {
      text = this.textRepository.getRandomWords(10);
    }

    return new TypingSessionEntity(sessionId, text, mode);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}