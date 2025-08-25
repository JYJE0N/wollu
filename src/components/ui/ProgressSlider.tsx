"use client";

import { useMemo, useEffect, useState, useRef, memo } from "react";

interface ProgressSliderProps {
  value: number; // 0-100 사이의 값
  className?: string;
  showLabel?: boolean;
  customLabel?: string; // 커스텀 라벨 (퍼센테이지 대신)
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'info';
  animated?: boolean; // 스크롤 애니메이션 여부
}

/**
 * 진행율 슬라이더 컴포넌트
 * 슬라이더 위에 진행율 %가 따라 움직이는 UI
 */
export const ProgressSlider = memo(function ProgressSlider({ 
  value, 
  className = "",
  showLabel = true,
  customLabel,
  size = 'md',
  variant = 'primary',
  animated = false
}: ProgressSliderProps) {
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // 값 범위 제한 (0-100)
  const normalizedValue = useMemo(() => {
    return Math.min(100, Math.max(0, value));
  }, [value]);

  // 스크롤 애니메이션을 위한 Intersection Observer
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => observer.disconnect();
  }, [animated, isVisible]);

  // 애니메이션 값 업데이트
  useEffect(() => {
    if (!animated) {
      setAnimatedValue(normalizedValue);
      return;
    }

    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedValue(normalizedValue);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, normalizedValue, animated]);

  const displayValue = animated ? animatedValue : normalizedValue;

  // 크기별 스타일 (메모이제이션)
  const sizeClasses = useMemo(() => ({
    sm: {
      track: "h-1",
      thumb: "w-3 h-3",
      label: "text-xs -top-6"
    },
    md: {
      track: "h-2", 
      thumb: "w-4 h-4",
      label: "text-sm -top-8"
    },
    lg: {
      track: "h-3",
      thumb: "w-5 h-5", 
      label: "text-base -top-10"
    }
  }), []);

  // 색상별 스타일 (그라데이션 포함, 메모이제이션)
  const variantClasses = useMemo(() => ({
    primary: {
      fill: "",
      gradient: "linear-gradient(90deg, var(--color-interactive-secondary), var(--color-interactive-primary))",
      thumb: "bg-white border-white"
    },
    success: {
      fill: "bg-feedback-success",
      gradient: "",
      thumb: "bg-white border-white"
    },
    warning: {
      fill: "bg-feedback-warning",
      gradient: "", 
      thumb: "bg-white border-white"
    },
    info: {
      fill: "bg-feedback-info",
      gradient: "",
      thumb: "bg-white border-white"
    }
  }), []);

  const sizeStyle = sizeClasses[size];
  const variantStyle = variantClasses[variant];

  return (
    <div 
      ref={sliderRef}
      className={`progress-slider relative mx-auto ${className}`} 
      style={{ 
        width: 'clamp(200px, 30vw, 280px)',
        minWidth: '200px',
        maxWidth: '280px'
      }}
    >
      {/* 슬라이더 트랙 */}
      <div className={`slider-track relative ${sizeStyle.track} bg-border rounded-full`} style={{ width: '100%' }}>
        {/* 진행 바 */}
        <div 
          className={`slider-fill ${sizeStyle.track} ${variantStyle.fill} rounded-full transition-all ease-out z-10`}
          style={{ 
            width: `${displayValue}%`,
            background: variantStyle.gradient || undefined,
            transitionDuration: animated ? '1200ms' : '300ms'
          }}
        />
      </div>
      
      {/* 슬라이더 썸 (동그란 핸들) - 트랙 위에 별도 레이어 */}
      <div 
        className={`slider-thumb absolute top-1/2 ${sizeStyle.thumb} ${variantStyle.thumb} border-2 rounded-full shadow-lg transition-all ease-out z-20`}
        style={{ 
          left: `${displayValue}%`,
          transform: 'translate(-50%, -50%)',
          transitionDuration: animated ? '1200ms' : '300ms'
        }}
      />

      {/* 진행율 라벨 (썸과 중앙정렬) - 컨테이너 안에 제한 */}
      {showLabel && (
        <div 
          className={`progress-label absolute ${sizeStyle.label} font-mono font-bold text-text-primary bg-surface px-3 py-2 rounded shadow-md border border-border transition-all ease-out z-30`}
          style={{ 
            left: `${Math.min(Math.max(displayValue, 15), 85)}%`, // 15%~85% 범위로 제한
            transform: 'translateX(-50%)',
            top: '-48px',
            transitionDuration: animated ? '1200ms' : '300ms'
          }}
        >
          {customLabel || `${Math.round(displayValue)}%`}
        </div>
      )}
    </div>
  );
});

/**
 * 시간 기반 진행율 슬라이더
 */
interface TimeProgressSliderProps extends Omit<ProgressSliderProps, 'value'> {
  elapsed: number;
  total: number;
  showTime?: boolean;
}

export function TimeProgressSlider({ 
  elapsed, 
  total, 
  showTime = false,
  ...props 
}: TimeProgressSliderProps) {
  const progress = total > 0 ? (elapsed / total) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 남은 시간 계산
  const remainingTime = Math.max(0, total - elapsed);

  return (
    <div className="space-y-2">
      <ProgressSlider 
        value={progress} 
        {...props} 
        showLabel={true}
        customLabel={formatTime(remainingTime)}
      />
      {showTime && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(total)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * 단어 기반 진행율 슬라이더  
 */
interface WordProgressSliderProps extends Omit<ProgressSliderProps, 'value'> {
  currentWords: number;
  totalWords: number;
  showCount?: boolean;
  elapsedTime?: number; // 경과 시간 (초)
}

export function WordProgressSlider({ 
  currentWords, 
  totalWords, 
  showCount = false,
  elapsedTime = 0,
  ...props 
}: WordProgressSliderProps) {
  const progress = totalWords > 0 ? (currentWords / totalWords) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <ProgressSlider 
        value={progress} 
        {...props} 
        showLabel={true}
        customLabel={formatTime(elapsedTime)}
      />
      {showCount && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{currentWords} 단어</span>
          <span>{totalWords} 단어</span>
        </div>
      )}
    </div>
  );
}

/**
 * 글자(캐릭터) 기반 진행율 슬라이더  
 */
interface CharacterProgressSliderProps extends Omit<ProgressSliderProps, 'value'> {
  currentIndex: number;
  totalLength: number;
  showCount?: boolean;
  elapsedTime?: number; // 경과 시간 (초)
}

export function CharacterProgressSlider({ 
  currentIndex, 
  totalLength, 
  showCount = false,
  elapsedTime = 0,
  ...props 
}: CharacterProgressSliderProps) {
  const progress = totalLength > 0 ? (currentIndex / totalLength) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <ProgressSlider 
        value={progress} 
        {...props} 
        showLabel={true}
        customLabel={formatTime(elapsedTime)}
      />
      {showCount && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{currentIndex} 글자</span>
          <span>{totalLength} 글자</span>
        </div>
      )}
    </div>
  );
}