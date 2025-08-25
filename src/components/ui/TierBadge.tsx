"use client";

import { IoPersonSharp } from "react-icons/io5";
import { useEffect, useState, memo, useMemo } from "react";
import type { TierConfig } from '@/utils/tierSystem';

interface TierBadgeProps {
  tier: TierConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentile?: boolean;
  currentPercentile?: number;
}

export const TierBadge = memo(function TierBadge({ 
  tier, 
  className = '', 
  size = 'md',
  showLabel = true,
  showPercentile = false,
  currentPercentile = 0
}: TierBadgeProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 사이즈 클래스 메모이제이션
  const sizeClasses = useMemo(() => ({
    sm: { 
      icon: 'w-6 h-6', 
      badge: 'min-w-[18px] h-4 px-1 text-xs', 
      container: 'relative inline-block',
      offset: '-top-1 -right-1'
    },
    md: { 
      icon: 'w-8 h-8', 
      badge: 'min-w-[20px] h-5 px-1 text-xs', 
      container: 'relative inline-block',
      offset: '-top-1 -right-1'
    },
    lg: { 
      icon: 'w-12 h-12', 
      badge: 'min-w-[24px] h-6 px-1.5 text-sm', 
      container: 'relative inline-block',
      offset: '-top-1.5 -right-1.5'
    }
  }), []);

  const { icon: iconSize, badge: badgeSize, container, offset } = sizeClasses[size];

  // 티어별 배지 스타일 - 심플한 스타일 (메모이제이션)
  const badgeStyle = useMemo(() => ({
    backgroundColor: tier.color,
    color: 'black',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }), [tier.color]);

  // 배지 라벨 텍스트 또는 아이콘 - 클라이언트에서만 동적 값 표시 (메모이제이션)
  const badgeContent = useMemo(() => {
    if (showPercentile && isClient && currentPercentile > 0) {
      if (currentPercentile >= 99) {
        return '99+';
      }
      return `${currentPercentile}`;
    }
    
    // 기본적으로는 이모지 텍스트 (다이아몬드 포함)
    return tier.icon;
  }, [showPercentile, isClient, currentPercentile, tier.icon]);

  return (
    <div className={`${container} ${className}`}>
      {/* 메인 아이콘 */}
      <IoPersonSharp 
        className={`${iconSize}`}
        style={{ 
          color: 'var(--color-text-primary)',
        }}
      />
      
      {/* 티어 배지 - 메시지 알림 스타일 */}
      <div 
        className={`absolute ${offset} ${badgeSize} rounded-full flex items-center justify-center font-bold transition-all duration-200 hover:scale-110`}
        style={badgeStyle}
      >
        <span className="leading-none select-none whitespace-nowrap flex items-center justify-center">
          {badgeContent}
        </span>
      </div>
      
      {/* 티어 라벨 (선택사항) */}
      {showLabel && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span 
            className="text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
            style={{
              backgroundColor: `${tier.color}15`,
              color: tier.color,
              border: `1px solid ${tier.color}30`
            }}
          >
            {tier.name}
          </span>
        </div>
      )}
    </div>
  );
});

// 간단한 티어 배지 (라벨 없음)
export function SimpleTierBadge({ 
  tier, 
  className = '', 
  size = 'sm' 
}: Pick<TierBadgeProps, 'tier' | 'className' | 'size'>) {
  return (
    <TierBadge 
      tier={tier}
      className={className}
      size={size}
      showLabel={false}
    />
  );
}

// 백분위수 표시 배지
export function PercentileTierBadge({ 
  tier, 
  currentPercentile,
  className = '', 
  size = 'md' 
}: Required<Pick<TierBadgeProps, 'tier' | 'currentPercentile'>> & Pick<TierBadgeProps, 'className' | 'size'>) {
  return (
    <TierBadge 
      tier={tier}
      currentPercentile={currentPercentile}
      className={className}
      size={size}
      showLabel={true}
      showPercentile={true}
    />
  );
}

// 특별한 성취 배지 (신기록, 승급 등)
export function AchievementBadge({ 
  achievement = 'NEW',
  className = '', 
  size = 'md' 
}: Omit<Pick<TierBadgeProps, 'tier' | 'className' | 'size'>, 'tier'> & { achievement?: string }) {
  const getBadgeStyle = () => {
    return {
      backgroundColor: '#ff4757', // 빨간색 (알림용)
      color: 'black',
      boxShadow: '0 2px 12px rgba(255,71,87,0.3)',
      animation: 'pulse 2s infinite'
    };
  };

  const sizeClasses = {
    sm: { icon: 'w-6 h-6', badge: 'min-w-[20px] h-4 px-1 text-xs', offset: '-top-1 -right-1' },
    md: { icon: 'w-8 h-8', badge: 'min-w-[24px] h-5 px-1 text-xs', offset: '-top-1 -right-1' },
    lg: { icon: 'w-12 h-12', badge: 'min-w-[28px] h-6 px-1.5 text-sm', offset: '-top-1.5 -right-1.5' }
  };

  const { icon: iconSize, badge: badgeSize, offset } = sizeClasses[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <IoPersonSharp 
        className={iconSize}
        style={{ color: 'var(--color-text-primary)' }}
      />
      
      <div 
        className={`absolute ${offset} ${badgeSize} rounded-full flex items-center justify-center font-bold`}
        style={getBadgeStyle()}
      >
        <span className="leading-none select-none whitespace-nowrap">
          {achievement}
        </span>
      </div>
    </div>
  );
}