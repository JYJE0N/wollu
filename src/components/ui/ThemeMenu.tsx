"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { IoColorPalette } from "react-icons/io5";
import { Palette, Check } from "lucide-react";

// 테마 정보 정의
const themeConfigs = {
  dark: {
    id: 'dark' as const,
    name: '다크',
    description: '깔끔한 어두운 테마',
    preview: '#282a36',
    category: 'standard'
  },
  light: {
    id: 'light' as const,
    name: '라이트',
    description: '밝고 깨끗한 테마',
    preview: '#ffffff',
    category: 'standard'
  },
  'high-contrast': {
    id: 'high-contrast' as const,
    name: '고대비',
    description: '높은 대비의 접근성 테마',
    preview: '#000000',
    category: 'standard'
  },
  stealth: {
    id: 'stealth' as const,
    name: '은밀 (트렐로)',
    description: '업무용 칸반 스타일',
    preview: '#026aa7',
    category: 'stealth'
  },
  'stealth-docs': {
    id: 'stealth-docs' as const,
    name: '은밀 (문서)',
    description: '구글 문서 스타일',
    preview: '#4285f4',
    category: 'stealth'
  },
  'stealth-slack': {
    id: 'stealth-slack' as const,
    name: '은밀 (슬랙)',
    description: '팀 협업 툴 스타일',
    preview: '#4a154b',
    category: 'stealth'
  },
  'stealth-notion': {
    id: 'stealth-notion' as const,
    name: '은밀 (노션)',
    description: '노션 문서 스타일',
    preview: '#37352f',
    category: 'stealth'
  }
} as const;

type ThemeId = keyof typeof themeConfigs;

const categoryLabels = {
  standard: '기본 테마',
  stealth: '은밀 모드'
} as const;

interface ThemeMenuProps {
  className?: string;
}

export function ThemeMenu({ className = '' }: ThemeMenuProps) {
  const { theme, setTheme } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleThemeSelect = (themeId: ThemeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  // 카테고리별로 테마 그룹핑
  const groupedThemes = Object.values(themeConfigs).reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof themeConfigs[ThemeId][]>);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 테마 선택 버튼 (팔레트) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors toolbar-icon ${isOpen ? 'active' : ''}`}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
        style={{
          backgroundColor: isOpen ? 'var(--color-background-elevated)' : 'transparent'
        }}
        title="테마 선택"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <IoColorPalette className="w-5 h-5" />
      </button>

      {/* 테마 선택 드롭다운 */}
      {isOpen && (
        <div className="theme-menu-dropdown absolute right-0 top-full mt-2 w-72 rounded-lg shadow-xl z-[9999] max-h-80 overflow-y-auto">
          <div className="p-3">
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-3 px-2">
              <Palette size={16} className="theme-menu-icon" />
              <h3 className="theme-menu-title text-sm font-semibold">
                테마 선택
              </h3>
            </div>
            
            {/* 테마 목록 */}
            {Object.entries(groupedThemes).map(([category, themes]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h4 className="theme-menu-category-label px-2 py-1 text-xs font-medium uppercase tracking-wide mb-2">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                <div className="space-y-1">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeSelect(themeOption.id)}
                      className={`theme-option-button w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-all duration-150 focus:outline-none ${theme === themeOption.id ? 'active' : ''}`}
                    >
                      <div className="font-medium text-sm">{themeOption.name}</div>
                      {theme === themeOption.id && (
                        <Check 
                          size={16} 
                          style={{ 
                            color: 'var(--color-text-inverse)',
                            strokeWidth: 2.5
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}