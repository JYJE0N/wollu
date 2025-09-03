'use client';

import React, { useEffect, useRef } from 'react';
import { useTyping } from '@/hooks/useTyping';

interface TypingPracticeProps {
  text: string;
  onComplete?: () => void;
}

export default function TypingPractice({ text, onComplete }: TypingPracticeProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const {
    userInput,
    currentIndex,
    isStarted,
    isCompleted,
    errors,
    stats,
    handleKeyPress,
    reset,
  } = useTyping(text);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 특수 키들 처리
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key.length === 1) {
        // 일반 문자 입력
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // 완료 시 콜백 호출
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  // 포커스 관리
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-2xl ';
      
      if (index < currentIndex) {
        // 이미 타이핑한 글자
        className += errors[index] ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700';
      } else if (index === currentIndex) {
        // 현재 타이핑할 글자
        className += 'bg-blue-200 text-blue-700 animate-pulse';
      } else {
        // 아직 타이핑하지 않은 글자
        className += 'text-gray-600';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.wpm}</div>
            <div className="text-sm text-gray-600">WPM</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">정확도</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{formatTime(stats.timeElapsed)}</div>
            <div className="text-sm text-gray-600">시간</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentIndex}/{text.length}
            </div>
            <div className="text-sm text-gray-600">진행률</div>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="text-sm text-gray-600 mb-2">
            {!isStarted ? '타이핑을 시작하려면 아무 키나 누르세요' : 
             isCompleted ? '완료되었습니다!' : '타이핑 중...'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / text.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 타이핑 영역 */}
      <div 
        ref={inputRef}
        tabIndex={0}
        className="bg-white p-6 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none min-h-32"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="leading-relaxed">
          {renderText()}
        </div>
      </div>

      {/* 사용자 입력 표시 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">입력한 내용:</div>
        <div className="text-lg font-mono">
          {userInput || <span className="text-gray-400">여기에 입력한 내용이 표시됩니다</span>}
        </div>
      </div>

      {/* 완료 또는 재시작 버튼 */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isCompleted ? '다시 시작' : '재시작'}
        </button>
      </div>

      {/* 완료 시 결과 */}
      {isCompleted && (
        <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">연습 완료!</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">최종 속도</div>
              <div className="text-xl font-bold text-green-600">{stats.wpm} WPM</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">최종 정확도</div>
              <div className="text-xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">총 소요 시간</div>
              <div className="text-xl font-bold text-green-600">{formatTime(stats.timeElapsed)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">오타 수</div>
              <div className="text-xl font-bold text-green-600">{stats.incorrectCharacters}개</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}