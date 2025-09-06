'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { IoGlobeOutline } from 'react-icons/io5';

interface LanguageToggleProps {
  currentLanguage: 'ko' | 'en';
  onToggle: () => void;
}

export const LanguageToggle = memo<LanguageToggleProps>(({
  currentLanguage,
  onToggle,
}) => {
  const isKorean = currentLanguage === 'ko';

  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-9 w-[88px] items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isKorean ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={isKorean}
      aria-label={`Switch language to ${isKorean ? 'English' : 'Korean'}`}
    >
      <span 
        className="absolute left-3 text-xs font-semibold text-white pointer-events-none select-none transition-opacity duration-200"
        style={{ opacity: !isKorean ? 1 : 0.3 }}
      >
        EN
      </span>
      <span 
        className="absolute right-2.5 text-xs font-semibold text-white pointer-events-none select-none transition-opacity duration-200"
        style={{ opacity: isKorean ? 1 : 0.3 }}
      >
        한글
      </span>
      
      <motion.span
        className="absolute h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: isKorean ? 54 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <IoGlobeOutline className="w-4 h-4 text-gray-700" />
      </motion.span>
    </button>
  );
});

LanguageToggle.displayName = 'LanguageToggle';