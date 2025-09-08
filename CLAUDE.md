# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
한글 타자연습 웹 애플리케이션 - Next.js 15 + React 19 기반

## 빌드 및 개발 명령어

### 개발 서버
```bash
npm run dev              # Turbopack 개발 서버 실행 (http://localhost:3000)
npm run dev:debug        # 디버그 모드로 개발 서버 실행
```

### 빌드 및 배포
```bash
npm run build            # 프로덕션 빌드 (Turbopack)
npm run build:analyze    # 번들 분석과 함께 빌드
npm run start            # 프로덕션 서버 실행
```

### 코드 품질 검사
```bash
npm run lint             # ESLint 실행
npm run lint:fix         # ESLint 자동 수정
npm run type-check       # TypeScript 타입 체크
```

### 유지보수
```bash
npm run clean            # .next 빌드 폴더 삭제
```

## 아키텍처 구조

### Clean Architecture (헥사고날 아키텍처)
```
src/
├── domain/           # 비즈니스 로직 (엔티티, 값 객체, 도메인 서비스)
├── application/      # 유스케이스 및 애플리케이션 서비스
├── infrastructure/   # 외부 의존성 (리포지토리 구현, DI 컨테이너)
├── presentation/     # UI 계층 (컴포넌트, 훅)
└── app/             # Next.js App Router
```

### 핵심 원칙
- **의존성 역전**: 내부 계층이 외부 계층에 의존하지 않음
- **DI Container**: `/src/infrastructure/container/DIContainer.ts`를 통한 의존성 주입
- **인터페이스 우선**: 도메인 계층에서 인터페이스 정의, 인프라에서 구현

## 주요 기술 스택
- **Next.js 15.5.2** (App Router, Turbopack)
- **React 19.1.0**
- **TypeScript 5** (절대 경로 `@/*` 지원)
- **TailwindCSS 4**
- **Zustand 5** (상태 관리)
- **Framer Motion 12** (애니메이션)
- **hangul-js** (한글 처리)

## 중요 개발 규칙

### 새 기능 추가 플로우
1. Domain 계층에서 엔티티/값 객체 정의
2. Application 계층에서 유스케이스 작성
3. Infrastructure 계층에서 필요한 서비스 구현
4. DIContainer에 서비스 등록
5. Presentation 계층에서 UI 개발

### 한글 처리 관련
- **HangulService**: `/src/domain/services/HangulService.ts` - 한글 분해/조합 로직
- **useHangulIME Hook**: `/src/presentation/hooks/useHangulIME.ts` - IME 처리
- **hangul-js 라이브러리** 활용

### 상태 관리
- **메인 Store**: `/src/store/typingStore.ts`
- **간단 모드**: `/src/store/simpleTypingStore.ts`
- **고급 모드**: `/src/store/enhancedTypingStore.ts`
- Zustand 기반, 액션과 상태 분리

### 타입 안전성
- 엄격한 TypeScript 설정
- 모든 계층간 DTO 사용
- 인터페이스 기반 프로그래밍

### SSR 고려사항
- Next.js App Router 사용
- 클라이언트 컴포넌트는 'use client' 지시문 필수
- localStorage 접근 시 `typeof window !== 'undefined'` 체크

### 순환 참조 방지
- 계층별 단방향 의존성 유지
- DI Container를 통한 의존성 주입 (`/src/infrastructure/di/DIContainer.ts`)
- 인터페이스를 통한 느슨한 결합

## 디렉토리별 역할

### /src/domain
- 비즈니스 로직의 핵심
- 외부 의존성 없음
- 순수 TypeScript 클래스

### /src/application
- 유스케이스 오케스트레이션
- 도메인과 인프라 연결
- DTO 정의

### /src/infrastructure
- 외부 서비스 구현
- 리포지토리 구현체
- DI Container 관리

### /src/presentation
- React 컴포넌트
- 커스텀 훅
- UI 로직

### /src/components
- 레거시 컴포넌트 (점진적 마이그레이션 중)
- SimpleTypingPractice, EnhancedTypingPractice 등

### /src/store
- Zustand 기반 상태 관리
- typingStore.ts: 메인 타이핑 스토어

### /src/utils
- 한글 처리 유틸리티
- koreanUtils.ts, simpleKoreanUtils.ts, enhancedKoreanUtils.ts, advancedKoreanUtils.ts

### /src/data
- 예제 문장 및 단어 데이터
- 한글/영어 문장 난이도별 구분 (easy, medium, hard)

## 환경 설정
- **개발**: `NODE_ENV=development`
- **프로덕션**: `NODE_ENV=production`
- **cross-env** 필수 사용 (Windows 호환성)

## 빌드 설정 특이사항
- TypeScript/ESLint 오류 무시 설정 (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- Turbopack 기본 사용
- 절대 경로 import (`@/*`)