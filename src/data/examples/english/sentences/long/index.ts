// English Long Sentences Export
export { narrativeEnglishLongSentences } from './narrative';
export { academicEnglishLongSentences } from './academic';

// Combine all long sentences
import { narrativeEnglishLongSentences } from './narrative';
import { academicEnglishLongSentences } from './academic';

export const allEnglishLongSentences = [
  ...narrativeEnglishLongSentences,
  ...academicEnglishLongSentences
];

export const englishLongSentencesByType = {
  narrative: narrativeEnglishLongSentences,
  academic: academicEnglishLongSentences,
  all: allEnglishLongSentences
};