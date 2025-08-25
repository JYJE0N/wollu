"use client";

import React from 'react';
import { buttonGroupStyles, cn } from '@/utils/styles';

interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ButtonGroup({ 
  options, 
  value, 
  onChange, 
  size = 'md',
  variant = 'primary',
  className = '' 
}: ButtonGroupProps) {
  return (
    <div className={cn(buttonGroupStyles.container, className)}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        const isFirst = index === 0;
        
        return (
          <button
            key={option.value}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              // 기본 스타일
              buttonGroupStyles.button.base,
              // 크기
              buttonGroupStyles.button.sizes[size],
              // 상태별 스타일
              isActive 
                ? buttonGroupStyles.button.states.active
                : buttonGroupStyles.button.states.default,
              // 비활성화 상태
              option.disabled && buttonGroupStyles.button.states.disabled,
              // 테두리 처리 (첫 번째 버튼이 아닌 경우)
              !isFirst && cn(
                buttonGroupStyles.button.notFirst,
                buttonGroupStyles.button.divider
              )
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}