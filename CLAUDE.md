# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean Typing Master (월루 타자연습) - A cross-platform Korean/English typing practice web application focusing on:
- Accurate Korean IME (Input Method Editor) handling
- Real-time typing statistics (WPM, CPM, accuracy)
- Modular text system with quality-curated content
- Tier-based progression system
- Cross-browser compatibility (Chrome, Firefox, Safari)

## Common Development Tasks

```bash
# Package Manager: Yarn (required by project configuration)

# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production  
yarn build

# Start production server
yarn start

# Type checking
yarn type-check

# Linting
yarn lint

# Database migrations (if using PostgreSQL)
npx prisma migrate deploy
npx prisma generate
```

## Architecture & Core Systems

### 1. State Management (Zustand)
All state flows through centralized stores - never bypass:
- `useTypingStore`: Core typing state, keystroke handling, test progress
- `usePracticeStore`: Practice settings and configurations  
- `useTierStore`: Tier progression and evaluation
- `useThemeStore`: Theme management (light/dark/neon)
- `useLanguageStore`: Language settings and IME state
- `useShortcutStore`: Keyboard shortcut management

### 2. Core Typing Systems
Located in `src/core/`:
- `TypingEngine`: Central orchestrator for typing tests
- `IMEHandler`: Cross-browser Korean IME handling
- `AccuracyCalculator`: Real-time accuracy calculations
- `SpeedCalculator`: WPM/CPM calculations with Korean stroke support

### 3. Text Module System
Located in `src/data/modules/`:
- Modular JSON-based text content
- Categories: words/sentences with difficulty levels
- Language-specific modules (ko/en)
- Smart text selection based on user tier

### 4. Korean IME Critical Rules
- Use `hangul-js` for Korean character decomposition
- Filter Korean jamo (자모) for CPM but NOT text progression
- Jamo Unicode ranges: 0x3131-0x314F, 0x1100-0x11FF, 0x3130-0x318F, 0xA960-0xA97F
- Track IME composition state to prevent duplicate input
- 3ms threshold for duplicate key detection, 1ms for space

## Development Guidelines

### Performance Requirements
- Keystroke handling must complete within 16ms (60fps)
- Statistics batch updates every 250ms during typing
- Always cleanup intervals/timeouts in useEffect
- Memory management critical for long typing sessions

### Styling Conventions
- Tailwind CSS utility-first approach
- CSS variables for theming (NEVER hardcode colors)
- Key variables:
  - `--typing-correct`: Correct character color
  - `--typing-incorrect`: Incorrect character color
  - `--typing-current`: Current character highlight
  - `--typing-pending`: Untyped text color

### Component Patterns
- Strict separation of concerns between Core, UI, Data layers
- Single responsibility for each component
- Event-driven communication via EventBus
- Command pattern for user actions

### Testing Text Quality
Text modules must be:
- Relatable and engaging (philosophy, literature, modern memes)
- Properly categorized by difficulty
- Free from duplicates (validated by ModuleRegistry)
- Length-appropriate (short: 15자, medium: 25-30자, long: 30-50자)

## Keyboard Shortcuts

### Global Shortcuts
- `Ctrl+1`: Home
- `Ctrl+2`: Practice page
- `Ctrl+3`: Ranking page
- `Ctrl+4`: Profile page
- `Alt+L`: Toggle Korean/English
- `Ctrl+T`: Change theme
- `Ctrl+/`: Shortcut help

### Practice Page Shortcuts
- `Space`: Start/pause practice
- `Ctrl+R`: Restart
- `Ctrl+N`: New text
- `Ctrl+K`: Toggle keyboard visibility
- `Ctrl+S`: Toggle stats panel
- `1-6`: Select difficulty level

## Database Schema (PostgreSQL/Prisma)

Main entities:
- `User`: Tier, points, language preferences
- `Practice`: Test results with detailed metrics
- `PracticeSettings`: User-specific configurations
- `TierAttempt`: Tier promotion history

Fallback to localStorage when database unavailable.

## File Structure Reference

```
src/
├── app/                    # Next.js App Router
│   ├── practice/          # Main typing practice
│   └── practice/results/  # Results analysis
├── components/            # React components
│   ├── layout/           # Header, toolbar, navigation
│   ├── practice/         # Typing-specific components
│   └── ui/              # Reusable UI elements
├── core/                 # Business logic
│   ├── typing/          # Typing engine
│   ├── text/           # Text module system
│   ├── tier/          # Tier progression
│   └── shortcuts/     # Keyboard management
├── stores/            # Zustand state stores
└── data/             # Text modules and themes
```

## Critical Notes

1. **SSR Compatibility**: Ensure server-side rendering works correctly
2. **No Circular Dependencies**: Strict module boundaries
3. **Korean-First Design**: Prioritize Korean language support
4. **No Login Required**: Full functionality without authentication
5. **Cross-Platform**: Test on Windows, macOS, mobile browsers
6. **No Emojis in Code**: Use icons or text instead

## Related Projects

- `../wollu-proto/`: Prototype version with existing typing implementation
- `../wollu-type/`: Earlier iteration with basic features

When implementing features, reference these for proven patterns and solutions.