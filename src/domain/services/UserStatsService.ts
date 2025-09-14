import { UserStats, UserStatsEntity, SessionRecord } from '@/domain/entities/UserStats';
import { IUserStatsRepository } from '@/domain/repositories/IUserStatsRepository';

export interface IUserStatsService {
  getUserStats(userId: string): Promise<UserStats>;
  recordSession(userId: string, sessionData: Omit<SessionRecord, 'id' | 'date'>): Promise<{
    newAchievements: string[];
    tierChanged: boolean;
    oldTier?: import('@/domain/entities/TierSystem').TierLevel;
    newTier?: import('@/domain/entities/TierSystem').TierLevel;
  }>;
  getLeaderboard(sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions', language?: 'ko' | 'en', limit?: number): Promise<UserStats[]>;
  getUserRank(userId: string, sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions', language?: 'ko' | 'en'): Promise<{ rank: number; total: number; percentile: number }>;
  getGlobalStats(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    topUsers: UserStats[];
    totalUsers: number;
    totalSessions: number;
  }>;
}

export class UserStatsService implements IUserStatsService {
  constructor(private userStatsRepository: IUserStatsRepository) {}

  async getUserStats(userId: string): Promise<UserStats> {
    let userStats = await this.userStatsRepository.getUserStats(userId);
    
    if (!userStats) {
      // 새 사용자 통계 생성
      userStats = new UserStatsEntity(userId);
      await this.userStatsRepository.saveUserStats(userStats);
    }
    
    return userStats;
  }

  async recordSession(
    userId: string, 
    sessionData: Omit<SessionRecord, 'id' | 'date'>
  ): Promise<{
    newAchievements: string[];
    tierChanged: boolean;
    oldTier?: import('@/domain/entities/TierSystem').TierLevel;
    newTier?: import('@/domain/entities/TierSystem').TierLevel;
  }> {
    const userStats = await this.getUserStats(userId);
    
    // 세션 레코드 생성
    const sessionRecord: SessionRecord = {
      id: this.generateSessionId(),
      date: new Date(),
      ...sessionData
    };

    // 사용자 통계 업데이트
    const userStatsEntity = new UserStatsEntity(
      userStats.userId,
      userStats.username,
      userStats.totalSessions,
      userStats.totalTimeSpent,
      userStats.totalKeyStrokes,
      userStats.totalCharsTyped,
      userStats.totalErrors,
      userStats.bestWpm,
      userStats.bestCpm,
      userStats.bestAccuracy,
      userStats.longestSession,
      userStats.averageWpm,
      userStats.averageCpm,
      userStats.averageAccuracy,
      userStats.averageSessionTime,
      userStats.koreanStats,
      userStats.englishStats,
      userStats.recentSessions,
      userStats.dailyStats,
      userStats.achievements,
      userStats.currentTier,
      userStats.createdAt,
      userStats.updatedAt,
      userStats.rank,
      userStats.percentile
    );

    const sessionResult = userStatsEntity.addSessionRecord(sessionRecord);

    // 저장
    await this.userStatsRepository.saveSessionRecord(userId, sessionRecord);
    await this.userStatsRepository.saveUserStats(userStatsEntity);

    return sessionResult;
  }

  async getLeaderboard(
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en',
    limit: number = 50
  ): Promise<UserStats[]> {
    return await this.userStatsRepository.getLeaderboard(sortBy, language, limit);
  }

  async getUserRank(
    userId: string,
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en'
  ): Promise<{ rank: number; total: number; percentile: number }> {
    const [rank, total] = await Promise.all([
      this.userStatsRepository.getUserRank(userId, sortBy, language),
      this.userStatsRepository.getTotalUsersCount()
    ]);

    const percentile = total > 0 ? Math.round(((total - rank + 1) / total) * 100) : 0;

    return { rank, total, percentile };
  }

  async getGlobalStats(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    topUsers: UserStats[];
    totalUsers: number;
    totalSessions: number;
  }> {
    const stats = await this.userStatsRepository.getGlobalStats(period);
    // 임시로 topUsers를 빈 배열로 반환
    return {
      topUsers: [],
      totalUsers: stats.totalUsers,
      totalSessions: stats.totalSessions
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}