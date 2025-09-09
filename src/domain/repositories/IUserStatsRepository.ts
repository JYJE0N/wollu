import { UserStats, SessionRecord } from '@/domain/entities/UserStats';

export interface IUserStatsRepository {
  // 사용자 통계 조회
  getUserStats(userId: string): Promise<UserStats | null>;
  
  // 사용자 통계 저장/업데이트
  saveUserStats(userStats: UserStats): Promise<void>;
  
  // 세션 기록 저장
  saveSessionRecord(userId: string, session: SessionRecord): Promise<void>;
  
  // 전체 순위 조회 (페이지네이션)
  getLeaderboard(
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en',
    limit?: number,
    offset?: number
  ): Promise<UserStats[]>;
  
  // 사용자 순위 조회
  getUserRank(
    userId: string,
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en'
  ): Promise<number>;
  
  // 전체 사용자 수
  getTotalUsersCount(): Promise<number>;
  
  // 일간/주간/월간 통계
  getGlobalStats(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalSessions: number;
    totalUsers: number;
    averageWpm: number;
    averageCpm: number;
    averageAccuracy: number;
  }>;
}