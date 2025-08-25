"use client";

import React from 'react';
import { IoPlay, IoReloadCircle, IoPauseSharp } from "react-icons/io5";
import { useDeviceContext } from "@/utils/deviceDetection";

interface KeyChipProps {
  children: React.ReactNode;
}

function KeyChip({ children }: KeyChipProps) {
  return (
    <div 
      className="rounded border"
      style={{
        padding: 'var(--spacing-1) var(--spacing-2)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: '600',
        backgroundColor: 'var(--color-shortcut-key-bg)',
        color: 'var(--color-shortcut-key-text)',
        borderColor: 'var(--color-shortcut-key-border)'
      }}
    >
      {children}
    </div>
  );
}

interface ShortcutRowProps {
  label: string;
  keys: string[];
  icon?: React.ReactNode;
}

function ShortcutRow({ label, keys, icon }: ShortcutRowProps) {
  return (
    <div 
      className="flex items-center rounded"
      style={{
        padding: 'var(--spacing-2) var(--spacing-3)',
        gap: 'var(--spacing-4)',
        backgroundColor: 'var(--color-shortcut-card-bg)'
      }}
    >
      <div 
        className="flex items-center"
        style={{ gap: 'var(--spacing-2)' }}
      >
        {icon && (
          <span 
            className="w-3 h-3"
            style={{ color: 'var(--color-shortcut-label-text)' }}
          >
            {icon}
          </span>
        )}
        <span 
          style={{ 
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500',
            color: 'var(--color-shortcut-label-text)' 
          }}
        >
          {label}
        </span>
      </div>
      <div 
        className="flex items-center"
        style={{ gap: 'var(--spacing-1)' }}
      >
        {keys.map((key, index) => {
          if (key === '또는') {
            return (
              <span 
                key={`or-${index}`}
                style={{ 
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-shortcut-separator)',
                  fontWeight: '400'
                }}
              >
                또는
              </span>
            );
          }
          return <KeyChip key={`${key}-${index}`}>{key}</KeyChip>;
        })}
      </div>
    </div>
  );
}

interface KeyboardShortcutsProps {
  showStart?: boolean;
  showRestart?: boolean;
  showContinue?: boolean;
  showPause?: boolean;
  showResume?: boolean;
  className?: string;
  forceHide?: boolean; // 강제 숨김 옵션
}

export function KeyboardShortcuts({ 
  showStart = false, 
  showRestart = false, 
  showContinue = false,
  showPause = false,
  showResume = false,
  className = '',
  forceHide = false
}: KeyboardShortcutsProps) {
  const deviceContext = useDeviceContext();
  
  // 모바일 가상키보드 환경에서는 단축키 숨김
  const shouldHideShortcuts = forceHide || !deviceContext.showKeyboardShortcuts;
  
  if (shouldHideShortcuts) {
    return null;
  }
  
  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className="flex flex-wrap items-center justify-center"
        style={{ gap: 'var(--spacing-2)' }}
      >
        {showStart && (
          <ShortcutRow 
            label="시작하기"
            keys={['클릭', '또는', '아무키']}
            icon={<IoPlay />}
          />
        )}
        {showPause && (
          <ShortcutRow 
            label="일시정지"
            keys={['ESC']}
            icon={<IoPauseSharp />}
          />
        )}
        {showResume && (
          <ShortcutRow 
            label="재개하기"
            keys={['클릭', '또는', '아무키']}
            icon={<IoPlay />}
          />
        )}
        {showRestart && (
          <ShortcutRow 
            label="새로고침"
            keys={['SHIFT', 'ENTER']}
            icon={<IoReloadCircle />}
          />
        )}
        {showContinue && (
          <ShortcutRow 
            label="연습 계속하기"
            keys={['SHIFT', 'TAB']}
            icon={<IoPlay />}
          />
        )}
      </div>
    </div>
  );
}