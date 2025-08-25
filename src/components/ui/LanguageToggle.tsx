"use client";

import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { RiGlobalLine } from "react-icons/ri";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useSettingsStore();
  const isKorean = language === 'korean';

  const toggleLanguage = () => {
    setLanguage(isKorean ? 'english' : 'korean');
  };

  return (
    <div className={`${className}`}>
      {/* iOS 스타일 토글 스위치 */}
      <button
        onClick={toggleLanguage}
        className="relative flex items-center px-1 py-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{
          width: '140px',
          height: '44px',
          backgroundColor: isKorean ? 'var(--color-interactive-primary)' : 'var(--color-interactive-secondary)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        aria-label={`언어 변경: 현재 ${isKorean ? '한국어' : 'English'}`}
      >
        {/* 배경 라벨들 */}
        <div className="absolute inset-0 flex items-center justify-between px-5 text-sm font-bold pointer-events-none">
          <span 
            className={`transition-all duration-300 ${isKorean ? 'text-white opacity-100' : 'text-white/40'}`}
          >
            한글
          </span>
          <span 
            className={`transition-all duration-300 ${!isKorean ? 'text-white opacity-100' : 'text-white/40'}`}
          >
            ENG
          </span>
        </div>

        {/* 슬라이더 - 선택된 언어 표시 */}
        <div
          className="absolute bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
          style={{
            width: '55%',
            height: '36px',
            left: isKorean ? '4%' : '41%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex items-center gap-1">
            <RiGlobalLine 
              className="w-3 h-3 transition-colors duration-300"
              style={{ 
                color: isKorean ? 'var(--color-interactive-primary)' : 'var(--color-interactive-secondary)'
              }}
            />
            <span 
              className="text-sm font-bold transition-colors duration-300"
              style={{ 
                color: isKorean ? 'var(--color-interactive-primary)' : 'var(--color-interactive-secondary)'
              }}
            >
              {isKorean ? '한글' : 'ENG'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}