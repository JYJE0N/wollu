# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Tasks

```bash
# Install dependencies (using Yarn)
yarn install

# Run development server
yarn dev

# Build for production  
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Type check
yarn type-check

# Clean Mac-specific files
yarn clean

# Clean all (including .next and node_modules cache)
yarn clean:all
```

### Cross-Platform Development

This project uses `cross-env` to ensure environment variables work consistently across Windows, macOS, and Linux:

- **cross-env**: Sets NODE_ENV for both Windows (set) and Unix-like systems (export)
- All build scripts use cross-env to maintain compatibility between development environments
- Essential for teams using mixed operating systems (Windows/macOS)

## 핵심 문제점 분석

### 디바이스별 타자연습 활성화 문제

이 프로젝트에서 발견된 치명적인 문제들:

1. **모바일 입력 처리의 복잡성과 비일관성**
   - `InputHandler.tsx:623-708`: 모바일과 데스크톱이 완전히 다른 UI/UX
   - 모바일에서는 보이는 input 필드를 제공하지만, 데스크톱은 투명한 overlay input 사용
   - 이중 입력 처리 로직이 복잡하게 얽혀 있어 예측 불가능한 동작 발생

2. **iOS/iPad 키보드 활성화 문제**
   - `InputHandler.tsx:73-91`: iPad 전용 contenteditable="true" 설정이 타이핑 앱과 충돌
   - iOS에서 초기 자동 포커스 제한 (line 508)으로 사용자가 명시적으로 터치해야만 키보드 활성화
   - 가상키보드 감지 로직이 있지만 실제 타이핑 활성화와 연결되지 않음

3. **입력 이벤트 중복 처리**
   - `InputHandler.tsx:164-231`: handleInput과 composition 이벤트가 동시 처리되어 중복 입력
   - 모바일과 데스크톱에서 서로 다른 이벤트 경로로 같은 문자가 중복 처리됨
   - processedInputRef로 중복 방지 시도하지만 타이밍 이슈로 불완전

4. **IME 상태와 테스트 시작의 동기화 문제**
   - `InputHandler.tsx:141-156`: 테스트 시작과 IME 조합 상태가 비동기적으로 처리
   - 한글 입력 중 테스트가 시작되지 않거나 중간에 끊어지는 현상
   - useTypingStore.getState() 직접 호출로 React 상태 동기화 문제

5. **디바이스별 포커스 관리의 일관성 부족**
   - `InputHandler.tsx:55-114`: 각 디바이스마다 다른 포커스 전략
   - iOS는 사용자 인터랙션이 필수이지만, 타이핑 시작을 위한 명확한 UX 가이드 부족
   - 포커스 재시도 로직이 무한루프 방지를 위해 2회로 제한되어 실패 시 복구 불가

6. **아이패드 미니 가상 키보드 한글 자모조합 문제**
   - 아이패드 미니에서 가상 키보드를 통한 한글 입력 시 자모 조합이 불완전하게 처리
   - IME 조합 중간 상태에서 자모가 개별적으로 입력되어 완성된 한글 문자 형성 실패
   - 가상 키보드의 자모 입력과 실제 앱의 IME 처리 로직 간 동기화 문제
   - 터치 기반 입력에서 composition 이벤트 타이밍과 물리 키보드의 차이로 인한 문제

### 근본 원인
- 단일 컴포넌트에 모든 디바이스 로직 집중: InputHandler가 너무 많은 책임을 가짐
- 플랫폼별 분기 처리: iOS/Android/Desktop 각각 다른 코드 경로
- 상태 동기화 문제: React 상태와 실제 DOM 상태의 불일치
- 이벤트 경로 복잡성: input, composition, keydown 이벤트가 교차 처리

### 해결 방안
- 통합된 입력 처리 시스템: 플랫폼별 분기를 줄이고 일관된 입력 경로 구축
- 명확한 활성화 플로우: 모든 디바이스에서 동일한 "클릭 → 포커스 → 타이핑 시작" 흐름
- 상태 관리 단순화: React 상태와 DOM 상태 동기화 개선
- 디바이스별 최적화: 각 플랫폼의 특성을 살린 별도 컴포넌트 분리

## Critical Development Conventions

### Korean IME Handling

- Always use `isKoreanJamo()` utility from `@/utils/koreanIME` before processing keystroke events
- Korean jamo characters (자모) should be counted for CPM calculation but NOT for text progression
- IME composition state must be tracked to prevent duplicate keystroke registration
- Use `IMEHandler` class for cross-browser IME compatibility
- Korean stroke calculation uses dedicated utility in `@/utils/koreanStrokeCalculator`

### State Management Architecture

- All typing state flows through `typingStore.ts` - never bypass this store
- Use `eventBus` from `@/utils/eventBus` for cross-store communication
- Statistics updates are batched via `eventBus.emit('stats:update')` to prevent performance issues
- User progress persisted via `userProgressStore.ts`
- Settings are persisted in `settingsStore.ts` with localStorage

### Performance Requirements

- Keystroke handling must complete within 16ms (60fps requirement)
- Use `setTimeout` with minimal delays for test completion to ensure proper state settling
- Statistics calculations are batched every 250ms during active typing
- Memory cleanup is critical - always clear intervals and timeouts in useEffect cleanup
- Performance monitoring available via `@/utils/performanceMonitor`

## Architecture Overview

This is a Korean/English typing practice web application built with Next.js 15, React 19, and TypeScript. The application focuses on accurate Korean IME (Input Method Editor) handling and real-time typing statistics.

### Key Architecture Components

1. **State Management (Zustand stores)**

   - `typingStore.ts`: Core typing state including current position, keystrokes, mistakes, and test progress. Handles Korean jamo filtering to prevent double-counting during IME composition.
   - `statsStore.ts`: Real-time typing statistics calculation (CPM/WPM, accuracy, consistency)
   - `settingsStore.ts`: User preferences for language, theme, test mode, and test targets
   - `userProgressStore.ts`: User progress tracking and historical data storage

2. **Typing Engine (`src/components/core/`)**

   - `TypingEngine.tsx`: Main orchestrator component managing test lifecycle, timers, and IME composition states. Handles auto-navigation to `/stats` page on completion.
   - `InputHandler.tsx`: Captures keyboard input and handles IME composition events using transparent overlay
   - `TextRenderer.tsx`: Visual rendering of text with current position, correct/incorrect highlighting
   - `StatsCalculator.tsx`: Real-time circular progress charts for typing statistics
   - `TypingVisualizer.tsx`: Progress visualization during active typing
   - `GhostIndicator.tsx`: Shows comparison with personal best performance
   - `TestCompletionHandler.tsx`: Manages test completion flow and data persistence

3. **Korean IME Handling**

   - Special logic to filter Korean jamo characters (4 Unicode ranges: 0x3131-0x314F, 0x1100-0x11FF, 0x3130-0x318F, 0xA960-0xA97F)
   - IMEHandler class for cross-browser compatibility (Chrome/Firefox/Safari detection)
   - Duplicate input prevention with timing thresholds (3ms for general keys, 1ms for spaces)
   - Korean stroke-based CPM/WPM calculation separate from character progression
   - Language detection and mismatch handling in `@/utils/languageDetection`

4. **Test Modes**

   - Time-based: Fixed duration tests (15/30/60/120 seconds)
   - Word-based: Fixed word count tests (10/25/50/100 words)
   - Dynamic text generation based on language pack and text type

5. **Additional Systems**
   - `userProgressStore.ts`: User progress tracking and historical data storage
   - `ghostMode.ts`: Personal best comparison system that overlays previous performance
   - `typingEffects.ts`: Visual feedback effects during typing sessions
   - `tierSystem.ts`: Advanced gamification with tier-based promotion system (B→S→G→P→D→M)
   - `languageDetection.ts`: Korean-English language mismatch detection and auto-conversion
   - `devTools.ts`: Comprehensive developer tools for testing and debugging
   - `testCompletionManager.ts`: Centralized test completion and promotion handling

### Path Aliases

- `@/*` maps to `./src/*` for cleaner imports

### Styling

- Tailwind CSS 3.4 with extensive custom configuration in `tailwind.config.js`
- CSS variables for theme system supporting dark/light/high-contrast modes
- Custom Tailwind components for typing-specific UI (`.typing-text`, `.typing-char`, etc.)
- Pretendard font for Korean text, JetBrains Mono for typing interface

### Database Integration

- Prisma with PostgreSQL for user progress and test results
- Database connection configured via Prisma schema
- API routes: `/api/progress`, `/api/db-connection-test`
- Fallback to localStorage when database is unavailable

### Key File Locations

- Main typing page: `src/app/page.tsx`
- Statistics results: `src/app/stats/page.tsx`
- Theme initialization: `src/app/layout.tsx` (includes SSR-safe theme script)
- Global styles with CSS variables: `src/app/globals.css`
- Language packs: `src/modules/languages/` and `src/data/sentences/`
- Type definitions: `src/types/index.ts`

## UI/UX Guidelines

### Theme Color System

All colors must use CSS variables. Never hardcode color values.

```css
/* Correct usage */
backgroundColor: 'var(--color-interactive-primary)'
color: 'var(--color-text-primary)'

/* Wrong usage - never do this */
backgroundColor: '#3b82f6'
```

Key CSS variables:
- `--color-interactive-primary`: Primary interactive elements
- `--color-feedback-success`: Success feedback (green)
- `--color-feedback-error`: Error feedback (red)
- `--color-text-primary`: Primary text
- `--color-surface`: Card/panel backgrounds

### Icon Library

Project uses React Icons:
- `react-icons/io5`: IoPlay, IoPauseSharp, IoStop
- `react-icons/fa6`: FaChartColumn, FaKeyboard
- `react-icons/tb`: TbSettings
- `lucide-react`: General icons

No emojis in code - use text or icons instead.

### Interaction Patterns

Test start methods:
1. Click text field
2. Press any key
3. Click start button

Pause/resume:
- Any key or click to resume when paused

## Testing and Quality

- TypeScript strict mode enabled
- Run `yarn lint` before commits
- Run `yarn type-check` to verify types
- Test on mobile devices for virtual keyboard compatibility
- Verify Korean IME handling across browsers

## Environment and Dependencies

- **Node.js**: 새로운 의존성 추가 시 `yarn add` 사용 (npm 대신 yarn 사용 필수)
- **Database**: Prisma 클라이언트를 통한 PostgreSQL 연결
- **Environment Variables**: DATABASE_URL 등 Prisma 환경변수 설정 필요

## Developer Tools

Available via `devTools` in browser console:

```javascript
devTools.testPromotion() // Quick tier promotion test
devTools.listTiers() // View all tier information
devTools.showPromotionModal(from, to) // Simulate specific promotion
```