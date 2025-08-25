"use client";

import { useEffect, useState } from 'react';
import { useUserProgressStore } from '@/stores/userProgressStore';
import { aiRecommendationEngine, type Recommendation, type UserAnalysis } from '@/utils/aiRecommendationEngine';
import { IoBulb, IoPlay, IoTrendingUp, IoTime } from 'react-icons/io5';
import { Target } from 'lucide-react';
import { FaRobot, FaBrain } from 'react-icons/fa6';

interface RecommendationSectionProps {
  className?: string;
}

export function RecommendationSection({ className = "" }: RecommendationSectionProps) {
  const {
    recentTests,
    weakCharacters,
    commonMistakes,
    isLoading
  } = useUserProgressStore();

  const [userAnalysis, setUserAnalysis] = useState<UserAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    if (isLoading || !recentTests) return;

    setIsAnalyzing(true);
    
    // CharacterStats를 WeakCharacter로 변환
    const convertedWeakCharacters = (weakCharacters || []).map(char => ({
      char: char.char,
      errorCount: char.mistakes,
      totalCount: char.totalAttempts,
      errorRate: char.totalAttempts > 0 ? (char.mistakes / char.totalAttempts) * 100 : 0,
      lastSeen: new Date()
    }));

    // MistakePattern으로 변환
    const convertedCommonMistakes = (commonMistakes || []).map(mistake => ({
      intended: mistake.correct,
      typed: mistake.wrong,
      count: mistake.count,
      lastOccurrence: new Date()
    }));

    // AI 분석 수행
    const analysis = aiRecommendationEngine.analyzeUser(
      recentTests,
      convertedWeakCharacters,
      convertedCommonMistakes
    );
    
    const recs = aiRecommendationEngine.generateRecommendations(analysis);
    
    setUserAnalysis(analysis);
    setRecommendations(recs);
    setIsAnalyzing(false);
  }, [recentTests, weakCharacters, commonMistakes, isLoading]);

  const handleStartPractice = (recommendation: Recommendation) => {
    // URL 파라미터로 설정 전달하여 메인 페이지로 이동
    const params = new URLSearchParams();
    params.set('language', recommendation.practiceSettings.language);
    params.set('textType', recommendation.practiceSettings.textType);
    params.set('testMode', recommendation.practiceSettings.testMode);
    params.set('testTarget', recommendation.practiceSettings.testTarget.toString());
    
    if (recommendation.practiceSettings.sentenceLength) {
      params.set('sentenceLength', recommendation.practiceSettings.sentenceLength);
    }
    if (recommendation.practiceSettings.sentenceStyle) {
      params.set('sentenceStyle', recommendation.practiceSettings.sentenceStyle);
    }
    if (recommendation.practiceSettings.focusCharacters) {
      params.set('focusCharacters', recommendation.practiceSettings.focusCharacters.join(','));
    }
    
    window.location.href = `/?${params.toString()}`;
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'var(--color-feedback-error)';
      case 'medium': return 'var(--color-feedback-warning)';
      case 'low': return 'var(--color-feedback-info)';
    }
  };

  const getPriorityLabel = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
    }
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'character_focus': return <Target className="w-5 h-5" />;
      case 'speed_building': return <IoTrendingUp className="w-5 h-5" />;
      case 'accuracy_training': return <Target className="w-5 h-5" />;
      case 'consistency_drill': return <IoTime className="w-5 h-5" />;
      case 'mixed_practice': return <IoBulb className="w-5 h-5" />;
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`text-sm ${i < level ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (isLoading || isAnalyzing) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="stats-card-header">
          <div className="flex items-center gap-3">
            <FaRobot className="w-6 h-6" style={{ color: 'var(--color-interactive-primary)' }} />
            <h2 className="stats-title">AI 맞춤 연습 추천</h2>
          </div>
        </div>
        <div className="stats-card-content">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <FaBrain className="w-12 h-12 animate-pulse" style={{ color: 'var(--color-interactive-primary)' }} />
              <p className="stats-description">AI가 타이핑 패턴을 분석하고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userAnalysis || recommendations.length === 0) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="stats-card-header">
          <div className="flex items-center gap-3">
            <FaRobot className="w-6 h-6" style={{ color: 'var(--color-interactive-primary)' }} />
            <h2 className="stats-title">AI 맞춤 연습 추천</h2>
          </div>
        </div>
        <div className="stats-card-content">
          <div className="flex items-center justify-center py-8">
            <p className="stats-description">더 많은 테스트 데이터가 필요합니다. 몇 번의 연습 후에 개인화된 추천을 받아보세요!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card-header">
        <div className="flex items-center gap-3">
          <FaRobot className="w-6 h-6" style={{ color: 'var(--color-interactive-primary)' }} />
          <h2 className="stats-title">AI 맞춤 연습 추천</h2>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <FaBrain className="w-4 h-4" />
          <span>{userAnalysis.totalTests}회 테스트 분석 완료</span>
        </div>
      </div>

      <div className="stats-card-content space-y-4">
        {/* 사용자 분석 요약 - 모바일 최적화 */}
        <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1 md:grid-cols-3'} gap-3 p-3 rounded-lg`}
             style={{ backgroundColor: 'var(--color-background-elevated)' }}>
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl font-bold' : 'stats-metric-medium'}`} style={{ color: 'var(--color-interactive-primary)' }}>
              {Math.round(userAnalysis.averageCPM)}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'stats-caption'}`}>평균 CPM</div>
          </div>
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl font-bold' : 'stats-metric-medium'}`} style={{ color: 'var(--color-feedback-success)' }}>
              {userAnalysis.averageAccuracy.toFixed(1)}%
            </div>
            <div className={`${isMobile ? 'text-xs' : 'stats-caption'}`}>평균 정확도</div>
          </div>
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl font-bold' : 'stats-metric-medium'}`} style={{ color: 'var(--color-feedback-warning)' }}>
              {userAnalysis.averageConsistency.toFixed(1)}%
            </div>
            <div className={`${isMobile ? 'text-xs' : 'stats-caption'}`}>평균 일관성</div>
          </div>
        </div>

        {/* 트렌드 및 분석 - 모바일 최적화 */}
        <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border-l-4`}
             style={{ 
               backgroundColor: 'var(--color-background-elevated)',
               borderLeftColor: userAnalysis.recentTrend === 'improving' ? 'var(--color-feedback-success)' :
                                userAnalysis.recentTrend === 'declining' ? 'var(--color-feedback-error)' :
                                'var(--color-interactive-primary)'
             }}>
          <div>
            <div className={`${isMobile ? 'text-sm' : ''} font-semibold mb-1`} style={{ color: 'var(--color-text-primary)' }}>
              최근 트렌드: {
                userAnalysis.recentTrend === 'improving' ? '개선 중' :
                userAnalysis.recentTrend === 'declining' ? '하락 중' :
                '안정적'
              }
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--color-text-secondary)' }}>
              {userAnalysis.strengthAreas.length > 0 && (
                <div>강점: {userAnalysis.strengthAreas.join(', ')}</div>
              )}
              {userAnalysis.improvementAreas.length > 0 && (
                <div>개선: {userAnalysis.improvementAreas.join(', ')}</div>
              )}
            </div>
          </div>
        </div>

        {/* AI 추천 목록 */}
        <div className="space-y-4">
          <h3 className="stats-subtitle">맞춤형 연습 추천</h3>
          
          {recommendations.map((recommendation, index) => (
            <div 
              key={index}
              className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border transition-all duration-200 hover:shadow-md`}
              style={{ 
                backgroundColor: 'var(--color-background-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between gap-4'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-start'} gap-3 flex-grow`}>
                  {!isMobile && (
                    <div className="p-2 rounded-lg" 
                         style={{ backgroundColor: `${getPriorityColor(recommendation.priority)}20` }}>
                      {getTypeIcon(recommendation.type)}
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'} mb-2`}>
                      <div className="flex items-center gap-2">
                        {isMobile && getTypeIcon(recommendation.type)}
                        <h4 className={`font-semibold ${isMobile ? 'text-sm' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                          {recommendation.title}
                        </h4>
                      </div>
                      <span 
                        className={`${isMobile ? 'self-start' : ''} px-2 py-1 rounded text-xs font-semibold`}
                        style={{ 
                          backgroundColor: `${getPriorityColor(recommendation.priority)}20`,
                          color: getPriorityColor(recommendation.priority)
                        }}
                      >
                        {getPriorityLabel(recommendation.priority)}
                      </span>
                    </div>
                    
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} mb-3`} style={{ color: 'var(--color-text-secondary)' }}>
                      {recommendation.description}
                    </p>
                    
                    <div className={`flex ${isMobile ? 'flex-wrap' : 'items-center'} gap-3 text-xs`} style={{ color: 'var(--color-text-tertiary)' }}>
                      <div className="flex items-center gap-1">
                        <IoTrendingUp className="w-3 h-3" />
                        <span>개선: {Math.round(recommendation.estimatedImpact)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoTime className="w-3 h-3" />
                        <span>{recommendation.expectedDuration}분</span>
                      </div>
                      {!isMobile && (
                        <div className="flex items-center gap-1">
                          <span>난이도:</span>
                          <span className="flex">{getDifficultyStars(recommendation.difficultyLevel)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleStartPractice(recommendation)}
                  className={`flex items-center justify-center gap-2 ${isMobile ? 'w-full px-4 py-3' : 'px-4 py-2'} rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95`}
                  style={{
                    backgroundColor: 'var(--color-interactive-primary)',
                    color: 'var(--color-text-on-primary)',
                    boxShadow: 'var(--chart-shadow-medium)'
                  }}
                >
                  <IoPlay className="w-4 h-4" />
                  연습 시작
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 안내 - 모바일 최적화 */}
        {!isMobile && (
          <div className="text-center p-4 rounded-lg" 
               style={{ backgroundColor: 'var(--color-interactive-primary)15' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              AI 추천은 최근 20회 테스트 데이터를 기반으로 합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}