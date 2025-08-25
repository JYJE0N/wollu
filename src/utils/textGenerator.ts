import { LanguagePack, TextType, TestMode, SentenceLength, SentenceStyle } from '@/types'
import { stealthSentences, type StealthTextType } from '@/data/sentences/stealth'
import { getSentencesByType, getRandomSentencesFromPool } from '@/data/sentences/utils'

interface TextGenerationOptions {
  wordCount?: number
  includeCapitalization?: boolean
  includePunctuation?: boolean
  includeNumbers?: boolean
  stealthMode?: StealthTextType | null
}

interface NewTextGenerationOptions {
  mode: TestMode
  count: number  // 단어 개수 또는 문장 개수
  sentenceLength?: SentenceLength
  sentenceStyle?: SentenceStyle
}

export class TextGenerator {
  private languagePack: LanguagePack

  constructor(languagePack: LanguagePack) {
    this.languagePack = languagePack
  }

  // 새로운 메인 텍스트 생성 함수 (개선된 로직)
  generateNewText(options: NewTextGenerationOptions): string {
    const { mode, count, sentenceLength = 'short', sentenceStyle = 'plain' } = options

    console.log(`📝 새로운 텍스트 생성 - 모드: ${mode}, 개수: ${count}, 길이: ${sentenceLength}, 스타일: ${sentenceStyle}`)

    if (mode === 'words') {
      // 단어 모드: 순수 단어만 생성
      return this.generatePlainWords(count)
    } else if (mode === 'sentences') {
      // 문장 모드: 길이와 스타일에 따라 문장 생성
      return this.generateSentencesByLengthAndStyle(sentenceLength, sentenceStyle, count)
    }

    return this.generatePlainWords(count) // 기본값
  }

  // 순수 단어 생성 (구두점, 숫자 제외) - 중복 방지
  private generatePlainWords(count: number): string {
    const words = this.languagePack.wordLists.plain
    const selectedWords: string[] = []

    console.log(`📝 순수 단어 생성 - 개수: ${count}`)
    console.log(`📝 사용 가능한 단어 수: ${words.length}`)

    // 사용 가능한 단어 풀 복사 (중복 방지를 위해)
    const availableWords = [...words]

    for (let i = 0; i < count; i++) {
      if (availableWords.length === 0) {
        // 모든 단어를 사용했으면 풀을 다시 채움
        availableWords.push(...words)
        console.log(`📝 단어 풀 리셋 - ${i + 1}번째 단어부터 재사용`)
      }

      // 랜덤 인덱스 선택 후 해당 단어 제거
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const selectedWord = availableWords[randomIndex]
      selectedWords.push(selectedWord)
      
      // 사용된 단어를 풀에서 제거
      availableWords.splice(randomIndex, 1)
    }

    const result = selectedWords.join(' ')
    console.log(`📝 생성된 단어 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 길이와 스타일에 따른 문장 생성 - 중복 방지
  private generateSentencesByLengthAndStyle(
    length: SentenceLength, 
    style: SentenceStyle, 
    count: number = 1
  ): string {
    // 새로운 모듈화된 구조 사용
    const language = this.languagePack.id === 'korean' ? 'korean' : 'english'
    const sentences = getRandomSentencesFromPool(language, length, style, count)
    
    if (!sentences || sentences.length === 0) {
      console.warn(`⚠️ 새 구조에서 문장을 찾을 수 없음: ${language} ${length} ${style}`)
      
      // 기존 구조 폴백 시도
      const fallbackSentences = this.languagePack.sentences?.[length]?.[style]
      if (fallbackSentences && fallbackSentences.length > 0) {
        const selectedSentences: string[] = []
        const availableSentences = [...fallbackSentences]
        
        for (let i = 0; i < count; i++) {
          if (availableSentences.length === 0) {
            availableSentences.push(...fallbackSentences)
          }
          const randomIndex = Math.floor(Math.random() * availableSentences.length)
          selectedSentences.push(availableSentences[randomIndex])
          availableSentences.splice(randomIndex, 1)
        }
        
        const result = selectedSentences.join(' ')
        console.log(`📝 기존 구조로 생성된 문장: ${result.substring(0, 100)}...`)
        return result
      }
      
      return this.generatePlainWords(10) // 최종 대체 텍스트
    }

    const result = sentences.join(' ')
    console.log(`📝 새 구조로 생성된 문장 (${language} ${length} ${style}): ${result.substring(0, 100)}...`)
    return result
  }

  // 레거시 메인 텍스트 생성 함수 (호환성 유지)
  generateText(type: TextType, options: TextGenerationOptions = {}): string {
    const { wordCount = 50, stealthMode = null } = options

    console.log(`📝 레거시 텍스트 생성 - 타입: ${type}, 목표: ${wordCount}, 은밀모드: ${stealthMode}`)

    // 은밀모드인 경우 해당 업무 텍스트 사용
    if (stealthMode) {
      return this.generateStealthText(stealthMode, wordCount)
    }

    switch (type) {
      case 'words':
        return this.generateWords(wordCount)
      case 'punctuation':
        return this.generateWithPunctuation(wordCount)
      case 'numbers':
        return this.generateWithNumbers(wordCount)
      case 'sentences':
        return this.generateSentences(Math.ceil(wordCount / 10)) // 레거시 지원
      case 'short-sentences':
        return this.generateSentencesByLength(wordCount * 2, 'short')   // 단문: 글자수 기준 (적은 양)
      case 'medium-sentences':
        return this.generateSentencesByLength(wordCount * 3, 'medium')  // 중문: 글자수 기준 (중간 양)
      case 'long-sentences':
        return this.generateSentencesByLength(wordCount * 4, 'long')    // 장문: 글자수 기준 (많은 양)
      default:
        return this.generateWords(wordCount)
    }
  }

  // 순수 단어만 생성 (구두점, 숫자 제외) - 레거시 호환성, 중복 방지
  private generateWords(count: number): string {
    // 새로운 구조 우선 시도
    const words = this.languagePack.wordLists.plain || []
    
    if (words.length === 0) {
      console.warn('⚠️ 단어 데이터를 찾을 수 없습니다.')
      return '단어 데이터 없음'
    }

    const selectedWords: string[] = []

    console.log(`📝 순수 단어 생성 - 개수: ${count}`)
    console.log(`📝 사용 가능한 단어 수: ${words.length}`)
    console.log(`📝 첫 10개 단어: ${words.slice(0, 10).join(', ')}`)

    // 사용 가능한 단어 풀 복사 (중복 방지를 위해)
    const availableWords = [...words]

    for (let i = 0; i < count; i++) {
      if (availableWords.length === 0) {
        // 모든 단어를 사용했으면 풀을 다시 채움
        availableWords.push(...words)
        console.log(`📝 레거시 단어 풀 리셋 - ${i + 1}번째 단어부터 재사용`)
      }

      // 랜덤 인덱스 선택 후 해당 단어 제거
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const selectedWord = availableWords[randomIndex]
      selectedWords.push(selectedWord)
      
      // 사용된 단어를 풀에서 제거
      availableWords.splice(randomIndex, 1)
    }

    const result = selectedWords.join(' ')
    console.log(`📝 생성된 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 구두점 포함 텍스트 생성 (단어 + 구두점 조합) - 레거시 호환성
  private generateWithPunctuation(count: number): string {
    // 새 구조에서는 구두점 포함 문장을 사용
    try {
      return this.generateSentencesByLengthAndStyle('short', 'punctuation', Math.ceil(count / 5))
    } catch (_error) {
      // 폴백: 기본 단어 사용
      const words = this.languagePack.wordLists.plain || []
      
      if (words.length === 0) {
        return '구두점 데이터 없음'
      }

      const selectedWords: string[] = []
      console.log(`📝 구두점 포함 텍스트 생성 - 개수: ${count} (폴백 모드)`)

      for (let i = 0; i < count; i++) {
        let word = words[Math.floor(Math.random() * words.length)]
        // 50% 확률로 구두점 추가
        if (Math.random() < 0.5) {
          const punctuation = [',', '.', '!', '?'][Math.floor(Math.random() * 4)]
          word += punctuation
        }
        selectedWords.push(word)
      }

      const result = selectedWords.join(' ')
      console.log(`📝 구두점 포함 텍스트 (폴백): ${result.substring(0, 100)}...`)
      return result
    }
  }

  // 숫자 포함 텍스트 생성 (단어 + 숫자 조합) - 레거시 호환성
  private generateWithNumbers(count: number): string {
    // 새 구조에서는 숫자 포함 문장을 사용
    try {
      return this.generateSentencesByLengthAndStyle('short', 'numbers', Math.ceil(count / 5))
    } catch (_error) {
      // 폴백: 기본 단어 사용
      const words = this.languagePack.wordLists.plain || []
      
      if (words.length === 0) {
        return '숫자 데이터 없음'
      }

      const selectedWords: string[] = []
      console.log(`📝 숫자 포함 텍스트 생성 - 개수: ${count} (폴백 모드)`)

      for (let i = 0; i < count; i++) {
        let word = words[Math.floor(Math.random() * words.length)]
        // 40% 확률로 숫자 추가
        if (Math.random() < 0.4) {
          const number = Math.floor(Math.random() * 100)
          word += number.toString()
        }
        selectedWords.push(word)
      }

      const result = selectedWords.join(' ')
      console.log(`📝 숫자 포함 텍스트 (폴백): ${result.substring(0, 100)}...`)
      return result
    }
  }

  // 문장 생성 (실제 문장 단위로 생성)
  private generateSentences(sentenceCount: number): string {
    console.log(`📝 문장 생성 - 목표 문장 수: ${sentenceCount}`)
    
    // 먼저 새로운 문장 데이터 시스템 사용 시도
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getRandomSentences } = require('@/data/sentences')
      const language = this.languagePack.id === 'korean' ? 'ko' : 'en'
      
      // 랜덤 문장들 가져오기
      const sentences = getRandomSentences(sentenceCount, { language })
      
      if (sentences && sentences.length > 0) {
        const selectedTexts = sentences.map((s: { text: string }) => s.text)
        const result = selectedTexts.join(' ')
        console.log(`📝 새 문장 시스템으로 생성: ${result.substring(0, 50)}...`)
        return result
      }
    } catch (_error) {
      console.log('새 문장 시스템을 사용할 수 없습니다. 레거시 방식을 사용합니다.')
    }

    // 레거시 문장 시스템 폴백 - 새 구조 시도
    let sentences: string[] = []
    
    // 새 구조에서 기본 단문 사용
    if (this.languagePack.sentences?.short?.plain) {
      sentences = this.languagePack.sentences.short.plain
    } else if (this.languagePack.sentences) {
      // 레거시 구조 사용
      sentences = this.languagePack.sentences as unknown as string[]
    }
    
    if (sentences.length === 0) {
      console.log('문장 데이터가 없어 기본 단어로 대체합니다.')
      // 문장이 없으면 기본 단어로 대체 (단어 개수는 문장 수 * 10)
      return this.generateWords(sentenceCount * 10)
    }

    const selectedSentences: string[] = []

    // 정확히 요청된 문장 수만큼 생성 - 중복 방지
    const availableSentences = [...sentences]
    
    for (let i = 0; i < sentenceCount; i++) {
      if (availableSentences.length === 0) {
        // 모든 문장을 사용했으면 풀을 다시 채움
        availableSentences.push(...sentences)
        console.log(`📝 레거시 문장 풀 리셋 - ${i + 1}번째 문장부터 재사용`)
      }

      // 랜덤 인덱스 선택 후 해당 문장 제거
      const randomIndex = Math.floor(Math.random() * availableSentences.length)
      const selectedSentence = availableSentences[randomIndex]
      selectedSentences.push(selectedSentence)
      
      // 사용된 문장을 풀에서 제거
      availableSentences.splice(randomIndex, 1)
    }

    const result = selectedSentences.join(' ')
    console.log(`📝 레거시 문장 시스템으로 생성: ${result.substring(0, 50)}...`)
    return result
  }

  // 문장 타입별 생성 (글자수 기준)
  private generateSentencesByLength(targetCharCount: number, sentenceType: 'short' | 'medium' | 'long' | 'any'): string {
    console.log(`📝 문장 생성 - 타입: ${sentenceType}, 목표 글자수: ${targetCharCount}`)
    
    // 문장 타입별 데이터 가져오기
    let sentences: string[] = []
    let typeName = ''
    
    switch (sentenceType) {
      case 'short':
        sentences = this.languagePack.sentences?.short?.plain || 
                   this.languagePack.shortSentences || []
        typeName = '단문 (속담)'
        break
      case 'medium':
        sentences = this.languagePack.sentences?.medium?.plain || 
                   this.languagePack.mediumSentences || []
        typeName = '중문 (가사/시)'
        break
      case 'long':
        sentences = this.languagePack.sentences?.long?.plain || 
                   this.languagePack.longSentences || []
        typeName = '장문 (책/사설)'
        break
      default:
        sentences = this.languagePack.sentences?.short?.plain || 
                   (this.languagePack.sentences as unknown as string[]) || []
        typeName = '일반 문장'
        break
    }

    console.log(`📝 ${typeName} 데이터 개수: ${sentences.length}`)

    if (sentences.length === 0) {
      console.log(`${typeName} 데이터가 없어 기본 단어로 대체합니다.`)
      return this.generateWords(Math.ceil(targetCharCount / 3)) // 한글 평균 3글자 = 1단어
    }

    // 목표 글자수에 맞춰 문장들 선택 - 중복 방지
    const selectedSentences: string[] = []
    const availableSentences = [...sentences]
    let currentCharCount = 0

    while (currentCharCount < targetCharCount) {
      if (availableSentences.length === 0) {
        // 모든 문장을 사용했으면 풀을 다시 채움
        availableSentences.push(...sentences)
        console.log(`📝 ${typeName} 풀 리셋`)
      }

      // 랜덤 인덱스 선택 후 해당 문장 제거
      const randomIndex = Math.floor(Math.random() * availableSentences.length)
      const selectedSentence = availableSentences[randomIndex]
      selectedSentences.push(selectedSentence)
      currentCharCount += selectedSentence.length
      
      // 사용된 문장을 풀에서 제거
      availableSentences.splice(randomIndex, 1)
      
      // 무한 루프 방지
      if (selectedSentences.length > 20) break
    }

    const result = selectedSentences.join(' ')
    console.log(`📝 ${typeName} 생성 완료 - 실제 글자수: ${result.length}, 문장수: ${selectedSentences.length}`)
    console.log(`📝 생성된 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 문장 길이별 필터 조건 생성
  private getSentenceLengthFilter(length: 'short' | 'medium' | 'long') {
    switch (length) {
      case 'short':
        return { minWords: 3, maxWords: 8 }  // 단문: 3-8단어
      case 'medium':
        return { minWords: 9, maxWords: 15 } // 중문: 9-15단어
      case 'long':
        return { minWords: 16, maxWords: 25 } // 장문: 16-25단어
      default:
        return { minWords: 5, maxWords: 15 }
    }
  }

  // 문장 길이별 예상 단어 수
  private getWordsPerSentence(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 6   // 단문 평균
      case 'medium':
        return 12  // 중문 평균
      case 'long':
        return 20  // 장문 평균
      default:
        return 10
    }
  }

  // 레거시 문장 배열을 길이별로 필터링
  private filterSentencesByLength(sentences: string[], length: 'short' | 'medium' | 'long'): string[] {
    const { minWords, maxWords } = this.getSentenceLengthFilter(length)
    
    return sentences.filter(sentence => {
      const wordCount = sentence.split(/\s+/).length
      return wordCount >= minWords && wordCount <= maxWords
    })
  }

  // 커스텀 텍스트 검증
  static validateCustomText(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!text || text.trim().length === 0) {
      errors.push('텍스트가 비어있습니다.')
    }

    if (text.length < 10) {
      errors.push('텍스트가 너무 짧습니다. (최소 10자)')
    }

    if (text.length > 10000) {
      errors.push('텍스트가 너무 깁니다. (최대 10,000자)')
    }

    // 지원하지 않는 문자 확인
    const unsupportedChars = text.match(/[^\w\s\p{Script=Hangul}.,!?;:'"()\-]/gu)
    if (unsupportedChars && unsupportedChars.length > 0) {
      errors.push(`지원하지 않는 문자가 포함되어 있습니다: ${[...new Set(unsupportedChars)].join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 텍스트 난이도 분석
  static analyzeTextDifficulty(text: string, languageId: string): {
    difficulty: 'easy' | 'medium' | 'hard'
    factors: string[]
  } {
    const factors: string[] = []
    let difficultyScore = 0

    // 문자 길이
    if (text.length > 500) {
      difficultyScore += 1
      factors.push('긴 텍스트')
    }

    // 구두점 포함
    const punctuationCount = (text.match(/[.,!?;:'"()]/g) || []).length
    if (punctuationCount > text.length * 0.1) {
      difficultyScore += 1
      factors.push('구두점 많음')
    }

    // 숫자 포함
    const numberCount = (text.match(/\d/g) || []).length
    if (numberCount > 0) {
      difficultyScore += 1
      factors.push('숫자 포함')
    }

    // 언어별 추가 분석
    if (languageId === 'korean') {
      // 한글 복잡도 (받침 있는 글자)
      const complexKorean = (text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || []).length
      if (complexKorean > text.length * 0.3) {
        difficultyScore += 1
        factors.push('복잡한 한글')
      }
    } else if (languageId === 'english') {
      // 영어 복잡도 (긴 단어, 대소문자 혼합)
      const longWords = text.split(' ').filter(word => word.length > 7).length
      if (longWords > 0) {
        difficultyScore += 1
        factors.push('긴 영어 단어')
      }

      const hasCapitals = /[A-Z]/.test(text)
      if (hasCapitals) {
        difficultyScore += 1
        factors.push('대소문자 혼합')
      }
    }

    let difficulty: 'easy' | 'medium' | 'hard'
    if (difficultyScore <= 1) {
      difficulty = 'easy'
    } else if (difficultyScore <= 3) {
      difficulty = 'medium'
    } else {
      difficulty = 'hard'
    }

    return { difficulty, factors }
  }

  // 은밀모드용 업무 텍스트 생성
  private generateStealthText(stealthMode: StealthTextType, targetLength: number): string {
    const sentences = stealthSentences[stealthMode] || stealthSentences.common
    
    let result = ''
    let currentLength = 0
    const targetChars = targetLength * 8 // 단어 수를 대략적인 글자 수로 변환
    
    // 랜덤하게 문장들을 선택하여 목표 길이에 맞춰 생성
    const shuffledSentences = [...sentences].sort(() => Math.random() - 0.5)
    
    for (const sentence of shuffledSentences) {
      if (currentLength >= targetChars) break
      
      if (result) {
        result += ' ' // 문장 사이 공백
      }
      
      result += sentence
      currentLength = result.length
      
      // 목표 길이에 도달하면 반복 종료
      if (currentLength >= targetChars) break
      
      // 모든 문장을 다 썼는데 아직 목표에 못 미쳤으면 다시 섞어서 반복
      if (shuffledSentences.indexOf(sentence) === shuffledSentences.length - 1 && currentLength < targetChars) {
        shuffledSentences.sort(() => Math.random() - 0.5)
      }
    }
    
    console.log(`🔒 은밀모드 텍스트 생성됨 - 모드: ${stealthMode}, 길이: ${result.length}자`)
    
    return result.trim()
  }
}