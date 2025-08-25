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
- MongoDB operations go through `userProgressStore.ts`
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
   - `userProgressStore.ts`: MongoDB integration for user progress tracking and historical data

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
   - `userProgressStore.ts`: MongoDB integration for user progress tracking and historical data
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

- MongoDB with Mongoose ODM for user progress and test results
- Connection string should be provided via environment variables
- API routes: `/api/progress`, `/api/db-connection-test`
- Fallback to localStorage when MongoDB is unavailable

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

## Developer Tools

Available via `devTools` in browser console:

```javascript
devTools.testPromotion() // Quick tier promotion test
devTools.listTiers() // View all tier information
devTools.showPromotionModal(from, to) // Simulate specific promotion
```