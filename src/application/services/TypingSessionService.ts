import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { TypingStats } from '@/domain/valueObjects/TypingStats';
import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { IStorageService } from '@/infrastructure/services/StorageService';
import { StartTypingSessionUseCase } from '../usecases/StartTypingSessionUseCase';
import { UpdateTypingInputUseCase } from '../usecases/UpdateTypingInputUseCase';

export class TypingSessionService {
  private currentSession: TypingSessionEntity | null = null;
  private startSessionUseCase: StartTypingSessionUseCase;
  private updateInputUseCase: UpdateTypingInputUseCase;

  constructor(
    private textRepository: ITextRepository,
    private storageService: IStorageService
  ) {
    this.startSessionUseCase = new StartTypingSessionUseCase(textRepository);
    this.updateInputUseCase = new UpdateTypingInputUseCase();
    this.loadSession();
  }

  startNewSession(mode: 'sentence' | 'words', difficulty?: 'easy' | 'medium' | 'hard'): TypingSessionEntity {
    this.currentSession = this.startSessionUseCase.execute(mode, difficulty);
    this.saveSession();
    return this.currentSession;
  }

  updateInput(input: string): TypingStats | null {
    if (!this.currentSession) {
      return null;
    }

    const stats = this.updateInputUseCase.execute(this.currentSession, input);
    this.saveSession();
    return stats;
  }

  getCurrentSession(): TypingSessionEntity | null {
    return this.currentSession;
  }

  resetSession(): void {
    if (this.currentSession) {
      this.currentSession.reset();
      this.saveSession();
    }
  }

  getSessionHistory(): TypingSessionEntity[] {
    const history = this.storageService.load<TypingSessionEntity[]>('typing_history');
    return history || [];
  }

  saveSessionToHistory(): void {
    if (!this.currentSession || !this.currentSession.isCompleted) {
      return;
    }

    const history = this.getSessionHistory();
    history.push(this.currentSession);
    
    // 최근 50개 세션만 유지
    const recentHistory = history.slice(-50);
    this.storageService.save('typing_history', recentHistory);
  }

  private saveSession(): void {
    if (this.currentSession) {
      this.storageService.save('current_session', this.currentSession);
    }
  }

  private loadSession(): void {
    const saved = this.storageService.load<TypingSessionEntity>('current_session');
    if (saved && !saved.isCompleted) {
      this.currentSession = Object.assign(
        new TypingSessionEntity(saved.id, saved.text, saved.mode),
        saved
      );
    }
  }
}