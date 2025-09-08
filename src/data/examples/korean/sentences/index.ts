// 한글 문장 전체 통합 내보내기
export * from './short';
export * from './medium';
export * from './long';

import { allKoreanShortSentences } from './short';
import { allKoreanMediumSentences } from './medium';
import { allKoreanLongSentences } from './long';

// 길이별 분류
export const koreanSentencesByLength = {
  short: allKoreanShortSentences,
  medium: allKoreanMediumSentences,
  long: allKoreanLongSentences
};

// 모든 한글 문장
export const allKoreanSentences = [
  ...allKoreanShortSentences,
  ...allKoreanMediumSentences,
  ...allKoreanLongSentences
];