"use client";

import React from 'react';
import { TypingLogo } from './TypingLogo';
import { Toolbar } from './Toolbar';
import { DocsTitle, KanbanTitle, SlackTitle, NotionTitle } from './StealthTitles';
import { layoutStyles } from '@/utils/styles';

interface HeaderProps {
  mode?: 'normal' | 'stealth-docs' | 'stealth-kanban' | 'stealth-slack' | 'stealth-notion';
  onHomeClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Header({ 
  mode = 'normal', 
  onHomeClick,
  className = "",
  style = {}
}: HeaderProps) {
  
  // 브랜드 로고 또는 은밀모드 타이틀 렌더링
  const renderLeftContent = () => {
    switch (mode) {
      case 'stealth-docs':
        return <DocsTitle onHomeClick={onHomeClick} />;
      case 'stealth-kanban':
        return <KanbanTitle onHomeClick={onHomeClick} />;
      case 'stealth-slack':
        return <SlackTitle onHomeClick={onHomeClick} />;
      case 'stealth-notion':
        return <NotionTitle onHomeClick={onHomeClick} />;
      default:
        return <TypingLogo />;
    }
  };

  return (
    <header
      className={`${layoutStyles.header} ${className}`}
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
        ...style
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
        {/* 좌측: 브랜드 로고 또는 은밀모드 타이틀 */}
        {renderLeftContent()}
        
          {/* 우측: 공통 툴바 (통계 + 설정 + 테마) */}
          <Toolbar />
        </div>
      </div>
    </header>
  );
}