import { LanguagePack } from '@/types'
import { koreanLanguagePack } from './korean'
import { englishLanguagePack } from './english'

export const languagePacks: Record<string, LanguagePack> = {
  korean: koreanLanguagePack,
  english: englishLanguagePack
}

export const getLanguagePack = (languageId: string): LanguagePack | null => {
  return languagePacks[languageId] || null
}

export const getAvailableLanguages = (): string[] => {
  return Object.keys(languagePacks)
}

export { koreanLanguagePack, englishLanguagePack }