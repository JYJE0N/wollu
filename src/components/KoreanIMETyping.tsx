'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Clock, Zap, RotateCcw } from 'lucide-react';

interface KoreanIMETypingProps {
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

export default function KoreanIMETyping({ text, onComplete }: KoreanIMETypingProps) {
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionText, setCompositionText] = useState('');
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    correctChars: 0,
    totalChars: 0
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // IME 조합 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
    
    // 첫 입력 시 타이머 시작
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }
  };

  // IME 조합 중 업데이트
  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    setCompositionText(e.data || '');
  };

  // IME 조합 완료 (한글 문자 완성)
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    // 실제 input의 전체 값을 사용
    const inputValue = (e.target as HTMLInputElement).value;
    
    setIsComposing(false);
    setCompositionText('');
    setUserInput(inputValue);
    setCurrentPosition(inputValue.length);
  };

  // 키보드 이벤트 처리 (주로 백스페이스)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !isComposing) {
      // 백스페이스는 기본 동작 허용, onChange에서 처리
    } else if (!isComposing) {
      // 첫 입력 시 타이머 시작
      if (!isStarted) {
        setIsStarted(true);
        setStartTime(Date.now());
      }
    }
  };

  // 통계 업데이트
  useEffect(() => {
    if (startTime && isStarted) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      let correctChars = 0;
      
      // 현재 입력된 텍스트와 목표 텍스트 비교
      const currentText = userInput + (isComposing ? compositionText : '');
      for (let i = 0; i < Math.min(currentText.length, text.length); i++) {
        if (currentText[i] === text[i]) {
          correctChars++;
        }
      }
      
      const accuracy = currentText.length > 0 ? (correctChars / currentText.length) * 100 : 0;
      const wpm = timeElapsed > 0 ? Math.round((correctChars / timeElapsed) * 60) : 0;
      
      setStats({
        wpm,
        accuracy,
        timeElapsed,
        correctChars,
        totalChars: currentText.length
      });
    }
  }, [userInput, compositionText, isComposing, startTime, isStarted, text]);

  // 상태 동기화 (위치 일관성 보장)
  useEffect(() => {
    if (!isComposing) {
      setCurrentPosition(userInput.length);
    }
  }, [userInput, isComposing]);

  // 완료 처리
  useEffect(() => {
    if (userInput.length >= text.length && userInput === text) {
      setIsCompleted(true);
      toast.success('🎉 한글 타이핑 완료!');
      onComplete?.();
    }
  }, [userInput, text, onComplete]);

  // 텍스트 변경 시 input 초기화
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setUserInput('');
      setCurrentPosition(0);
      setIsStarted(false);
      setIsCompleted(false);
      setStartTime(null);
      setIsComposing(false);
      setCompositionText('');
    }
  }, [text]);

  // 포커스 관리
  useEffect(() => {
    if (inputRef.current && !isCompleted) {
      inputRef.current.focus();
    }
  }, [isCompleted]);

  // 텍스트 렌더링
  const renderText = () => {
    const totalInputLength = userInput.length + (isComposing ? compositionText.length : 0);
    
    return text.split('').map((char, index) => {
      let className = 'text-2xl px-1 py-0.5 rounded ';
      
      if (index < userInput.length) {
        // 이미 확정된 입력 문자
        className += userInput[index] === char 
          ? 'bg-green-200 text-green-700' 
          : 'bg-red-200 text-red-700';
      } else if (isComposing && index >= userInput.length && index < totalInputLength) {
        // 현재 조합 중인 문자 영역
        className += 'bg-yellow-200 text-yellow-700';
      } else if (index === totalInputLength && index < text.length) {
        // 현재 입력 위치 (다음에 입력할 문자)
        className += 'bg-blue-200 text-blue-700 animate-pulse';
      } else {
        // 아직 입력하지 않은 문자
        className += 'text-gray-500';
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '␣' : char}
        </span>
      );
    });
  };

  const handleReset = () => {
    setUserInput('');
    setCurrentPosition(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setIsComposing(false);
    setCompositionText('');
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      correctChars: 0,
      totalChars: 0
    });
    toast('🔄 새로운 연습을 시작합니다!');
    
    // input 값도 실제로 초기화
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(((userInput.length + (isComposing ? compositionText.length : 0)) / text.length) * 100, 100);

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
          {!isStarted ? '한글 입력을 시작하려면 아래 입력창을 클릭하고 타이핑하세요' : 
           isCompleted ? '완료되었습니다!' : 
           isComposing ? '한글 조합 중...' : '타이핑 중...'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 텍스트 표시 영역 */}
      <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg mb-6">
        <div className="leading-relaxed text-center mb-6">
          {renderText()}
        </div>
      </div>

      {/* 입력창 (숨김) */}
      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="text-sm text-gray-600 mb-2">실제 입력창 (한글 IME 처리용):</div>
        <input
          ref={inputRef}
          type="text"
          defaultValue=""
          onChange={(e) => {
            // 조합 중이 아닐 때만 userInput 업데이트 (백스페이스, 삭제 등)
            if (!isComposing) {
              const newValue = e.target.value;
              setUserInput(newValue);
              setCurrentPosition(newValue.length);
            }
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          className="w-full text-lg font-mono bg-white p-3 rounded border focus:border-blue-500 focus:outline-none"
          placeholder="여기에 한글을 입력하세요..."
          disabled={isCompleted}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="text-xs text-gray-500 mt-2">
          조합 중: {isComposing ? '예' : '아니오'} | 조합 텍스트: &quot;{compositionText}&quot; | 현재 위치: {currentPosition}/{text.length} | 입력 길이: {userInput.length}
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
            🎊 한글 타이핑 연습 완료!
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