export interface SessionRecord {
  id: string;
  date: Date;
  language: 'ko' | 'en';
  practiceMode: 'sentence' | 'words';
  textLength: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  timeElapsed: number;
  totalChars: number;
  correctChars: number;
  errors: number;
  keyStrokes: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  sessionsCount: number;
  totalTimeSpent: number; // in seconds
  averageWpm: number;
  averageCpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestCpm: number;
  bestAccuracy: number;
  totalKeyStrokes: number;
  totalCharsTyped: number;
  totalErrors: number;
}

import { TierLevel } from './TierSystem';

export interface UserStats {
  userId: string;
  username?: string;
  
  // 전체 통계
  totalSessions: number;
  totalTimeSpent: number; // in seconds
  totalKeyStrokes: number;
  totalCharsTyped: number;
  totalErrors: number;
  
  // 최고 기록
  bestWpm: number;
  bestCpm: number;
  bestAccuracy: number;
  longestSession: number; // in seconds
  
  // 평균 통계
  averageWpm: number;
  averageCpm: number;
  averageAccuracy: number;
  averageSessionTime: number; // in seconds
  
  // 언어별 통계
  koreanStats: {
    sessions: number;
    averageWpm: number;
    averageCpm: number;
    bestWpm: number;
    bestCpm: number;
    averageAccuracy: number;
    bestAccuracy: number;
  };
  
  englishStats: {
    sessions: number;
    averageWpm: number;
    averageCpm: number;
    bestWpm: number;
    bestCpm: number;
    averageAccuracy: number;
    bestAccuracy: number;
  };
  
  // 최근 활동
  recentSessions: SessionRecord[];
  dailyStats: DailyStats[];
  
  // 성취도
  achievements: string[];
  
  // 티어 정보
  currentTier: TierLevel;
  
  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
  percentile?: number;
}

export class UserStatsEntity implements UserStats {
  constructor(
    public userId: string,
    public username: string = '',
    public totalSessions: number = 0,
    public totalTimeSpent: number = 0,
    public totalKeyStrokes: number = 0,
    public totalCharsTyped: number = 0,
    public totalErrors: number = 0,
    public bestWpm: number = 0,
    public bestCpm: number = 0,
    public bestAccuracy: number = 0,
    public longestSession: number = 0,
    public averageWpm: number = 0,
    public averageCpm: number = 0,
    public averageAccuracy: number = 0,
    public averageSessionTime: number = 0,
    public koreanStats = {
      sessions: 0,
      averageWpm: 0,
      averageCpm: 0,
      bestWpm: 0,
      bestCpm: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
    },
    public englishStats = {
      sessions: 0,
      averageWpm: 0,
      averageCpm: 0,
      bestWpm: 0,
      bestCpm: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
    },
    public recentSessions: SessionRecord[] = [],
    public dailyStats: DailyStats[] = [],
    public achievements: string[] = [],
    public currentTier: TierLevel = 'BRONZE',
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public rank?: number,
    public percentile?: number
  ) {}

  // 새 세션 기록 추가
  addSessionRecord(session: SessionRecord): { newAchievements: string[]; tierChanged: boolean; oldTier: TierLevel; newTier: TierLevel } {
    // 이전 통계 저장 (티어 변경 감지용)
    const oldStats = {
      charactersTyped: this.totalCharsTyped,
      averageWpm: this.averageWpm,
      accuracy: this.averageAccuracy,
      sessions: this.totalSessions
    };

    this.recentSessions.unshift(session);
    if (this.recentSessions.length > 100) {
      this.recentSessions.pop();
    }
    
    this.updateStats(session);
    this.updateDailyStats(session);
    
    // 티어 업데이트
    const newStats = {
      charactersTyped: this.totalCharsTyped,
      averageWpm: this.averageWpm,
      accuracy: this.averageAccuracy,
      sessions: this.totalSessions
    };
    
    const { TierSystem } = require('./TierSystem');
    const tierCheck = TierSystem.checkForPromotion(oldStats, newStats);
    const oldTier = this.currentTier;
    this.currentTier = TierSystem.calculateTier(
      this.totalCharsTyped,
      this.averageWpm,
      this.averageAccuracy,
      this.totalSessions
    );
    
    const newAchievements = this.checkAchievements();
    this.updatedAt = new Date();
    
    return {
      newAchievements,
      tierChanged: tierCheck.promoted,
      oldTier: tierCheck.oldTier,
      newTier: tierCheck.newTier
    };
  }

  private updateStats(session: SessionRecord): void {
    this.totalSessions++;
    this.totalTimeSpent += session.timeElapsed;
    this.totalKeyStrokes += session.keyStrokes;
    this.totalCharsTyped += session.totalChars;
    this.totalErrors += session.errors;

    // 최고 기록 업데이트
    this.bestWpm = Math.max(this.bestWpm, session.wpm);
    this.bestCpm = Math.max(this.bestCpm, session.cpm);
    this.bestAccuracy = Math.max(this.bestAccuracy, session.accuracy);
    this.longestSession = Math.max(this.longestSession, session.timeElapsed);

    // 평균 계산
    this.averageWpm = this.calculateAverage('wpm');
    this.averageCpm = this.calculateAverage('cpm');
    this.averageAccuracy = this.calculateAverage('accuracy');
    this.averageSessionTime = this.totalTimeSpent / this.totalSessions;

    // 언어별 통계 업데이트
    if (session.language === 'ko') {
      this.updateLanguageStats(this.koreanStats, session);
    } else {
      this.updateLanguageStats(this.englishStats, session);
    }
  }

  private updateLanguageStats(languageStats: any, session: SessionRecord): void {
    const prevSessions = languageStats.sessions;
    languageStats.sessions++;
    
    // 가중 평균 계산
    languageStats.averageWpm = (languageStats.averageWpm * prevSessions + session.wpm) / languageStats.sessions;
    languageStats.averageCpm = (languageStats.averageCpm * prevSessions + session.cpm) / languageStats.sessions;
    languageStats.averageAccuracy = (languageStats.averageAccuracy * prevSessions + session.accuracy) / languageStats.sessions;
    
    // 최고 기록 업데이트
    languageStats.bestWpm = Math.max(languageStats.bestWpm, session.wpm);
    languageStats.bestCpm = Math.max(languageStats.bestCpm, session.cpm);
    languageStats.bestAccuracy = Math.max(languageStats.bestAccuracy, session.accuracy);
  }

  private updateDailyStats(session: SessionRecord): void {
    const dateStr = session.date.toISOString().split('T')[0];
    let dailyStat = this.dailyStats.find(d => d.date === dateStr);
    
    if (!dailyStat) {
      dailyStat = {
        date: dateStr,
        sessionsCount: 0,
        totalTimeSpent: 0,
        averageWpm: 0,
        averageCpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        bestCpm: 0,
        bestAccuracy: 0,
        totalKeyStrokes: 0,
        totalCharsTyped: 0,
        totalErrors: 0,
      };
      this.dailyStats.push(dailyStat);
    }

    const prevSessions = dailyStat.sessionsCount;
    dailyStat.sessionsCount++;
    dailyStat.totalTimeSpent += session.timeElapsed;
    dailyStat.totalKeyStrokes += session.keyStrokes;
    dailyStat.totalCharsTyped += session.totalChars;
    dailyStat.totalErrors += session.errors;

    // 가중 평균 계산
    dailyStat.averageWpm = (dailyStat.averageWpm * prevSessions + session.wpm) / dailyStat.sessionsCount;
    dailyStat.averageCpm = (dailyStat.averageCpm * prevSessions + session.cpm) / dailyStat.sessionsCount;
    dailyStat.averageAccuracy = (dailyStat.averageAccuracy * prevSessions + session.accuracy) / dailyStat.sessionsCount;

    // 최고 기록 업데이트
    dailyStat.bestWpm = Math.max(dailyStat.bestWpm, session.wpm);
    dailyStat.bestCpm = Math.max(dailyStat.bestCpm, session.cpm);
    dailyStat.bestAccuracy = Math.max(dailyStat.bestAccuracy, session.accuracy);

    // 최근 30일 데이터만 유지
    this.dailyStats = this.dailyStats
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
  }

  private calculateAverage(metric: 'wpm' | 'cpm' | 'accuracy'): number {
    if (this.recentSessions.length === 0) return 0;
    const sum = this.recentSessions.reduce((acc, session) => acc + session[metric], 0);
    return sum / this.recentSessions.length;
  }

  // 성취도 확인 및 추가
  checkAchievements(): string[] {
    const newAchievements: string[] = [];
    
    if (this.totalSessions >= 10 && !this.achievements.includes('first-10-sessions')) {
      newAchievements.push('first-10-sessions');
    }
    
    if (this.totalSessions >= 100 && !this.achievements.includes('century-sessions')) {
      newAchievements.push('century-sessions');
    }
    
    if (this.bestWpm >= 50 && !this.achievements.includes('speed-demon-50')) {
      newAchievements.push('speed-demon-50');
    }
    
    if (this.bestWpm >= 100 && !this.achievements.includes('speed-demon-100')) {
      newAchievements.push('speed-demon-100');
    }
    
    if (this.bestAccuracy >= 95 && !this.achievements.includes('accuracy-master-95')) {
      newAchievements.push('accuracy-master-95');
    }
    
    if (this.bestAccuracy >= 99 && !this.achievements.includes('accuracy-master-99')) {
      newAchievements.push('accuracy-master-99');
    }
    
    if (this.totalTimeSpent >= 3600 && !this.achievements.includes('time-warrior-1h')) {
      newAchievements.push('time-warrior-1h');
    }
    
    if (this.totalTimeSpent >= 36000 && !this.achievements.includes('time-warrior-10h')) {
      newAchievements.push('time-warrior-10h');
    }

    this.achievements.push(...newAchievements);
    return newAchievements;
  }
}