'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Clock, Zap, RotateCcw } from 'lucide-react';
import { TypingStats } from '@/domain/valueObjects/TypingStats';
import { KoreanInput } from './KoreanInput';

interface TypingPracticeViewProps {
  mode: 'sentence' | 'words';
  difficulty?: 'easy' | 'medium' | 'hard';
  text: string;
  onComplete?: () => void;
}

export function TypingPracticeView({ mode, difficulty, text, onComplete }: TypingPracticeViewProps) {
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [userInput, setUserInput] = useState('');
  const [key, setKey] = useState(0); // 컴포넌트 리셋용 키

  const handleStatsUpdate = (newStats: TypingStats) => {
    setStats(newStats);
  };
  
  const handleInputChange = (input: string) => {
    setUserInput(input);
  };

  const handleComplete = () => {
    toast.success('🎉 타이핑 완료!');
    if (onComplete) {
      onComplete();
    }
  };

  const handleReset = () => {
    setKey(prev => prev + 1); // 컴포넌트 재마운트
    setStats(null);
    setUserInput('');
    toast.success('다시 시작합니다!');
  };

  const renderTextDisplay = () => {
    const displayInput = userInput;
    
    return (
      <div className="relative">
        <div className="text-2xl font-mono leading-relaxed text-gray-700 mb-4">
          {text.split('').map((char, index) => {
            const isTyped = index < displayInput.length;
            const isCorrect = isTyped && displayInput[index] === char;
            const isWrong = isTyped && displayInput[index] !== char;
            const isCurrent = index === displayInput.length;

            return (
              <span
                key={index}
                className={`
                  relative ${char === ' ' ? 'inline' : 'inline-block'}
                  ${isCorrect ? 'text-green-600 bg-green-50' : ''}
                  ${isWrong ? 'text-red-600 bg-red-50' : ''}
                  ${isCurrent ? 'border-b-2 border-blue-500 animate-pulse' : ''}
                  ${!isTyped && !isCurrent ? 'text-gray-400' : ''}
                  ${char === ' ' ? 'min-w-[0.5rem]' : ''}
                `}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div 
          className="bg-white rounded-lg p-4 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">속도</span>
          </div>
          <div className="text-2xl font-bold">{stats.wpm} WPM</div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-4 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">정확도</span>
          </div>
          <div className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-4 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">시간</span>
          </div>
          <div className="text-2xl font-bold">{stats.timeElapsed}초</div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-4 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">진행률</span>
          </div>
          <div className="text-2xl font-bold">
            {Math.min(100, (userInput.length / text.length * 100)).toFixed(0)}%
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {renderStats()}
      
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderTextDisplay()}
        
        <div className="mt-6">
          <KoreanInput
            key={key}
            text={text}
            mode={mode}
            onStatsUpdate={handleStatsUpdate}
            onInputChange={handleInputChange}
            onComplete={handleComplete}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <motion.button
            onClick={handleReset}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            다시 시작
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}