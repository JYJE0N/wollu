import { ITextRepository } from '@/domain/repositories/ITextRepository';
import { IHangulService } from '@/domain/services/HangulService';
import { HangulService } from '@/domain/services/HangulService';
import { TextRepository } from '../repositories/TextRepository';
import { IStorageService, LocalStorageService } from '../services/StorageService';
import { TypingSessionService } from '@/application/services/TypingSessionService';
import { IUserStatsRepository } from '@/domain/repositories/IUserStatsRepository';
import { LocalStorageUserStatsRepository } from '@/infrastructure/repositories/LocalStorageUserStatsRepository';
import { IUserStatsService, UserStatsService } from '@/domain/services/UserStatsService';

class DIContainer {
  private static instance: DIContainer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private registerServices(): void {
    // Infrastructure
    this.services.set('ITextRepository', new TextRepository());
    this.services.set('IStorageService', new LocalStorageService());
    this.services.set('IUserStatsRepository', new LocalStorageUserStatsRepository());
    
    // Domain Services
    this.services.set('IHangulService', new HangulService());
    
    const userStatsRepository = this.services.get('IUserStatsRepository');
    this.services.set('IUserStatsService', new UserStatsService(userStatsRepository));
    
    // Application Services
    const textRepository = this.services.get('ITextRepository');
    const storageService = this.services.get('IStorageService');
    this.services.set(
      'TypingSessionService',
      new TypingSessionService(textRepository, storageService)
    );
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in DI container`);
    }
    return service as T;
  }

  // 테스트를 위한 서비스 교체 메서드
  replace<T>(serviceName: string, instance: T): void {
    this.services.set(serviceName, instance);
  }

  // 테스트를 위한 초기화 메서드
  reset(): void {
    this.services.clear();
    this.registerServices();
  }
}

export const diContainer = DIContainer.getInstance();

// 타입 안전성을 위한 헬퍼 함수들
export function getTextRepository(): ITextRepository {
  return diContainer.get<ITextRepository>('ITextRepository');
}

export function getStorageService(): IStorageService {
  return diContainer.get<IStorageService>('IStorageService');
}

export function getHangulService(): IHangulService {
  return diContainer.get<IHangulService>('IHangulService');
}

export function getTypingSessionService(): TypingSessionService {
  return diContainer.get<TypingSessionService>('TypingSessionService');
}

export function getUserStatsRepository(): IUserStatsRepository {
  return diContainer.get<IUserStatsRepository>('IUserStatsRepository');
}

export function getUserStatsService(): IUserStatsService {
  return diContainer.get<IUserStatsService>('IUserStatsService');
}