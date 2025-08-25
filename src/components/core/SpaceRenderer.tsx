/**
 * 스페이스 문자 전용 렌더러
 * 책임: 스페이스의 특별한 시각적 효과 처리
 */

import { memo } from "react";
import { CharacterState } from "@/utils/textState";

interface SpaceRendererProps {
  state: CharacterState;
  showCursor: boolean;
  'data-index'?: number;
}

export const SpaceRenderer = memo(function SpaceRenderer({ 
  state, 
  showCursor
}: Omit<SpaceRendererProps, 'data-index'>) {
  const { status, index, specialKey } = state;
  
  if (specialKey !== "space") {
    return null;
  }

  // 스페이스 표시 문자 결정
  const getSpaceDisplay = () => {
    switch (status) {
      case "current":
        return "⎵"; // 현재 타이핑할 공백
      case "incorrect":
        return "⎵"; // 실수한 공백
      case "correct":
        return "·"; // 올바르게 타이핑한 공백
      default:
        return "·"; // 아직 타이핑하지 않은 공백
    }
  };

  // 스페이스 스타일 클래스
  const getSpaceClass = () => {
    const baseClass = "relative inline-block transition-colors duration-150";
    
    switch (status) {
      case "correct":
        return `${baseClass} opacity-50 typing-correct-text`;
      case "incorrect":
        return `${baseClass} font-bold typing-incorrect-text typing-incorrect-bg`;
      case "current":
        return `${baseClass} typing-current-text`;
      case "pending":
      default:
        return `${baseClass} opacity-20 typing-pending-text`;
    }
  };

  return (
    <span className="relative">
      <span
        className={getSpaceClass()}
        data-index={index}
      >
        {getSpaceDisplay()}
        
        {/* 현재 스페이스의 특별한 언더바 */}
        {showCursor && status === "current" && (
          <>
            <span className="space-underline absolute left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90 rounded-full shadow-lg" />
            <span className="space-glow absolute inset-0 rounded transition-all duration-200" />
          </>
        )}
      </span>
    </span>
  );
});