import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { ITextRepository, SentenceLength, SentenceVariant } from '@/domain/repositories/ITextRepository';

export class StartTypingSessionUseCase {
  constructor(private textRepository: ITextRepository) {}

  execute(
    mode: 'sentence' | 'words', 
    length: SentenceLength = 'short',
    variant: SentenceVariant = 'basic'
  ): TypingSessionEntity {
    const sessionId = this.generateSessionId();
    let text: string;

    if (mode === 'sentence') {
      text = this.textRepository.getRandomSentence(length, variant);
    } else {
      text = this.textRepository.getRandomWords(10);
    }

    return new TypingSessionEntity(sessionId, text, mode);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}