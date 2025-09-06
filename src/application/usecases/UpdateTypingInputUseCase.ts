import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { TypingStats } from '@/domain/valueObjects/TypingStats';

export class UpdateTypingInputUseCase {
  execute(session: TypingSessionEntity, input: string): TypingStats {
    if (!session.isStarted) {
      session.start();
    }

    session.updateInput(input);

    const stats = TypingStats.calculate(
      session.text,
      input,
      session.getDuration()
    );

    if (stats.isComplete(session.text)) {
      session.complete();
    }

    return stats;
  }
}