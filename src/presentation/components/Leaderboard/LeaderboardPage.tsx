'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp, 
  Target, 
  Keyboard,
  Users,
  Crown,
  Star
} from 'lucide-react';
import { getUserStatsService } from '@/infrastructure/di/DIContainer';
import { UserStats } from '@/domain/entities/UserStats';
import { TIER_REQUIREMENTS } from '@/domain/entities/TierSystem';
import { Header } from '@/presentation/components/Header/Header';
import { Footer } from '@/presentation/components/Footer/Footer';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [sortBy, setSortBy] = useState<'wpm' | 'cpm' | 'accuracy' | 'totalSessions'>('wpm');
  const [selectedLanguage, setSelectedLanguage] = useState<'ko' | 'en' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>(null);

  const userStatsService = getUserStatsService();

  useEffect(() => {
    loadLeaderboard();
    loadGlobalStats();
  }, [sortBy, selectedLanguage]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await userStatsService.getLeaderboard(sortBy, selectedLanguage, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const stats = await userStatsService.getGlobalStats('weekly');
      setGlobalStats(stats);
    } catch (error) {
      console.error('Failed to load global stats:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatValue = (stats: UserStats, metric: typeof sortBy) => {
    const languageStats = selectedLanguage 
      ? (selectedLanguage === 'ko' ? stats.koreanStats : stats.englishStats)
      : null;

    switch (metric) {
      case 'wpm':
        return languageStats ? languageStats.bestWpm : stats.bestWpm;
      case 'cpm':
        return languageStats ? languageStats.bestCpm : stats.bestCpm;
      case 'accuracy':
        return languageStats ? languageStats.bestAccuracy : stats.bestAccuracy;
      case 'totalSessions':
        return languageStats ? languageStats.sessions : stats.totalSessions;
      default:
        return 0;
    }
  };

  const getStatLabel = (metric: typeof sortBy) => {
    switch (metric) {
      case 'wpm': return 'WPM';
      case 'cpm': return 'CPM';
      case 'accuracy': return '정확도';
      case 'totalSessions': return '세션 수';
    }
  };

  const getStatIcon = (metric: typeof sortBy) => {
    switch (metric) {
      case 'wpm':
      case 'cpm':
        return <TrendingUp className="w-5 h-5" />;
      case 'accuracy':
        return <Target className="w-5 h-5" />;
      case 'totalSessions':
        return <Keyboard className="w-5 h-5" />;
    }
  };

  const formatStatValue = (value: number, metric: typeof sortBy) => {
    if (metric === 'accuracy') {
      return `${Math.round(value)}%`;
    }
    return Math.round(value).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header
        currentLanguage="ko"
        currentTheme="light"
        onThemeChange={() => {}}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 페이지 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <Trophy className="inline-block mr-3 mb-1 text-yellow-500" />
              리더보드
            </h1>
            <p className="text-lg text-gray-600">
              최고의 타이피스트들을 만나보세요
            </p>
          </div>

          {/* 전체 통계 */}
          {globalStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900">{globalStats.totalUsers}</p>
                <p className="text-sm text-gray-600">총 사용자</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Keyboard className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-gray-900">{globalStats.totalSessions}</p>
                <p className="text-sm text-gray-600">주간 세션</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-gray-900">{Math.round(globalStats.averageWpm)}</p>
                <p className="text-sm text-gray-600">평균 WPM</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-gray-900">{Math.round(globalStats.averageAccuracy)}%</p>
                <p className="text-sm text-gray-600">평균 정확도</p>
              </div>
            </div>
          )}

          {/* 필터 옵션 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* 정렬 기준 */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {(['wpm', 'cpm', 'accuracy', 'totalSessions'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSortBy(metric)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    sortBy === metric
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {getStatLabel(metric)}
                </button>
              ))}
            </div>

            {/* 언어 필터 */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {([undefined, 'ko', 'en'] as const).map((lang) => (
                <button
                  key={lang || 'all'}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {!lang ? '전체' : lang === 'ko' ? '한글' : '영어'}
                </button>
              ))}
            </div>
          </div>

          {/* 리더보드 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-center space-x-2">
                {getStatIcon(sortBy)}
                <h2 className="text-2xl font-bold">
                  {getStatLabel(sortBy)} 순위
                </h2>
                {selectedLanguage && (
                  <span className="text-lg">
                    ({selectedLanguage === 'ko' ? '한글' : '영어'})
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">순위를 불러오는 중...</p>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const statValue = getStatValue(user, sortBy);
                  
                  return (
                    <motion.div
                      key={user.userId}
                      className={`p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${
                        rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-transparent' : ''
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* 순위 */}
                      <div className={`
                        flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                        ${getRankBadgeColor(rank)}
                      `}>
                        {rank <= 3 ? getRankIcon(rank) : rank}
                      </div>

                      {/* 사용자 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {user.username || `사용자 ${user.userId.slice(-6)}`}
                          </h3>
                          {rank <= 10 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {user.currentTier && TIER_REQUIREMENTS[user.currentTier] && (
                            <>
                              <div 
                                className="px-2 py-1 rounded text-xs font-medium flex items-center space-x-1"
                                style={{ 
                                  backgroundColor: TIER_REQUIREMENTS[user.currentTier].color + '20',
                                  color: TIER_REQUIREMENTS[user.currentTier].color 
                                }}
                              >
                                <span>{TIER_REQUIREMENTS[user.currentTier].icon}</span>
                                <span>{TIER_REQUIREMENTS[user.currentTier].name.ko}</span>
                              </div>
                              <span>·</span>
                            </>
                          )}
                          <span>
                            총 {user.totalSessions}회 연습 · 
                            {Math.floor(user.totalTimeSpent / 3600)}시간 {Math.floor((user.totalTimeSpent % 3600) / 60)}분
                          </span>
                        </div>
                      </div>

                      {/* 통계 */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatStatValue(statValue, sortBy)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getStatLabel(sortBy)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">아직 순위 데이터가 없습니다.</p>
                <p className="text-sm text-gray-500">
                  첫 번째 순위에 도전해보세요!
                </p>
                <a 
                  href="/"
                  className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  연습 시작하기
                </a>
              </div>
            )}
          </div>

          {/* 하단 링크 */}
          <div className="text-center mt-8">
            <a 
              href="/stats"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              나의 통계 보기 →
            </a>
          </div>
        </motion.div>
      </main>

      <Footer currentLanguage="ko" />
    </div>
  );
}