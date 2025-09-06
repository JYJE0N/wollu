'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import React from 'react';
import { IoGitBranchOutline } from 'react-icons/io5';

interface FooterProps {
  currentLanguage: 'ko' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ currentLanguage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentLanguage === 'ko' ? '월루타자기' : 'Wollu'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                © {currentYear}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>by</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Doomock</span>
                <Heart className="w-3 h-3 text-red-500 fill-current" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="GitHub"
              >
                <IoGitBranchOutline className="w-4 h-4" />
              </a>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <a 
                  href="#" 
                  className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {currentLanguage === 'ko' ? '개인정보' : 'Privacy'}
                </a>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <a 
                  href="#" 
                  className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {currentLanguage === 'ko' ? '약관' : 'Terms'}
                </a>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-gray-400 dark:text-gray-600">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">
                  {currentLanguage === 'ko' ? '정상' : 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
