# Korean Typing Master - 월루 타자연습

한글/영문 타자연습 웹앱 - 정확한 IME 지원과 실시간 통계 제공

## 🚀 주요 기능

- **한글 IME 완벽 지원**: hangul-js, es-hangul을 활용한 정확한 한글 입력 처리
- **실시간 통계**: WPM, CPM, 정확도, 일관성 등 상세한 타자 분석
- **모듈형 텍스트 시스템**: 난이도별, 카테고리별 다양한 연습 텍스트
- **티어 진급 시스템**: Bronze → Silver → Gold → Platinum → Diamond → Master
- **테마 지원**: Light, Dark, Neon 테마
- **키보드 숏컷**: 효율적인 연습을 위한 다양한 단축키
- **크로스 플랫폼**: Windows, macOS, Linux, 모바일 지원

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **상태관리**: Zustand
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI
- **애니메이션**: Framer Motion
- **아이콘**: React Icons
- **차트**: Recharts
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **한글처리**: hangul-js, es-hangul, korean-js

## 📦 설치 및 실행

### 필요 조건
- Node.js >= 20.0.0
- Yarn >= 1.22.0

### 설치
```bash
# 프로젝트 클론
git clone [repository-url]
cd korean-typing-master

# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev
```

### 빌드
```bash
# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start
```

## 🎮 사용법

### 기본 연습
1. 메인 페이지에서 언어 선택 (한국어/English)
2. 텍스트 타입 및 난이도 설정
3. 텍스트 영역 클릭 또는 키 입력으로 연습 시작
4. 실시간 통계 확인

### 키보드 숏컷
- `Space`: 연습 시작/일시정지
- `Ctrl+R`: 다시 시작  
- `Ctrl+N`: 새 텍스트
- `Alt+L`: 언어 전환
- `Ctrl+T`: 테마 변경
- `Ctrl+/`: 숏컷 도움말

## 🏗 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── practice/          # 타자연습 컴포넌트  
│   └── ui/               # 재사용 UI 컴포넌트
├── core/                  # 비즈니스 로직
│   ├── typing/           # 타자연습 엔진
│   ├── text/            # 텍스트 모듈 시스템
│   ├── tier/           # 티어 시스템
│   └── shortcuts/      # 키보드 숏컷
├── stores/               # Zustand 상태 관리
├── data/                # 텍스트 모듈 & 테마
└── types/              # TypeScript 타입 정의
```

## 🎨 테마 시스템

CSS 변수를 활용한 동적 테마 시스템:

```css
/* 라이트 테마 */
--typing-correct: #10b981
--typing-incorrect: #ef4444  
--typing-current: #3b82f6

/* 다크 테마 */
--typing-correct: #34d399
--typing-incorrect: #f87171
--typing-current: #60a5fa
```

## 📊 통계 시스템

- **WPM (Words Per Minute)**: 분당 단어 수
- **CPM (Characters Per Minute)**: 분당 문자 수
- **정확도**: 올바른 키 입력 비율
- **일관성**: 키 입력 간격의 일관성
- **에러율**: 실수 빈도 분석

## 🏆 티어 시스템

| 티어 | WPM | 정확도 | 연속성공 |
|------|-----|---------|----------|
| 🥉 Bronze | 20+ | 85%+ | 5회 |
| 🥈 Silver | 35+ | 88%+ | 7회 |  
| 🥇 Gold | 50+ | 92%+ | 10회 |
| 💎 Platinum | 65+ | 95%+ | 15회 |
| 💠 Diamond | 80+ | 97%+ | 20회 |
| 👑 Master | 100+ | 98%+ | 25회 |

## 🤝 개발 가이드

### 개발 명령어
```bash
yarn dev          # 개발 서버
yarn build        # 프로덕션 빌드
yarn start        # 프로덕션 서버
yarn lint         # 린트 검사
yarn type-check   # 타입 검사
```

### 개발 원칙
- **관심사 분리**: Core/UI/Data 계층 분리
- **단일 책임**: 각 컴포넌트는 하나의 책임만
- **순환참조 금지**: 모듈 간 의존성 주의
- **성능 우선**: 60fps 타자 입력 처리
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 📄 라이선스

MIT License

## 🙋‍♂️ 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

**Made with ❤️ for Korean typing practice**