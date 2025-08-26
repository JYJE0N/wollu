"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { getLanguagePack } from "@/modules/languages";
import { TextGenerator } from "@/utils/textGenerator";
import { ghostModeManager } from "@/utils/ghostMode";
import { typingEffectsManager } from "@/utils/typingEffects";
import { LanguageDetector, detectTextLanguage } from "@/utils/languageDetection";

/**
 * 타이핑 테스트의 비즈니스 로직을 관리하는 컨트롤러
 * 책임: 텍스트 생성, 테스트 시작/재시작, 키 입력 처리, 진행률 관리
 */
export function useTypingTestController() {
  // Store 훅들
  const {
    targetText,
    currentIndex,
    userInput,
    mistakes,
    keystrokes,
    startTime,
    firstKeystrokeTime,
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    resetTest,
    setTargetText,
    startCountdown,
    pauseTest,
    resumeTest,
    stopTest,
    getCurrentChar,
    handleBackspace: storeHandleBackspace,
  } = useTypingStore();

  const { calculateStats, resetStats, liveStats } = useStatsStore();
  const { language, textType, testMode, testTarget, ghostModeEnabled, typingEffectsEnabled, countdownEnabled, sentenceLength, sentenceStyle } = useSettingsStore();
  const { updateCharacterStats, updateMistakePattern, recentTests } = useUserProgressStore();
  
  // 언어 감지 시스템
  const languageDetector = useRef(new LanguageDetector());
  const [languageHint, setLanguageHint] = useState<{
    show: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>({ show: false, message: '', severity: 'info' });

  // 새로운 텍스트 생성 (설정에 따른 통일된 로직)
  const generateNewText = useCallback(() => {
    const languagePack = getLanguagePack(language);
    if (!languagePack) return "";

    const textGenerator = new TextGenerator(languagePack);
    // 설정에 따른 통일된 텍스트 생성
    const newText = textGenerator.generateNewText({
      mode: testMode,
      count: testTarget,
      sentenceLength,
      sentenceStyle
    });

    return newText;
  }, [language, testMode, testTarget, sentenceLength, sentenceStyle]);

  // 테스트 재시작
  const handleRestart = useCallback(() => {
    const newText = generateNewText();
    if (!newText) return;

    resetTest();
    setTargetText(newText);
    resetStats();

    // 고스트 모드 설정
    if (ghostModeEnabled && recentTests && Array.isArray(recentTests)) {
      const bestRecord = ghostModeManager.findBestRecord(
        recentTests,
        language,
        textType,
        testMode,
        testTarget
      );
      
      if (bestRecord) {
        ghostModeManager.startGhostMode(bestRecord);
      }
    }

    // 이펙트 시스템 초기화
    if (typingEffectsEnabled) {
      typingEffectsManager.resetCombo();
    }
  }, [generateNewText, resetTest, setTargetText, resetStats, ghostModeEnabled, typingEffectsEnabled, recentTests, language, textType, testMode, testTarget]);

  // 테스트 시작
  const handleStart = useCallback(() => {
    if (!targetText) {
      handleRestart();
      return;
    }
    
    // 모든 기기에서 사용자 설정을 존중
    if (countdownEnabled) {
      startCountdown();
    } else {
      // 카운트다운 없이 바로 시작
      const startTest = useTypingStore.getState().startTest;
      startTest();
    }
  }, [targetText, handleRestart, startCountdown, countdownEnabled]);

  // 키 입력 처리 (언어 감지 포함)
  const handleKeyPress = useCallback((key: string) => {
    console.log(`🎮 TypingTestController.handleKeyPress received: "${key}"`)
    
    // 언어 불일치 감지 (한글/영문 텍스트에서만)
    const textLanguage = detectTextLanguage(targetText);
    if (textLanguage !== 'mixed' && userInput.length > 0) {
      const recentInput = userInput + key;
      const expectedPortion = targetText.substring(0, recentInput.length);
      
      const hintResult = languageDetector.current.checkInput(recentInput, expectedPortion);
      
      if (hintResult.showHint) {
        setLanguageHint({
          show: true,
          message: hintResult.hintMessage,
          severity: hintResult.severity
        });
        
        // 3초 후 자동 숨김
        setTimeout(() => {
          setLanguageHint(prev => ({ ...prev, show: false }));
        }, 3000);
      }
    }
    
    // 타이핑 스토어의 handleKeyPress 호출 (상태 업데이트)
    console.log(`📞 TypingTestController calling typingStore.handleKeyPress("${key}")`)
    const storeHandleKeyPress = useTypingStore.getState().handleKeyPress;
    storeHandleKeyPress(key);
    console.log(`✅ TypingTestController typingStore.handleKeyPress call completed`)

    const currentChar = getCurrentChar();
    if (!currentChar) return;

    // 통계 업데이트
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);

    // 문자별 통계 업데이트
    if (currentChar) {
      updateCharacterStats(currentChar, key === currentChar, Date.now());
    }

    // 실수 패턴 업데이트
    if (key !== currentChar) {
      updateMistakePattern(currentChar, key);
    }

    // 이펙트 시스템은 이미 타이핑 스토어에서 처리됨
  }, [targetText, userInput, getCurrentChar, calculateStats, updateCharacterStats, updateMistakePattern, keystrokes, mistakes, startTime, currentIndex, textType, firstKeystrokeTime]);

  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    console.log('🔙 TypingTestController: handleBackspace called');
    
    // 실제 백스페이스 처리
    storeHandleBackspace();
    
    // 언어 힌트 숨김 (백스페이스 시)
    if (languageHint.show) {
      setLanguageHint(prev => ({ ...prev, show: false }));
    }
    
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);
  }, [storeHandleBackspace, languageHint.show, calculateStats, keystrokes, mistakes, startTime, currentIndex, textType, targetText, userInput, firstKeystrokeTime]);

  // 테스트 완료 처리 (TestCompletionHandler에서만 처리)
  const handleTestCompletion = useCallback(() => {
    if (!isCompleted || !firstKeystrokeTime) return;

    // 통계 계산만 수행 (저장은 TestCompletionHandler에서)
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);
    
    console.log('📊 TypingTestController: 통계 계산 완료 (저장 제외)');

    return liveStats;
  }, [isCompleted, firstKeystrokeTime, calculateStats, keystrokes, mistakes, startTime, currentIndex, textType, targetText, userInput, liveStats]);

  // 전역 이벤트 리스너 (승급 모달에서 새 테스트 요청)
  useEffect(() => {
    const handleRestartTest = () => {
      console.log('🔄 전역 이벤트 수신: 새 테스트 시작 요청');
      handleRestart();
    };

    window.addEventListener('typing:restart-test', handleRestartTest);
    return () => window.removeEventListener('typing:restart-test', handleRestartTest);
  }, [handleRestart]);

  return {
    // 상태
    targetText,
    currentIndex,
    userInput,
    mistakes,
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    languageHint,
    
    // 액션
    handleRestart,
    handleStart,
    handleKeyPress,
    handleBackspace,
    handleTestCompletion,
    pauseTest,
    resumeTest,
    stopTest,
    setLanguageHint,
    
    // 유틸리티
    generateNewText,
  };
}