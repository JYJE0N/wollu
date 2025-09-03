'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Clock, Zap, RotateCcw, Lightbulb, Keyboard } from 'lucide-react';
import { useSimpleTypingStore } from '@/store/simpleTypingStore';
import { generateSimpleHint, isSpaceCharacter } from '@/utils/simpleKoreanUtils';

interface KoreanTypingPracticeProps {
  text: string;
  onComplete?: () => void;
}

export default function KoreanTypingPractice({ text, onComplete }: KoreanTypingPracticeProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');

  const {
    userInput,
    currentIndex,
    isStarted,
    isCompleted,
    characterStates,
    stats,
    bestWpm,
    bestAccuracy,
    totalSessions,
    handleKeyPress,
    updateStats,
    completeSession,
    resetSession,
    setCurrentText
  } = useSimpleTypingStore();

  // 텍스트 변경 시 업데이트
  useEffect(() => {
    if (text !== useSimpleTypingStore.getState().currentText) {
      setCurrentText(text);
    }
  }, [text, setCurrentText]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key.length === 1) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setShowHint(!showHint);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress, showHint]);

  // 실시간 통계 업데이트
  useEffect(() => {
    if (isStarted && !isCompleted) {
      const interval = setInterval(() => {
        updateStats();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isStarted, isCompleted, updateStats]);

  // 힌트 업데이트
  useEffect(() => {
    if (currentIndex < text.length && showHint) {
      const targetChar = text[currentIndex];
      const hint = generateSimpleHint(targetChar);
      setCurrentHint(hint);
    }
  }, [currentIndex, text, showHint]);

  // 완료 처리
  useEffect(() => {
    if (isCompleted) {
      completeSession();
      
      // 성과에 따른 토스트 메시지
      if (stats.accuracy >= 98) {
        toast.success('🏆 완벽한 타이핑! 마스터급입니다!');
      } else if (stats.accuracy >= 95) {
        toast.success('🎉 훌륭한 정확도입니다!');
      } else if (stats.wpm > bestWpm) {
        toast.success('🚀 새로운 속도 기록 달성!');
      } else {
        toast.success('✨ 연습 완료! 계속 발전하고 있습니다!');
      }
      
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    }
  }, [isCompleted, completeSession, stats, bestWpm, onComplete]);

  // 포커스 관리
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const renderText = () => {
    return characterStates.map((state, index) => {
      let className = 'text-2xl font-mono transition-all duration-200 px-1 py-0.5 rounded ';
      let bgColor = '';
      
      // 공백 처리
      if (isSpaceCharacter(state.targetChar)) {
        className += 'border-b-2 border-dashed ';
      }
      
      // 상태별 스타일
      switch (state.status) {
        case 'correct':
          className += 'text-green-700';
          bgColor = 'bg-green-100';
          break;
        case 'incorrect':
          className += 'text-red-700';
          bgColor = 'bg-red-100';
          break;
        case 'current':
          className += 'text-blue-700';
          bgColor = 'bg-blue-100';
          break;
        default:
          className += 'text-gray-500';
      }

      return (
        <motion.span
          key={index}
          className={`${className} ${bgColor}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: state.status === 'current' ? 1.1 : 1
          }}
          transition={{ 
            delay: index * 0.01,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {state.targetChar === ' ' ? '␣' : state.targetChar}
        </motion.span>
      );
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = text ? (currentIndex / text.length) * 100 : 0;

  const statCards = [
    {
      icon: Zap,
      label: 'WPM',
      value: stats.wpm,
      color: 'blue',
      record: bestWpm > 0 ? `최고: ${bestWpm}` : null
    },
    {
      icon: Target,
      label: '정확도',
      value: `${stats.accuracy.toFixed(1)}%`,
      color: 'green',
      record: bestAccuracy > 0 ? `최고: ${bestAccuracy.toFixed(1)}%` : null
    },
    {
      icon: Clock,
      label: '시간',
      value: formatTime(stats.timeElapsed),
      color: 'purple'
    },
    {
      icon: Trophy,
      label: '진행률',
      value: `${Math.round(progressPercentage)}%`,
      color: 'orange'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 통계 카드 */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCards.map(({ icon: Icon, label, value, color, record }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${
                  color === 'blue' ? 'bg-blue-50' :
                  color === 'green' ? 'bg-green-50' :
                  color === 'purple' ? 'bg-purple-50' :
                  'bg-orange-50'
                } p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`w-5 h-5 mr-2 ${
                    color === 'blue' ? 'text-blue-600' :
                    color === 'green' ? 'text-green-600' :
                    color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                  <div className={`text-2xl font-bold ${
                    color === 'blue' ? 'text-blue-600' :
                    color === 'green' ? 'text-green-600' :
                    color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`}>{value}</div>
                </div>
                <div className="text-sm text-gray-600">{label}</div>
                {record && (
                  <div className="text-xs text-gray-500 mt-1">{record}</div>
                )}
              </motion.div>
            ))}
          </div>

          {/* 진행률 바 */}
          <motion.div 
            className="bg-gray-50 p-4 rounded-lg text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
              {!isStarted ? (
                <span className="flex items-center">
                  <Keyboard className="w-4 h-4 mr-2" />
                  타이핑을 시작하려면 아무 키나 누르세요
                </span>
              ) : isCompleted ? (
                <span className="text-green-600 font-semibold">🎉 완료되었습니다!</span>
              ) : (
                <span className="animate-pulse">⌨️ 타이핑 중... F1키로 힌트 토글</span>
              )}
            </div>
            
            <div className="relative w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
            
            {totalSessions > 0 && (
              <div className="text-xs text-gray-500">
                총 세션: {totalSessions}회
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 힌트 패널 */}
      <AnimatePresence>
        {showHint && currentHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">힌트: {currentHint}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 타이핑 영역 */}
      <motion.div
        ref={inputRef}
        tabIndex={0}
        className="bg-white p-8 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none min-h-40 shadow-lg hover:shadow-xl transition-all duration-300 relative"
        onClick={() => inputRef.current?.focus()}
        whileFocus={{ scale: 1.02 }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div 
          className="leading-relaxed text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderText()}
        </motion.div>
      </motion.div>

      {/* 사용자 입력 표시 */}
      <motion.div 
        className="mt-6 p-4 bg-gray-50 rounded-lg border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
          <span className="flex items-center">
            <span className="mr-2">📝</span>
            입력한 내용:
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            힌트 {showHint ? '끄기' : '켜기'} (F1)
          </button>
        </div>
        <div className="text-lg font-mono bg-white p-3 rounded border min-h-12">
          {userInput || <span className="text-gray-400">여기에 입력한 내용이 표시됩니다</span>}
        </div>
      </motion.div>

      {/* 재시작 버튼 */}
      <motion.div 
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={() => {
            resetSession();
            toast('🔄 새로운 연습을 시작합니다!');
          }}
          className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {isCompleted ? '다시 시작' : '재시작'}
        </motion.button>
      </motion.div>

      {/* 완료 시 결과 */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mt-8 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-xl"
          >
            <motion.h3 
              className="text-2xl font-bold text-green-800 mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              🎊 연습 완료!
            </motion.h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '최종 속도', value: `${stats.wpm} WPM`, isRecord: stats.wpm >= bestWpm },
                { label: '정확도', value: `${stats.accuracy.toFixed(1)}%`, isRecord: stats.accuracy >= bestAccuracy },
                { label: '소요 시간', value: formatTime(stats.timeElapsed) },
                { label: '오타 수', value: `${stats.incorrectCharacters}개` }
              ].map(({ label, value, isRecord }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="text-sm text-gray-600 mb-1">{label}</div>
                  <div className={`text-xl font-bold ${isRecord ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isRecord && '⭐ '}{value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}