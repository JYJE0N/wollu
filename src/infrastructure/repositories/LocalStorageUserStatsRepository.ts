import { IUserStatsRepository } from '@/domain/repositories/IUserStatsRepository';
import { UserStats, SessionRecord, UserStatsEntity } from '@/domain/entities/UserStats';

export class LocalStorageUserStatsRepository implements IUserStatsRepository {
  private readonly STATS_KEY = 'wollu_user_stats';
  private readonly SESSIONS_KEY = 'wollu_sessions';
  private readonly GLOBAL_STATS_KEY = 'wollu_global_stats';

  async getUserStats(userId: string): Promise<UserStats | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(`${this.STATS_KEY}_${userId}`);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Date 객체 복원
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.updatedAt = new Date(parsed.updatedAt);
      parsed.recentSessions = parsed.recentSessions.map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }));
      
      return parsed;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }

  async saveUserStats(userStats: UserStats): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`${this.STATS_KEY}_${userStats.userId}`, JSON.stringify(userStats));
      
      // 전체 사용자 목록 업데이트
      await this.updateUsersList(userStats.userId);
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  async saveSessionRecord(userId: string, session: SessionRecord): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionsData = localStorage.getItem(`${this.SESSIONS_KEY}_${userId}`);
      let sessions: SessionRecord[] = sessionsData ? JSON.parse(sessionsData) : [];
      
      sessions.unshift(session);
      
      // 최대 1000개 세션만 보관
      if (sessions.length > 1000) {
        sessions = sessions.slice(0, 1000);
      }
      
      localStorage.setItem(`${this.SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session record:', error);
    }
  }

  async getLeaderboard(
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en',
    limit: number = 50,
    offset: number = 0
  ): Promise<UserStats[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const userIds = await this.getAllUserIds();
      const userStats: UserStats[] = [];
      
      for (const userId of userIds) {
        const stats = await this.getUserStats(userId);
        if (stats) {
          userStats.push(stats);
        }
      }
      
      // 정렬 기준에 따라 정렬
      userStats.sort((a, b) => {
        let aValue: number;
        let bValue: number;
        
        if (language) {
          const langStats = language === 'ko' ? 'koreanStats' : 'englishStats';
          switch (sortBy) {
            case 'wpm':
              aValue = a[langStats].bestWpm;
              bValue = b[langStats].bestWpm;
              break;
            case 'cpm':
              aValue = a[langStats].bestCpm;
              bValue = b[langStats].bestCpm;
              break;
            case 'accuracy':
              aValue = a[langStats].bestAccuracy;
              bValue = b[langStats].bestAccuracy;
              break;
            case 'totalSessions':
              aValue = a[langStats].sessions;
              bValue = b[langStats].sessions;
              break;
            default:
              aValue = 0;
              bValue = 0;
          }
        } else {
          switch (sortBy) {
            case 'wpm':
              aValue = a.bestWpm;
              bValue = b.bestWpm;
              break;
            case 'cpm':
              aValue = a.bestCpm;
              bValue = b.bestCpm;
              break;
            case 'accuracy':
              aValue = a.bestAccuracy;
              bValue = b.bestAccuracy;
              break;
            case 'totalSessions':
              aValue = a.totalSessions;
              bValue = b.totalSessions;
              break;
            default:
              aValue = 0;
              bValue = 0;
          }
        }
        
        return bValue - aValue; // 내림차순 정렬
      });
      
      // 순위 정보 추가
      userStats.forEach((stats, index) => {
        stats.rank = index + 1;
        stats.percentile = Math.round(((userStats.length - index) / userStats.length) * 100);
      });
      
      return userStats.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  async getUserRank(
    userId: string,
    sortBy: 'wpm' | 'cpm' | 'accuracy' | 'totalSessions',
    language?: 'ko' | 'en'
  ): Promise<number> {
    const leaderboard = await this.getLeaderboard(sortBy, language, 1000);
    const userIndex = leaderboard.findIndex(stats => stats.userId === userId);
    return userIndex >= 0 ? userIndex + 1 : -1;
  }

  async getTotalUsersCount(): Promise<number> {
    const userIds = await this.getAllUserIds();
    return userIds.length;
  }

  async getGlobalStats(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalSessions: number;
    totalUsers: number;
    averageWpm: number;
    averageCpm: number;
    averageAccuracy: number;
  }> {
    if (typeof window === 'undefined') {
      return {
        totalSessions: 0,
        totalUsers: 0,
        averageWpm: 0,
        averageCpm: 0,
        averageAccuracy: 0,
      };
    }
    
    try {
      const userIds = await this.getAllUserIds();
      let totalSessions = 0;
      let totalWpm = 0;
      let totalCpm = 0;
      let totalAccuracy = 0;
      let validUsers = 0;
      
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (period) {
        case 'daily':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      for (const userId of userIds) {
        const sessions = localStorage.getItem(`${this.SESSIONS_KEY}_${userId}`);
        if (sessions) {
          const sessionRecords: SessionRecord[] = JSON.parse(sessions);
          const recentSessions = sessionRecords.filter(
            session => new Date(session.date) >= cutoffDate
          );
          
          if (recentSessions.length > 0) {
            totalSessions += recentSessions.length;
            totalWpm += recentSessions.reduce((sum, s) => sum + s.wpm, 0);
            totalCpm += recentSessions.reduce((sum, s) => sum + s.cpm, 0);
            totalAccuracy += recentSessions.reduce((sum, s) => sum + s.accuracy, 0);
            validUsers++;
          }
        }
      }
      
      return {
        totalSessions,
        totalUsers: userIds.length,
        averageWpm: totalSessions > 0 ? totalWpm / totalSessions : 0,
        averageCpm: totalSessions > 0 ? totalCpm / totalSessions : 0,
        averageAccuracy: totalSessions > 0 ? totalAccuracy / totalSessions : 0,
      };
    } catch (error) {
      console.error('Failed to get global stats:', error);
      return {
        totalSessions: 0,
        totalUsers: 0,
        averageWpm: 0,
        averageCpm: 0,
        averageAccuracy: 0,
      };
    }
  }

  private async updateUsersList(userId: string): Promise<void> {
    try {
      const usersData = localStorage.getItem('wollu_users_list');
      let userIds: string[] = usersData ? JSON.parse(usersData) : [];
      
      if (!userIds.includes(userId)) {
        userIds.push(userId);
        localStorage.setItem('wollu_users_list', JSON.stringify(userIds));
      }
    } catch (error) {
      console.error('Failed to update users list:', error);
    }
  }

  private async getAllUserIds(): Promise<string[]> {
    try {
      const usersData = localStorage.getItem('wollu_users_list');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Failed to get user ids:', error);
      return [];
    }
  }
}