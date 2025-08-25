import { Sentence, SentenceCollection, ContentSource } from '@/types'
import { 
  koreanSentences, 
  koreanCollections, 
  contentSources as koreanSources 
} from './korean'
import { 
  englishSentences, 
  englishCollections, 
  contentSources as englishSources 
} from './english'

// 모든 문장 데이터 통합
export const allSentences: Sentence[] = [
  ...koreanSentences,
  ...englishSentences
]

// 모든 컬렉션 통합
export const allCollections: SentenceCollection[] = [
  ...koreanCollections, 
  ...englishCollections
]

// 모든 콘텐츠 소스 통합
export const allContentSources: ContentSource[] = [
  ...koreanSources,
  ...englishSources
]

// 언어별 필터링 함수
export function getSentencesByLanguage(language: string): Sentence[] {
  return allSentences.filter(sentence => sentence.language === language)
}

export function getCollectionsByLanguage(language: string): SentenceCollection[] {
  return allCollections.filter(collection => collection.language === language)
}

// 난이도별 필터링 함수
export function getSentencesByDifficulty(difficulty: string, language?: string): Sentence[] {
  let filtered = allSentences.filter(sentence => sentence.difficulty === difficulty)
  if (language) {
    filtered = filtered.filter(sentence => sentence.language === language)
  }
  return filtered
}

// 카테고리별 필터링 함수
export function getSentencesByCategory(category: string, language?: string): Sentence[] {
  let filtered = allSentences.filter(sentence => sentence.category === category)
  if (language) {
    filtered = filtered.filter(sentence => sentence.language === language)
  }
  return filtered
}

// 컬렉션에서 문장 가져오기
export function getSentencesFromCollection(collectionId: string): Sentence[] {
  const collection = allCollections.find(col => col.id === collectionId)
  if (!collection) return []
  
  return collection.sentences.map(sentenceId => 
    allSentences.find(sentence => sentence.id === sentenceId)
  ).filter(Boolean) as Sentence[]
}

// 기본 컬렉션 가져오기
export function getDefaultCollections(language?: string): SentenceCollection[] {
  let collections = allCollections.filter(col => col.isDefault)
  if (language) {
    collections = collections.filter(col => col.language === language)
  }
  return collections
}

// 랜덤 문장 생성기
export function getRandomSentences(
  count: number, 
  options?: {
    language?: string
    difficulty?: string
    category?: string
    excludeIds?: string[]
  }
): Sentence[] {
  let filtered = [...allSentences]
  
  if (options?.language) {
    filtered = filtered.filter(s => s.language === options.language)
  }
  if (options?.difficulty) {
    filtered = filtered.filter(s => s.difficulty === options.difficulty)
  }
  if (options?.category) {
    filtered = filtered.filter(s => s.category === options.category)
  }
  if (options?.excludeIds) {
    filtered = filtered.filter(s => !options.excludeIds!.includes(s.id))
  }
  
  // 셔플하고 요청된 개수만큼 반환
  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 문장 메타데이터 계산 유틸리티
export function calculateSentenceMetadata(text: string) {
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const characters = text.length
  const punctuation = (text.match(/[.,!?;:"'()]/g) || []).length
  const numbers = (text.match(/\d/g) || []).length
  
  return {
    wordCount: words.length,
    characterCount: characters,
    avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
    punctuationCount: punctuation,
    numberCount: numbers,
    estimatedWPM: Math.max(100, 300 - (characters / words.length) * 10) // 단어 길이에 따른 추정 WPM
  }
}