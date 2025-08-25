"use client";

import React, { useState } from 'react';
import { ThemeMenu } from './ThemeMenu';
import { SettingsMenu } from './SettingsMenu';
import { IoStatsChart, IoSettingsSharp } from "react-icons/io5";
import Link from 'next/link';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = "" }: ToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-1 md:gap-2 ${className}`}>
        {/* 통계 링크 - 모바일 터치 최적화 */}
        <Link
          href="/stats"
          className="p-2 md:p-2 rounded-lg transition-colors toolbar-icon touch-manipulation"
          style={{
            color: 'var(--color-text-secondary) !important',
            textDecoration: 'none !important',
            minHeight: '44px', // 모바일 터치 최소 크기
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'
            e.currentTarget.style.color = 'var(--color-interactive-primary) !important'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-secondary) !important'
          }}
          title="통계 보기"
        >
          <IoStatsChart className="w-5 h-5 md:w-5 md:h-5" style={{ color: 'inherit !important' }} />
        </Link>

        {/* 설정 버튼 - 모바일 터치 최적화 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 md:p-2 rounded-lg transition-colors toolbar-icon touch-manipulation ${showSettings ? 'active' : ''}`}
          onMouseEnter={(e) => {
            if (!showSettings) {
              e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'
            }
          }}
          onMouseLeave={(e) => {
            if (!showSettings) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
          style={{
            backgroundColor: showSettings ? 'var(--color-background-elevated)' : 'transparent',
            minHeight: '44px', // 모바일 터치 최소 크기
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="설정"
        >
          <IoSettingsSharp className="w-5 h-5 md:w-5 md:h-5" />
        </button>

        {/* 테마 메뉴 */}
        <ThemeMenu />
      </div>
      
      {/* 설정 패널 */}
      {showSettings && (
        <SettingsMenu isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}