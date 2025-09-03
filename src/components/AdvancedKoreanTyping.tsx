'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Clock, Zap, RotateCcw, Lightbulb } from 'lucide-react';
import { 
  KoreanComposition, 
  decomposeKorean, 
  updateComposition, 
  isKorean, 
  calculateKoreanProgress,
  getNextInputHint,
  composeKorean
} from '@/utils/advancedKoreanUtils';

interface AdvancedKoreanTypingProps {
  text: string;
  onComplete?: () => void;
}

interface CharacterState {
  target: string;
  targetDecomposed: KoreanComposition;
  currentComposition: KoreanComposition;
  isCompleted: boolean;
  progress: number;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  correctJamos: number;
  totalJamos: number;
  charactersCompleted: number;
}

export default function AdvancedKoreanTyping({ text, onComplete }: AdvancedKoreanTypingProps) {
  const [characterStates, setCharacterStates] = useState<CharacterState[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    correctJamos: 0,
    totalJamos: 0,
    charactersCompleted: 0
  });
  
  const inputRef = useRef<HTMLDivElement>(null);

  // 텍스트 초기화
  useEffect(() => {
    const initialStates = text.split('').map(char => ({
      target: char,
      targetDecomposed: decomposeKorean(char),
      currentComposition: { 
        initial: '', medial: '', final: '', composed: '', isComplete: false 
      },
      isCompleted: false,
      progress: 0
    }));
    
    setCharacterStates(initialStates);
    setCurrentCharIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
  }, [text]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHint(!showHint);
        return;
      }
      
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key.length === 1) {
        e.preventDefault();
        
        // 첫 입력 시 타이머 시작
        if (!isStarted) {
          setIsStarted(true);
          setStartTime(Date.now());
        }
        
        handleCharacterInput(e.key);
      }
    };

    if (!isCompleted) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStarted, isCompleted, currentCharIndex, characterStates, showHint]);

  const handleCharacterInput = (input: string) => {
    if (currentCharIndex >= characterStates.length) return;
    
    setCharacterStates(prev => {
      const newStates = [...prev];
      const currentChar = newStates[currentCharIndex];
      const targetChar = currentChar.target;
      
      if (!isKorean(targetChar)) {
        // 비한글 문자 (영문, 숫자, 특수문자, 공백)
        if (input === targetChar) {
          newStates[currentCharIndex] = {
            ...currentChar,
            currentComposition: { 
              initial: '', medial: '', final: '', composed: input, isComplete: true 
            },
            isCompleted: true,
            progress: 1
          };
          
          // 다음 문자로 이동
          setTimeout(() => {
            if (currentCharIndex + 1 < text.length) {
              setCurrentCharIndex(currentCharIndex + 1);
            } else {
              setIsCompleted(true);
            }
          }, 50);
        }
      } else {
        // 한글 문자 처리
        const newComposition = updateComposition(currentChar.currentComposition, input);
        const progress = calculateKoreanProgress(targetChar, newComposition);
        const isCharCompleted = newComposition.composed === targetChar;
        
        newStates[currentCharIndex] = {
          ...currentChar,
          currentComposition: newComposition,
          isCompleted: isCharCompleted,
          progress
        };
        
        // 문자 완성 시 다음 문자로 이동
        if (isCharCompleted) {
          setTimeout(() => {
            if (currentCharIndex + 1 < text.length) {
              setCurrentCharIndex(currentCharIndex + 1);
            } else {
              setIsCompleted(true);
            }
          }, 50);
        }
      }
      
      return newStates;
    });
  };

  const handleBackspace = () => {
    if (currentCharIndex >= characterStates.length) return;
    
    setCharacterStates(prev => {
      const newStates = [...prev];
      const currentChar = newStates[currentCharIndex];
      
      if (!isKorean(currentChar.target)) {
        // 비한글 문자는 완전히 지움
        newStates[currentCharIndex] = {
          ...currentChar,
          currentComposition: { 
            initial: '', medial: '', final: '', composed: '', isComplete: false 
          },
          isCompleted: false,
          progress: 0
        };
      } else {
        // 한글 문자는 자소 단위로 지움
        const composition = currentChar.currentComposition;
        let newComposition = { ...composition };
        
        if (composition.final) {
          newComposition.final = '';
        } else if (composition.medial) {
          newComposition.medial = '';
        } else if (composition.initial) {
          newComposition.initial = '';
        }
        
        // 조합된 문자 업데이트
        if (newComposition.initial && newComposition.medial) {
          newComposition.composed = composeKorean(
            newComposition.initial,
            newComposition.medial,
            newComposition.final
          );
        } else {
          newComposition.composed = '';
          newComposition.isComplete = false;
        }
        
        const progress = calculateKoreanProgress(currentChar.target, newComposition);
        
        newStates[currentCharIndex] = {
          ...currentChar,
          currentComposition: newComposition,
          isCompleted: false,
          progress
        };
      }
      
      return newStates;
    });
  };

  // 통계 업데이트
  useEffect(() => {
    if (startTime && isStarted) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      let correctJamos = 0;
      let totalJamos = 0;
      let charactersCompleted = 0;
      
      characterStates.forEach(char => {
        if (isKorean(char.target)) {
          const targetDecomposed = decomposeKorean(char.target);
          const jamoCount = 
            (targetDecomposed.initial ? 1 : 0) +
            (targetDecomposed.medial ? 1 : 0) +
            (targetDecomposed.final ? 1 : 0);
          
          totalJamos += jamoCount;
          correctJamos += Math.floor(char.progress * jamoCount);
        } else {
          totalJamos += 1;
          correctJamos += char.isCompleted ? 1 : 0;
        }
        
        if (char.isCompleted) charactersCompleted++;
      });
      
      const accuracy = totalJamos > 0 ? (correctJamos / totalJamos) * 100 : 0;
      const wpm = timeElapsed > 0 ? Math.round((correctJamos / timeElapsed) * 60) : 0;
      
      setStats({
        wpm,
        accuracy,
        timeElapsed,
        correctJamos,
        totalJamos,
        charactersCompleted
      });
    }
  }, [characterStates, startTime, isStarted]);

  // 완료 처리
  useEffect(() => {
    if (isCompleted) {
      toast.success('🎉 한글 타이핑 완료!');
      onComplete?.();
    }
  }, [isCompleted, onComplete]);

  const renderCharacter = (char: CharacterState, index: number) => {
    let className = 'text-2xl px-2 py-1 rounded-lg transition-all duration-200 relative ';
    let bgColor = '';
    
    if (char.target === ' ') {
      className += 'border-b-2 border-dashed border-gray-400 ';
    }
    
    if (index < currentCharIndex) {
      // 이미 완료된 문자
      className += char.isCompleted ? 'text-green-700' : 'text-red-700';
      bgColor = char.isCompleted ? 'bg-green-100' : 'bg-red-100';
    } else if (index === currentCharIndex) {
      // 현재 입력 중인 문자
      className += 'text-blue-700';
      bgColor = 'bg-blue-100';
      
      if (char.progress > 0 && char.progress < 1) {
        bgColor = 'bg-yellow-100';
      }
    } else {
      // 아직 입력하지 않은 문자
      className += 'text-gray-500';
    }

    return (
      <motion.div
        key={index}
        className={`${className} ${bgColor} inline-block`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: index === currentCharIndex ? 1.1 : 1
        }}
        transition={{ 
          delay: index * 0.02,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <div className="relative">
          {/* 목표 문자 */}
          <div className="text-center">
            {char.target === ' ' ? '␣' : char.target}
          </div>
          
          {/* 현재 조합된 문자 (한글인 경우) */}
          {index === currentCharIndex && isKorean(char.target) && char.currentComposition.composed && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {char.currentComposition.composed}
            </motion.div>
          )}
          
          {/* 진행률 바 (한글인 경우) */}
          {index === currentCharIndex && isKorean(char.target) && char.progress > 0 && char.progress < 1 && (
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded">
              <motion.div
                className="h-full bg-blue-400 rounded"
                initial={{ width: 0 }}
                animate={{ width: `${char.progress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const handleReset = () => {
    const initialStates = text.split('').map(char => ({
      target: char,
      targetDecomposed: decomposeKorean(char),
      currentComposition: { 
        initial: '', medial: '', final: '', composed: '', isComplete: false 
      },
      isCompleted: false,
      progress: 0
    }));
    
    setCharacterStates(initialStates);
    setCurrentCharIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      correctJamos: 0,
      totalJamos: 0,
      charactersCompleted: 0
    });
    toast('🔄 새로운 연습을 시작합니다!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentHint = currentCharIndex < characterStates.length 
    ? getNextInputHint(
        characterStates[currentCharIndex].target,
        characterStates[currentCharIndex].currentComposition
      )
    : '';

  const progressPercentage = text.length > 0 ? (stats.charactersCompleted / text.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
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
          <div className="text-sm text-gray-600">자소 정확도</div>
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

      {/* 진행률 및 자소 정보 */}
      <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
        <div className="text-sm text-gray-600 mb-2">
          {!isStarted ? '한글 타이핑을 시작하려면 아무 키나 누르세요' : 
           isCompleted ? '완료되었습니다!' : '타이핑 중... (F1: 힌트)'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          자소: {stats.correctJamos}/{stats.totalJamos} | 문자: {stats.charactersCompleted}/{text.length}
        </div>
      </div>

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
      <div
        ref={inputRef}
        tabIndex={0}
        className="bg-white p-8 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none min-h-40 shadow-lg mb-6"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="leading-relaxed text-center">
          {characterStates.map((char, index) => renderCharacter(char, index))}
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
    </div>
  );
}