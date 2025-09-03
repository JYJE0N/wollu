'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BookOpen, Shuffle, Settings } from 'lucide-react';
import KoreanIMETyping from '@/components/KoreanIMETyping';
import { ToastProvider } from '@/components/ToastProvider';
import { getRandomText, getRandomWords } from '@/data/korean-texts';

export default function Home() {
  const [currentText, setCurrentText] = useState('');
  const [practiceMode, setPracticeMode] = useState<'sentence' | 'words'>('sentence');
  const [isInitialized, setIsInitialized] = useState(false);

  // 클라이언트에서만 랜덤 텍스트 초기화
  useEffect(() => {
    setCurrentText(getRandomText());
    setIsInitialized(true);
  }, []);

  const handleNewText = () => {
    const newText = practiceMode === 'sentence' ? getRandomText() : getRandomWords(10);
    setCurrentText(newText);
    toast.success(`🎯 새로운 ${practiceMode === 'sentence' ? '문장' : '단어'} 연습!`);
  };

  const handleModeChange = (mode: 'sentence' | 'words') => {
    setPracticeMode(mode);
    const newText = mode === 'sentence' ? getRandomText() : getRandomWords(10);
    setCurrentText(newText);
    toast.success(`📚 ${mode === 'sentence' ? '문장' : '단어'} 연습 모드로 변경!`);
  };

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.header 
          className="bg-white shadow-lg border-b"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto p-6">
            <motion.h1 
              className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ⌨️ 한글 타자연습
            </motion.h1>
            
            <motion.div 
              className="flex justify-center space-x-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => handleModeChange('sentence')}
                className={`flex items-center px-6 py-3 rounded-lg transition-all shadow-md ${
                  practiceMode === 'sentence'
                    ? 'bg-blue-600 text-white scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                문장 연습
              </motion.button>
              <motion.button
                onClick={() => handleModeChange('words')}
                className={`flex items-center px-6 py-3 rounded-lg transition-all shadow-md ${
                  practiceMode === 'words'
                    ? 'bg-blue-600 text-white scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 mr-2" />
                단어 연습
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={handleNewText}
                className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-5 h-5 mr-2" />
                새로운 텍스트
              </motion.button>
            </motion.div>
          </div>
        </motion.header>

        <main className="py-8">
          {isInitialized && currentText ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <KoreanIMETyping 
                text={currentText} 
                onComplete={() => {
                  // 완료 후 처리 로직
                }}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <div className="text-lg text-gray-600">로딩 중...</div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}