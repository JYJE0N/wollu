'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Clock,
  Keyboard,
  Award,
  BarChart3,
  Calendar,
  Zap,
  Trophy,
  Crown,
  Medal
} from 'lucide-react';
import { getUserStatsService } from '@/infrastructure/di/DIContainer';
import { UserStats } from '@/domain/entities/UserStats';
import { TierSystem, TIER_REQUIREMENTS } from '@/domain/entities/TierSystem';
import { Header } from '@/presentation/components/Header/Header';
import { Footer } from '@/presentation/components/Footer/Footer';
import { StatisticsCharts } from './StatisticsCharts';

export default function StatsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ko' | 'en'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard'>('stats');
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<'wpm' | 'cpm' | 'accuracy' | 'totalSessions'>('wpm');
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  const userStatsService = getUserStatsService();
  const userId = 'default_user'; // 임시 사용자 ID

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab, leaderboardSortBy, selectedLanguage]);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      const stats = await userStatsService.getUserStats(userId);
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setIsLeaderboardLoading(true);
      const data = await userStatsService.getLeaderboard(leaderboardSortBy, selectedLanguage as any, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  const getLanguageStats = () => {
    if (!userStats) return null;
    if (selectedLanguage === 'ko') return userStats.koreanStats;
    if (selectedLanguage === 'en') return userStats.englishStats;
    return {
      sessions: userStats.totalSessions,
      averageWpm: userStats.averageWpm,
      averageCpm: userStats.averageCpm,
      bestWpm: userStats.bestWpm,
      bestCpm: userStats.bestCpm,
      averageAccuracy: userStats.averageAccuracy,
      bestAccuracy: userStats.bestAccuracy,
    };
  };

  const achievementTitles = {
    'first-10-sessions': '첫 10번 연습',
    'century-sessions': '백 번 도전자',
    'speed-demon-50': '스피드 데몬 50',
    'speed-demon-100': '스피드 데몬 100',
    'accuracy-master-95': '정확도 달인 95%',
    'accuracy-master-99': '정확도 달인 99%',
    'time-warrior-1h': '시간 전사 1시간',
    'time-warrior-10h': '시간 전사 10시간',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const languageStats = getLanguageStats();

  // 티어 진행률 계산
  const tierProgress = userStats ? TierSystem.getTierProgress(
    userStats.currentTier,
    userStats.totalCharsTyped,
    userStats.averageWpm,
    userStats.averageAccuracy,
    userStats.totalSessions
  ) : null;

  const currentTierInfo = userStats ? TIER_REQUIREMENTS[userStats.currentTier] : null;

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
              {activeTab === 'stats' ? (
                <><BarChart3 className="inline-block mr-3 mb-1" />나의 타이핑 통계</>
              ) : (
                <><Trophy className="inline-block mr-3 mb-1" />리더보드</>
              )}
            </h1>
            <p className="text-lg text-gray-600">
              {activeTab === 'stats'
                ? '연습 기록과 성과를 확인해보세요'
                : '다른 사용자들과 실력을 비교해보세요'
              }
            </p>

            {/* 탭 네비게이션 */}
            <div className="flex justify-center mt-6">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  내 통계
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  리더보드
                </button>
              </div>
            </div>
          </div>

          {/* 필터 옵션 */}
          {activeTab === 'stats' && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period === 'daily' ? '일간' : period === 'weekly' ? '주간' : '월간'}
                  </button>
                ))}
              </div>

              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                {(['all', 'ko', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lang === 'all' ? '전체' : lang === 'ko' ? '한글' : '영어'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 리더보드 필터 옵션 */}
          {activeTab === 'leaderboard' && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                {(['wpm', 'cpm', 'accuracy', 'totalSessions'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setLeaderboardSortBy(sort)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      leaderboardSortBy === sort
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sort === 'wpm' ? 'WPM' : sort === 'cpm' ? 'CPM' : sort === 'accuracy' ? '정확도' : '연습 횟수'}
                  </button>
                ))}
              </div>

              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                {(['all', 'ko', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lang === 'all' ? '전체' : lang === 'ko' ? '한글' : '영어'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && userStats ? (
            <div className="space-y-8">
              {/* 티어 정보 카드 */}
              {currentTierInfo && (
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4"
                  style={{ borderLeftColor: currentTierInfo.color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: currentTierInfo.color + '20' }}
                      >
                        {currentTierInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ color: currentTierInfo.color }}>
                          {currentTierInfo.name.ko}
                        </h3>
                        <p className="text-gray-600">
                          {currentTierInfo.description.ko}
                        </p>
                        {tierProgress?.nextTier && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm text-gray-500">
                                다음 티어까지: {Math.round(tierProgress.progressToNext)}%
                              </span>
                            </div>
                            <div className="w-64 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${tierProgress.progressToNext}%`,
                                  backgroundColor: TIER_REQUIREMENTS[tierProgress.nextTier].color
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Crown className="w-8 h-8 mx-auto mb-2" style={{ color: currentTierInfo.color }} />
                      <p className="text-sm text-gray-500">현재 티어</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 통계 차트 섹션 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatisticsCharts userStats={userStats} currentLanguage="ko" />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 주요 통계 카드들 */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* WPM 카드 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">최고 WPM</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {languageStats?.bestWpm || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    평균: {Math.round(languageStats?.averageWpm || 0)} WPM
                  </div>
                </motion.div>

                {/* CPM 카드 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">최고 CPM</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {languageStats?.bestCpm || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    평균: {Math.round(languageStats?.averageCpm || 0)} CPM
                  </div>
                </motion.div>

                {/* 정확도 카드 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Target className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">최고 정확도</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(languageStats?.bestAccuracy || 0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    평균: {Math.round(languageStats?.averageAccuracy || 0)}%
                  </div>
                </motion.div>

                {/* 연습 시간 카드 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">총 연습 시간</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatTime(userStats.totalTimeSpent)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    세션 수: {languageStats?.sessions || 0}회
                  </div>
                </motion.div>

                {/* 총 입력 글자 수 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6 sm:col-span-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Keyboard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">총 입력 글자 수</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {userStats.totalCharsTyped.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>키 스트로크: {userStats.totalKeyStrokes.toLocaleString()}</div>
                    <div>총 오타: {userStats.totalErrors.toLocaleString()}</div>
                  </div>
                </motion.div>
              </div>

              {/* 사이드바 - 성취도 및 순위 */}
              <div className="space-y-6">
                {/* 성취도 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    성취도
                  </h3>
                  <div className="space-y-3">
                    {userStats.achievements.length > 0 ? (
                      userStats.achievements.slice(0, 5).map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-700">
                            {achievementTitles[achievement as keyof typeof achievementTitles] || achievement}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">아직 달성한 성취도가 없습니다.</p>
                    )}
                  </div>
                  {userStats.achievements.length > 5 && (
                    <p className="text-xs text-gray-400 mt-3">
                      +{userStats.achievements.length - 5}개 더
                    </p>
                  )}
                </motion.div>

                {/* 순위 정보 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    순위 정보
                  </h3>
                  <div className="space-y-3 text-sm">
                    {userStats.rank && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">전체 순위:</span>
                        <span className="font-semibold">{userStats.rank}위</span>
                      </div>
                    )}
                    {userStats.percentile && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">상위:</span>
                        <span className="font-semibold">{100 - userStats.percentile}%</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      전체 순위 보기 →
                    </button>
                  </div>
                </motion.div>

                {/* 최근 활동 */}
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-500" />
                    최근 활동
                  </h3>
                  <div className="space-y-3">
                    {userStats.recentSessions.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="text-gray-900 font-medium">{session.wpm} WPM</p>
                          <p className="text-gray-500">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900">{Math.round(session.accuracy)}%</p>
                          <p className="text-gray-500">
                            {session.language === 'ko' ? '한글' : '영어'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {userStats.recentSessions.length === 0 && (
                      <p className="text-sm text-gray-500">최근 연습 기록이 없습니다.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="text-center py-12">
              <p className="text-gray-600">통계 데이터가 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">
                타이핑 연습을 시작해보세요!
              </p>
              <a
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                연습 시작하기
              </a>
            </div>
          ) : null}

          {/* 리더보드 탭 */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-8">
              {isLeaderboardLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">리더보드를 불러오는 중...</p>
                </div>
              ) : (
                <motion.div
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      {leaderboardSortBy === 'wpm' ? 'WPM' :
                       leaderboardSortBy === 'cpm' ? 'CPM' :
                       leaderboardSortBy === 'accuracy' ? '정확도' : '연습 횟수'} 순위
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {leaderboard.map((user, index) => (
                      <div key={user.userId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index < 3 ? (
                              index === 0 ? <Crown className="w-4 h-4" /> :
                              index === 1 ? <Medal className="w-4 h-4" /> :
                              <Award className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.username || `사용자 #${user.userId}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.currentTier} 티어
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {leaderboardSortBy === 'wpm' ? `${user.bestWpm} WPM` :
                             leaderboardSortBy === 'cpm' ? `${user.bestCpm} CPM` :
                             leaderboardSortBy === 'accuracy' ? `${Math.round(user.bestAccuracy)}%` :
                             `${user.totalSessions}회`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedLanguage === 'ko' ? '한글' : selectedLanguage === 'en' ? '영어' : '전체'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {leaderboard.length === 0 && (
                      <div className="px-6 py-8 text-center text-gray-500">
                        리더보드 데이터가 없습니다.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <Footer currentLanguage="ko" />
    </div>
  );
}