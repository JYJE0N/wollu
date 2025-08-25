"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Ghost, Sparkles, Clock, Type, Timer, X } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { useSettingsStore } from '@/stores/settingsStore';
// Hash, overlayStyles, textStyles, cn 미사용으로 제거


interface SettingsMenuProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SettingsMenu({ className = '', isOpen: externalIsOpen, onClose }: SettingsMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 외부에서 isOpen을 제어하는지 내부에서 제어하는지 결정
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  // setIsOpen은 closePromotionModal에서만 사용되므로 제거
  
  const { 
    ghostModeEnabled,
    typingEffectsEnabled,
    countdownEnabled,
    setGhostModeEnabled,
    setTypingEffectsEnabled,
    setCountdownEnabled,
    testMode,
    setTestMode,
    testTarget,
    setTestTarget,
    // textType,
    // setTextType, // 현재 미사용
    sentenceLength,
    setSentenceLength,
    sentenceStyle,
    setSentenceStyle
  } = useSettingsStore();

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // 설정 옵션 정의
  const testModeOptions = [
    { value: 'words', label: '단어' },
    { value: 'sentences', label: '문장' }
  ];

  const getTestTargetOptions = () => {
    if (testMode === 'words') {
      return [
        { value: '10', label: '10개' },
        { value: '25', label: '25개' },
        { value: '50', label: '50개' },
        { value: '100', label: '100개' }
      ];
    } else {
      return [
        { value: '1', label: '1개' },
        { value: '3', label: '3개' },
        { value: '5', label: '5개' },
        { value: '10', label: '10개' }
      ];
    }
  };

  // 단어 스타일 옵션 (현재 미사용)
  // const wordStyleOptions = [
  //   { value: 'plain', label: '일반' }
  // ];

  const sentenceLengthOptions = [
    { value: 'short', label: '단문' },
    { value: 'medium', label: '중문' },
    { value: 'long', label: '장문' }
  ];

  const sentenceStyleOptions = [
    { value: 'plain', label: '일반' },
    { value: 'punctuation', label: '구두점' },
    { value: 'numbers', label: '숫자' },
    { value: 'mixed', label: '혼합' }
  ];

  // 설정 컨텐츠 렌더링 함수
  const renderSettingsContent = () => (
    <div className="space-y-6">
      {/* 닫기 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-text-primary">설정</h2>
        <button
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              setInternalIsOpen(false);
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-secondary)'
          }}
          aria-label="설정 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* 테스트 설정 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-interactive-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            기본 설정
          </h3>
        </div>
        
        <div className="space-y-5">
          {/* 테스트 모드 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1 text-text-primary">
                모드
              </label>
              <p className="text-xs text-text-tertiary">
                단어 또는 문장 기준 선택
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={testModeOptions}
                value={testMode}
                onChange={(value) => setTestMode(value as 'words' | 'sentences')}
                size="sm"
              />
            </div>
          </div>

          {/* 목표값 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="text-sm font-medium block mb-1 text-text-primary">
                목표
              </label>
              <p className="text-xs text-text-tertiary">
                {testMode === 'words' ? '단어 개수' : '문장 개수'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={getTestTargetOptions()}
                value={testTarget.toString()}
                onChange={(value) => setTestTarget(parseInt(value))}
                size="sm"
              />
            </div>
          </div>

          {/* 문장 모드일 때 길이 선택 */}
          {testMode === 'sentences' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-1 text-text-primary">
                    길이
                  </label>
                  <p className="text-xs text-text-tertiary">
                    단문 · 중문 · 장문
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ButtonGroup
                    options={sentenceLengthOptions}
                    value={sentenceLength}
                    onChange={(value) => setSentenceLength(value as 'short' | 'medium' | 'long')}
                    size="sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-1 text-text-primary">
                    스타일
                  </label>
                  <p className="text-xs text-text-tertiary">
                    일반 · 구두점 · 숫자 · 혼합
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ButtonGroup
                    options={sentenceStyleOptions}
                    value={sentenceStyle}
                    onChange={(value) => setSentenceStyle(value as 'plain' | 'punctuation' | 'numbers' | 'mixed')}
                    size="sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div 
        className="border-t opacity-50"
        style={{ borderColor: 'var(--color-text-tertiary)' }}
      />

      {/* 고급 기능 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-interactive-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            고급 설정
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* 고스트 모드 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-elevated">
                <Ghost className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <span className="text-sm font-medium block text-text-primary">
                  고스트 모드
                </span>
                <p className="text-xs text-text-tertiary">
                  이전 기록과 비교
                </p>
              </div>
            </div>
            <Switch
              checked={ghostModeEnabled}
              onChange={setGhostModeEnabled}
              size="md"
            />
          </div>
          
          {/* 타이핑 이펙트 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-elevated">
                <Type className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <span className="text-sm font-medium block text-text-primary">
                  타이핑 이펙트
                </span>
                <p className="text-xs text-text-tertiary">
                  시각적 효과 활성화
                </p>
              </div>
            </div>
            <Switch
              checked={typingEffectsEnabled}
              onChange={setTypingEffectsEnabled}
              size="md"
            />
          </div>
          
          {/* 카운트다운 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-elevated">
                <Timer className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <span className="text-sm font-medium block text-text-primary">
                  카운트다운
                </span>
                <p className="text-xs text-text-tertiary">
                  3초 준비 시간
                </p>
              </div>
            </div>
            <Switch
              checked={countdownEnabled}
              onChange={setCountdownEnabled}
              size="md"
            />
          </div>

        </div>
      </div>
    </div>
  );

  // 외부에서 제어하는 경우 버튼을 렌더링하지 않음
  if (externalIsOpen !== undefined) {
    return isOpen ? (
      <div 
        ref={dropdownRef}
        className="absolute top-full mt-2 p-4 md:p-6 z-[9999] shadow-2xl rounded-xl backdrop-blur-sm"
        style={{ 
          backgroundColor: 'var(--color-background)', 
          borderColor: 'var(--color-border)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          right: '0.5rem',
          width: 'calc(100vw - 1rem)',
          maxWidth: '24rem'
        }}
      >
        {renderSettingsContent()}
      </div>
    ) : null;
  }

  // 내부에서 제어하는 기존 방식
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 설정 버튼 */}
      <button
        onClick={() => setInternalIsOpen(!internalIsOpen)}
        className={`settings-menu-button flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${internalIsOpen ? 'active' : ''}`}
      >
        <Settings className="w-4 h-4" />
        설정
      </button>

      {/* 드롭다운 메뉴 */}
      {internalIsOpen && (
        <div 
          className="settings-menu-dropdown absolute top-full mt-2 p-4 md:p-6 z-[9999] shadow-2xl rounded-xl backdrop-blur-sm"
          style={{ 
            backgroundColor: 'var(--color-background)', 
            borderColor: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            right: '0.5rem',
            width: 'calc(100vw - 1rem)',
            maxWidth: '24rem'
          }}
        >
          {renderSettingsContent()}
        </div>
      )}
    </div>
  );
}