import { koreanData } from './korean';
import { englishData } from './english';
import type { LanguageData } from './korean';

export type Language = 'ko' | 'en';

export const languages: Record<Language, LanguageData> = {
  ko: koreanData,
  en: englishData
};

export const getLanguageData = (language: Language): LanguageData => {
  return languages[language];
};

export const getAllLanguages = (): LanguageData[] => {
  return Object.values(languages);
};

export type { LanguageData };