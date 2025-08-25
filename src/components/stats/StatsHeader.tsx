"use client";

// import { useUserProgressStore } from '@/stores/userProgressStore'; // 현재 미사용
// import { SimpleTierBadge } from '@/components/ui/TierBadge';
// import { defaultTierSystem } from '@/utils/tierSystem';

interface StatsHeaderProps {
  className?: string;
  language: 'korean' | 'english';
  testMode: 'words' | 'sentences';
  testTarget: number;
  sentenceLength: 'short' | 'medium' | 'long';
  sentenceStyle: 'plain' | 'punctuation' | 'numbers' | 'mixed';
}

export function StatsHeader({
  className = '',
  language,
  testMode,
  testTarget,
  sentenceLength,
  sentenceStyle
}: StatsHeaderProps) {
  // const { bestCPM, averageSpeed, totalTests } = useUserProgressStore();

  // 현재 사용자의 티어 정보 계산 (미사용)
  // const currentStats = {
  //   averageCPM: bestCPM || averageSpeed || 0,
  //   averageAccuracy: 90, // 임시값
  //   averageConsistency: 80, // 임시값
  //   totalTests: totalTests || 0
  // };

  // const currentTier = defaultTierSystem.calculateCurrentTier(currentStats);

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          통계 및 분석
        </h1>
        
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* 언어 칩 */}
        <span className="context-chip">
          {language === 'korean' ? '한글' : 'English'}
        </span>
        
        {/* 모드 칩 */}
        <span className="context-chip">
          {testMode === 'words' ? '단어' : '문장'}
        </span>
        
        {/* 목표 칩 */}
        <span className="context-chip">
          {testMode === 'words' ? `${testTarget}단어` : `${testTarget}문장`}
        </span>
        
        {/* 길이 칩 */}
        <span className="context-chip">
          {sentenceLength === 'short' ? '단문' : sentenceLength === 'medium' ? '중문' : '장문'}
        </span>
        
        {/* 스타일 칩 */}
        <span className="context-chip">
          {sentenceStyle === 'plain' ? '일반' : 
           sentenceStyle === 'punctuation' ? '구두점' : 
           sentenceStyle === 'numbers' ? '숫자' : '혼합'}
        </span>
      </div>
    </div>
  );
}