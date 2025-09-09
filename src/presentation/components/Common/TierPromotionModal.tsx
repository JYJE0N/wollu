'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, ArrowUp } from 'lucide-react';
import { TierLevel, TIER_REQUIREMENTS } from '@/domain/entities/TierSystem';

interface TierPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldTier: TierLevel;
  newTier: TierLevel;
  currentLanguage: 'ko' | 'en';
}

export const TierPromotionModal: React.FC<TierPromotionModalProps> = ({
  isOpen,
  onClose,
  oldTier,
  newTier,
  currentLanguage
}) => {
  if (!isOpen) return null;

  const oldTierInfo = TIER_REQUIREMENTS[oldTier];
  const newTierInfo = TIER_REQUIREMENTS[newTier];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 배경 파티클 효과 */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
                  initial={{ 
                    x: Math.random() * 400, 
                    y: Math.random() * 400,
                    scale: 0 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 2,
                    delay: Math.random() * 1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2 
                  }}
                />
              ))}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* 헤더 */}
            <div className="text-center pt-8 pb-6 px-6 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {currentLanguage === 'ko' ? '🎉 티어 승급!' : '🎉 Tier Promotion!'}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-400"
              >
                {currentLanguage === 'ko' 
                  ? '축하합니다! 새로운 티어에 도달했습니다!' 
                  : 'Congratulations! You\'ve reached a new tier!'
                }
              </motion.p>
            </div>

            {/* 티어 변화 */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-center space-x-6 mb-6">
                {/* 이전 티어 */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl mb-2 border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: oldTierInfo.color + '20' }}
                  >
                    {oldTierInfo.icon}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {oldTierInfo.name[currentLanguage]}
                  </p>
                </motion.div>

                {/* 화살표 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <ArrowUp className="w-8 h-8 text-green-500" />
                </motion.div>

                {/* 새 티어 */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl mb-2 border-2 relative"
                    style={{ 
                      backgroundColor: newTierInfo.color + '30',
                      borderColor: newTierInfo.color 
                    }}
                    animate={{ 
                      boxShadow: [
                        `0 0 0 0 ${newTierInfo.color}40`,
                        `0 0 0 10px ${newTierInfo.color}00`,
                        `0 0 0 0 ${newTierInfo.color}40`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* 반짝이는 효과 */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ 
                        background: [
                          `radial-gradient(circle, ${newTierInfo.color}20, transparent)`,
                          `radial-gradient(circle, ${newTierInfo.color}40, transparent)`,
                          `radial-gradient(circle, ${newTierInfo.color}20, transparent)`,
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                    <span className="relative z-10">{newTierInfo.icon}</span>
                  </motion.div>
                  <p className="text-sm font-semibold" style={{ color: newTierInfo.color }}>
                    {newTierInfo.name[currentLanguage]}
                  </p>
                </motion.div>
              </div>

              {/* 티어 설명 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mb-6"
              >
                <div 
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: newTierInfo.color + '10',
                    color: newTierInfo.color
                  }}
                >
                  "{newTierInfo.description[currentLanguage]}"
                </div>
              </motion.div>

              {/* 액션 버튼 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex space-x-3"
              >
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {currentLanguage === 'ko' ? '계속 연습하기' : 'Continue Training'}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    window.open('/leaderboard', '_blank');
                  }}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {currentLanguage === 'ko' ? '순위 보기' : 'View Ranking'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};