"use client";

import React from 'react';
import { FileText, Trello, MessageCircle, BookOpen } from 'lucide-react';
import { useStealthCommon } from '@/hooks/useStealthCommon';

interface StealthTitleProps {
  onHomeClick?: () => void;
  className?: string;
}

// 구글독스형 타이틀
export function DocsTitle({ onHomeClick, className = "" }: StealthTitleProps) {
  const { currentTime, formatTime } = useStealthCommon();
  
  const documentTitle = "2024년 4분기 사업계획서";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        onClick={onHomeClick}
        className="p-2 hover:bg-surface rounded-lg transition-colors"
        title="홈으로 돌아가기"
      >
        <FileText className="w-5 h-5 text-interactive-primary" />
      </button>
      <div>
        <h1 className="font-semibold text-text-primary">{documentTitle}</h1>
        <p className="text-xs text-text-secondary">
          마지막 수정: {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}

// 칸반보드형 타이틀  
export function KanbanTitle({ onHomeClick, className = "" }: StealthTitleProps) {
  const { currentTime, formatTime } = useStealthCommon();
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        onClick={onHomeClick}
        className="p-2 hover:bg-surface rounded-lg transition-colors"
        title="홈으로 돌아가기"
      >
        <Trello className="w-5 h-5 text-interactive-primary" />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          마케팅 프로젝트 관리 보드
        </h1>
        <p className="text-xs text-text-secondary">
          비즈니스 전략팀 • {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}

// 슬랙형 타이틀
export function SlackTitle({ onHomeClick, className = "" }: StealthTitleProps) {
  const { currentTime, formatTime } = useStealthCommon();
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        onClick={onHomeClick}
        className="p-2 hover:bg-surface rounded-lg transition-colors"
        title="홈으로 돌아가기"
      >
        <MessageCircle className="w-5 h-5 text-interactive-primary" />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          #개발팀-일반
        </h1>
        <p className="text-xs text-text-secondary">
          개발팀 워크스페이스 • {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}

// 노션형 타이틀
export function NotionTitle({ onHomeClick, className = "" }: StealthTitleProps) {
  const { currentTime, formatTime } = useStealthCommon();
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        onClick={onHomeClick}
        className="p-2 hover:bg-surface rounded-lg transition-colors"
        title="홈으로 돌아가기"
      >
        <BookOpen className="w-5 h-5 text-interactive-primary" />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          업무 노트 & 프로젝트 관리
        </h1>
        <p className="text-xs text-text-secondary">
          개인 워크스페이스 • {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}