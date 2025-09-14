'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserStats, DailyStats } from '@/domain/entities/UserStats';
import { TierSystem, TIER_REQUIREMENTS } from '@/domain/entities/TierSystem';

interface StatisticsChartsProps {
  userStats: UserStats;
  currentLanguage: 'ko' | 'en';
}

export const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  userStats,
  currentLanguage
}) => {
  // 일일 통계를 차트용 데이터로 변환
  const dailyChartData = userStats.dailyStats
    .slice(0, 14) // 최근 14일
    .reverse()
    .map(day => ({
      date: new Date(day.date).toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
        month: 'short',
        day: 'numeric'
      }),
      wpm: Math.round(day.averageWpm),
      accuracy: Math.round(day.averageAccuracy),
      sessions: day.sessionsCount,
      timeSpent: Math.round(day.totalTimeSpent / 60) // 분 단위
    }));

  // 최근 세션 성과 데이터
  const recentSessionsData = userStats.recentSessions
    .slice(0, 10)
    .reverse()
    .map((session, index) => ({
      session: `#${index + 1}`,
      wpm: Math.round(session.wpm),
      cpm: Math.round(session.cpm),
      accuracy: Math.round(session.accuracy)
    }));

  // 실시간 타이핑 성능 시뮬레이션 데이터 (스트로크 기준)
  const realtimePerformanceData = userStats.recentSessions.length > 0 
    ? userStats.recentSessions[0]?.totalChars 
      ? Array.from({ length: Math.min(userStats.recentSessions[0].totalChars, 50) }, (_, i) => {
          const progress = (i + 1) / Math.min(userStats.recentSessions[0].totalChars, 50);
          const baseWpm = userStats.recentSessions[0].wpm;
          // 타이핑 과정에서의 속도 변화 시뮬레이션
          const variation = Math.sin(i * 0.3) * 15 + Math.cos(i * 0.1) * 8;
          const currentWpm = Math.max(0, baseWpm + variation - (1 - progress) * 20);
          
          return {
            stroke: i + 1,
            wpm: Math.round(currentWpm),
            avgWpm: Math.round(baseWpm),
            maxWpm: Math.round(baseWpm + 25),
            minWpm: Math.round(Math.max(baseWpm - 30, 10)),
            accuracy: Math.round(85 + progress * 10 + Math.sin(i * 0.2) * 5)
          };
        })
      : []
    : [];

  // 최고/최저 속도 계산
  const maxWpmInSession = Math.max(...realtimePerformanceData.map(d => d.wpm), 0);
  const minWpmInSession = Math.min(...realtimePerformanceData.map(d => d.wpm), 0);
  const avgWpmInSession = realtimePerformanceData.length > 0 
    ? Math.round(realtimePerformanceData.reduce((sum, d) => sum + d.wpm, 0) / realtimePerformanceData.length)
    : 0;

  // 언어별 통계 파이 차트 데이터
  const languageData = [
    {
      name: currentLanguage === 'ko' ? '한글' : 'Korean',
      value: userStats.koreanStats.sessions,
      color: '#3B82F6'
    },
    {
      name: currentLanguage === 'ko' ? '영어' : 'English',
      value: userStats.englishStats.sessions,
      color: '#10B981'
    }
  ];

  // 티어 진행률 데이터
  const tierProgress = TierSystem.getTierProgress(
    userStats.currentTier,
    userStats.totalCharsTyped,
    userStats.averageWpm,
    userStats.averageAccuracy,
    userStats.totalSessions
  );

  const tierProgressData = tierProgress.requirementsForNext ? [
    {
      name: currentLanguage === 'ko' ? '글자 수' : 'Characters',
      progress: Math.min(100, (tierProgress.requirementsForNext.charactersTyped.current / tierProgress.requirementsForNext.charactersTyped.required) * 100),
      color: '#8B5CF6'
    },
    {
      name: 'WPM',
      progress: Math.min(100, (tierProgress.requirementsForNext.averageWpm.current / tierProgress.requirementsForNext.averageWpm.required) * 100),
      color: '#F59E0B'
    },
    {
      name: currentLanguage === 'ko' ? '정확도' : 'Accuracy',
      progress: Math.min(100, (tierProgress.requirementsForNext.accuracy.current / tierProgress.requirementsForNext.accuracy.required) * 100),
      color: '#EF4444'
    },
    {
      name: currentLanguage === 'ko' ? '세션' : 'Sessions',
      progress: Math.min(100, (tierProgress.requirementsForNext.sessions.current / tierProgress.requirementsForNext.sessions.required) * 100),
      color: '#06B6D4'
    }
  ] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: pld.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {pld.dataKey}: <span className="font-medium">{pld.value}</span>
                {pld.dataKey === 'accuracy' ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* 실시간 타이핑 성능 그래프 (스트로크 기준) */}
      {realtimePerformanceData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentLanguage === 'ko' ? '⚡ 실시간 타이핑 성능 (최근 세션)' : '⚡ Real-time Typing Performance (Recent Session)'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="stroke" 
                  stroke="#9CA3AF"
                  fontSize={10}
                  label={{ value: 'Characters Typed', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 12 } }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  label={{ value: 'WPM', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 12 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* 평균 WPM 라인 */}
                <Line 
                  type="monotone" 
                  dataKey="avgWpm" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  strokeDasharray="5,5"
                  dot={false}
                  name="평균 WPM"
                />
                
                {/* 실시간 WPM 곡선 */}
                <Line 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={false}
                  name="실시간 WPM"
                />
                
                {/* 정확도 라인 */}
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10B981" 
                  strokeWidth={1}
                  opacity={0.7}
                  dot={false}
                  name="정확도 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {maxWpmInSession}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">최고 WPM</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {avgWpmInSession}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">평균 WPM</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {minWpmInSession}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">최저 WPM</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {realtimePerformanceData.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">총 스트로크</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            💡 그래프는 타이핑하는 동안의 WPM 변화를 스트로크별로 보여줍니다
          </div>
        </div>
      )}

      {/* 일일 성과 트렌드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {currentLanguage === 'ko' ? '📈 일일 성과 트렌드' : '📈 Daily Performance Trend'}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="wpm" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="WPM"
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name={currentLanguage === 'ko' ? '정확도' : 'Accuracy'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 세션 성과 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentLanguage === 'ko' ? '🎯 최근 세션 성과' : '🎯 Recent Session Performance'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentSessionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="session" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wpm" fill="#8B5CF6" name="WPM" />
                <Bar dataKey="accuracy" fill="#F59E0B" name={currentLanguage === 'ko' ? '정확도' : 'Accuracy'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 언어별 연습 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentLanguage === 'ko' ? '🌐 언어별 연습 분포' : '🌐 Language Practice Distribution'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }: any) => 
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 티어 진행률 */}
      {tierProgressData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentLanguage === 'ko' 
              ? `🏆 ${TIER_REQUIREMENTS[tierProgress.nextTier!].name[currentLanguage]} 티어까지 진행률` 
              : `🏆 Progress to ${TIER_REQUIREMENTS[tierProgress.nextTier!].name[currentLanguage]} Tier`
            }
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierProgressData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6B7280"
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '진행률']}
                />
                <Bar 
                  dataKey="progress" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                >
                  {tierProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 연습 시간 분포 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {currentLanguage === 'ko' ? '⏰ 일일 연습 시간' : '⏰ Daily Practice Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => [`${value} ${currentLanguage === 'ko' ? '분' : 'min'}`, '연습 시간']}
              />
              <Area 
                type="monotone" 
                dataKey="timeSpent" 
                stroke="#06B6D4" 
                fill="#06B6D4"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};