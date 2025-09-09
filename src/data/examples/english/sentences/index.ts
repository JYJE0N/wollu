// English Sentences Master Export
export * from './short';
export * from './medium';
export * from './long';

import { allEnglishShortSentences } from './short';
import { allEnglishMediumSentences } from './medium/index';
import { allEnglishLongSentences } from './long';

// Sentences by length
export const englishSentencesByLength = {
  short: allEnglishShortSentences,
  medium: allEnglishMediumSentences,
  long: allEnglishLongSentences
};

// All English sentences
export const allEnglishSentences = [
  ...allEnglishShortSentences,
  ...allEnglishMediumSentences,
  ...allEnglishLongSentences
];