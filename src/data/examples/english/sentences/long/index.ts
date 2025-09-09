// English Long Sentences Export
export { basicEnglishLongSentences } from './basic';
export { narrativeEnglishLongSentences } from './narrative';
export { academicEnglishLongSentences } from './academic';
export { punctuationEnglishLongSentences } from './punctuation';
export { numbersEnglishLongSentences } from './numbers';
export { mixedEnglishLongSentences } from './mixed';

// Combine all long sentences
import { basicEnglishLongSentences } from './basic';
import { narrativeEnglishLongSentences } from './narrative';
import { academicEnglishLongSentences } from './academic';
import { punctuationEnglishLongSentences } from './punctuation';
import { numbersEnglishLongSentences } from './numbers';
import { mixedEnglishLongSentences } from './mixed';

export const allEnglishLongSentences = [
  ...basicEnglishLongSentences,
  ...narrativeEnglishLongSentences,
  ...academicEnglishLongSentences,
  ...punctuationEnglishLongSentences,
  ...numbersEnglishLongSentences,
  ...mixedEnglishLongSentences
];

export const englishLongSentencesByType = {
  basic: [...basicEnglishLongSentences, ...narrativeEnglishLongSentences, ...academicEnglishLongSentences],
  punctuation: punctuationEnglishLongSentences,
  numbers: numbersEnglishLongSentences,
  mixed: mixedEnglishLongSentences,
  all: allEnglishLongSentences
};