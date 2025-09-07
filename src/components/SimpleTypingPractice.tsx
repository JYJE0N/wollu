'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Clock, Zap, RotateCcw } from 'lucide-react';
import TextRenderer from '@/presentation/components/Common/TextRenderer';

interface SimpleTypingPracticeProps {
  text: string;
  onComplete?: () => void;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  correctChars: number;
  totalChars: number;
}

export default function SimpleTypingPractice({ text, onComplete }: SimpleTypingPracticeProps) {
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    correctChars: 0,
    totalChars: 0
  });
  
  const inputRef = useRef<HTMLDivElement>(null);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setUserInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1 && userInput.length < text.length) {
        e.preventDefault();
        
        // 첫 입력 시 타이머 시작
        if (!isStarted) {
          setIsStarted(true);
          setStartTime(Date.now());
        }
        
        setUserInput(prev => prev + e.key);
      }
    };

    if (!isCompleted) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStarted, isCompleted, userInput.length, text.length]);

  // 통계 업데이트
  useEffect(() => {
    if (startTime && isStarted) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      let correctChars = 0;
      
      for (let i = 0; i < Math.min(userInput.length, text.length); i++) {
        if (userInput[i] === text[i]) {
          correctChars++;
        }
      }
      
      const accuracy = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 0;
      const wpm = timeElapsed > 0 ? Math.round((correctChars / timeElapsed) * 60) : 0;
      
      setStats({
        wpm,
        accuracy,
        timeElapsed,
        correctChars,
        totalChars: userInput.length
      });
    }
  }, [userInput, startTime, isStarted, text]);

  // 완료 처리
  useEffect(() => {
    if (userInput.length === text.length && userInput === text) {
      setIsCompleted(true);
      toast.success('🎉 타이핑 완료!');
      onComplete?.();
    }
  }, [userInput, text, onComplete]);

  // 오류 맵 생성
  const errors: Record<number, boolean> = {};
  for (let i = 0; i < userInput.length; i++) {
    if (i < text.length && userInput[i] !== text[i]) {
      errors[i] = true;
    }
  }

  const handleReset = () => {
    setUserInput('');
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      correctChars: 0,
      totalChars: 0
    });
    toast('🔄 새로운 연습을 시작합니다!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (userInput.length / text.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.wpm}</div>
          </div>
          <div className="text-sm text-gray-600">WPM</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-2xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-gray-600">정확도</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-2xl font-bold text-purple-600">{formatTime(stats.timeElapsed)}</div>
          </div>
          <div className="text-sm text-gray-600">시간</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-orange-600 mr-2" />
            <div className="text-2xl font-bold text-orange-600">{Math.round(progressPercentage)}%</div>
          </div>
          <div className="text-sm text-gray-600">진행률</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="bg-gray-50 p-4 rounded-lg text-center mb-8">
        <div className="text-sm text-gray-600 mb-2">
          {!isStarted ? '타이핑을 시작하려면 아무 키나 누르세요' : 
           isCompleted ? '완료되었습니다!' : '타이핑 중...'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 타이핑 영역 */}
      <div
        ref={inputRef}
        tabIndex={0}
        className="bg-white p-8 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none min-h-40 shadow-lg mb-6"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="leading-relaxed text-center">
          <TextRenderer
            text={text}
            userInput={userInput}
            currentIndex={userInput.length}
            errors={errors}
            language="ko"
            showCursor={!isCompleted}
            highlightCurrent={!isCompleted}
            showSpaces={true}
          />
        </div>
      </div>

      {/* 사용자 입력 표시 */}
      <div className="p-4 bg-gray-50 rounded-lg border mb-6">
        <div className="text-sm text-gray-600 mb-2">입력한 내용:</div>
        <div className="text-lg font-mono bg-white p-3 rounded border">
          {userInput || <span className="text-gray-400">여기에 입력한 내용이 표시됩니다</span>}
        </div>
      </div>

      {/* 재시작 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {isCompleted ? '다시 시작' : '재시작'}
        </button>
      </div>

      {/* 완료 시 결과 */}
      {isCompleted && (
        <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-xl">
          <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
            🎊 연습 완료!
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">최종 속도</div>
              <div className="text-xl font-bold text-green-600">{stats.wpm} WPM</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">최종 정확도</div>
              <div className="text-xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">소요 시간</div>
              <div className="text-xl font-bold text-green-600">{formatTime(stats.timeElapsed)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">정확한 문자 수</div>
              <div className="text-xl font-bold text-green-600">{stats.correctChars}개</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}