# K-Types 디자인 시스템 표준화 지침

## 1. 스페이싱 시스템
표준 여백 단위 (rem 기반):
- `spacing-xs`: 0.25rem (4px)
- `spacing-sm`: 0.5rem (8px)
- `spacing-md`: 1rem (16px)
- `spacing-lg`: 1.5rem (24px)
- `spacing-xl`: 2rem (32px)
- `spacing-2xl`: 3rem (48px)

## 2. 타이포그래피 계층
### 제목
- `title-lg`: 1.5rem (24px), font-weight: 700
- `title-md`: 1.25rem (20px), font-weight: 600
- `title-sm`: 1.125rem (18px), font-weight: 600

### 본문
- `text-lg`: 1rem (16px), font-weight: 500
- `text-md`: 0.875rem (14px), font-weight: 400
- `text-sm`: 0.75rem (12px), font-weight: 400

### 캡션
- `caption`: 0.625rem (10px), font-weight: 400

## 3. 카드 컴포넌트 표준
```
.card {
  background: var(--surface);
  border-radius: 0.5rem;
  border: 1px solid rgba(var(--text-secondary), 0.1);
  padding: var(--spacing-lg); /* 1.5rem */
}

.card-header {
  margin-bottom: var(--spacing-md); /* 1rem */
}

.card-title {
  font-size: var(--title-md);
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  color: var(--text-primary);
}
```

## 4. 버튼 컴포넌트 표준
### 크기
- `btn-sm`: padding: 0.375rem 0.75rem, font-size: 0.75rem
- `btn-md`: padding: 0.5rem 1rem, font-size: 0.875rem
- `btn-lg`: padding: 0.625rem 1.25rem, font-size: 1rem

### 변형
- `btn-primary`: 주요 액션 (accent color)
- `btn-secondary`: 보조 액션 (surface color)
- `btn-ghost`: 텍스트만 (투명 배경)
- `btn-outline`: 테두리만

### 상태
- `default`: 기본 상태
- `hover`: opacity: 0.9, transform: translateY(-1px)
- `active`: opacity: 0.8, transform: translateY(0)
- `disabled`: opacity: 0.5, cursor: not-allowed

## 5. 컴포넌트 간격 규칙
### 섹션
- 섹션 간격: `spacing-xl` (2rem)
- 섹션 내부 패딩: `spacing-lg` (1.5rem)

### 요소
- 제목과 컨텐츠: `spacing-md` (1rem)
- 리스트 아이템: `spacing-sm` (0.5rem)
- 인라인 요소: `spacing-xs` (0.25rem)

## 6. 색상 시스템
### 기본 색상
- `--background`: 배경
- `--surface`: 카드/컨테이너 배경
- `--text-primary`: 주요 텍스트
- `--text-secondary`: 보조 텍스트
- `--color-accent`: 강조 색상

### 상태 색상
- `--color-correct`: 정답/성공
- `--color-incorrect`: 오답/실패
- `--color-current`: 현재 활성