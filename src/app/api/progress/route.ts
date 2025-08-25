import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserProgress from '@/models/UserProgress'

// GET: 사용자 진행상황 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      // userId가 없으면 임시 ID 생성해서 반환
      const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return NextResponse.json({ 
        userId: tempUserId,
        isNew: true,
        progress: null 
      })
    }
    
    let userProgress = await UserProgress.findOne({ userId })
    
    if (!userProgress) {
      // 새 사용자 생성
      userProgress = await UserProgress.create({
        userId,
        bestCPM: 0,
        bestWPM: 0,
        bestAccuracy: 0,
        bestConsistency: 0,
        totalTests: 0,
        totalTime: 0,
        totalWords: 0,
        totalKeystrokes: 0,
        totalMistakes: 0,
        averageCPM: 0,
        averageWPM: 0,
        averageAccuracy: 0,
        averageConsistency: 0,
        improvementTrend: [],
        weakCharacters: [],
        commonMistakes: [],
        recentTests: [],
        currentStreak: 0,
        longestStreak: 0,
      })
    }
    
    return NextResponse.json({ 
      userId,
      isNew: false,
      progress: userProgress 
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}

// POST: 테스트 결과 저장
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { userId, testRecord } = body
    
    if (!userId || !testRecord) {
      return NextResponse.json(
        { error: 'Missing userId or testRecord' },
        { status: 400 }
      )
    }
    
    // 데이터 검증 및 정리
    const cleanTestRecord = {
      ...testRecord,
      cpm: isNaN(testRecord.cpm) || !isFinite(testRecord.cpm) ? 0 : testRecord.cpm,
      wpm: isNaN(testRecord.wpm) || !isFinite(testRecord.wpm) ? 0 : testRecord.wpm,
      accuracy: isNaN(testRecord.accuracy) || !isFinite(testRecord.accuracy) ? 100 : testRecord.accuracy,
      consistency: isNaN(testRecord.consistency) || !isFinite(testRecord.consistency) ? 0 : testRecord.consistency,
      wordsTyped: testRecord.wordsTyped || 0,
      mistakes: testRecord.mistakes || 0,
      keystrokes: testRecord.keystrokes || 0,
    }
    
    let userProgress = await UserProgress.findOne({ userId })
    
    if (!userProgress) {
      userProgress = new UserProgress({ userId })
    }
    
    // 테스트 기록 추가
    try {
      await userProgress.addTestRecord(cleanTestRecord)
      console.log('✅ Test record added successfully')
    } catch (addError) {
      console.error('❌ Error adding test record:', addError)
      throw new Error(`Failed to add test record: ${addError instanceof Error ? addError.message : 'Unknown error'}`)
    }
    
    // 스트릭 업데이트
    try {
      await userProgress.updateStreak()
      console.log('✅ Streak updated successfully')
    } catch (streakError) {
      console.error('❌ Error updating streak:', streakError)
      throw new Error(`Failed to update streak: ${streakError instanceof Error ? streakError.message : 'Unknown error'}`)
    }
    
    return NextResponse.json({ 
      success: true,
      progress: userProgress 
    })
  } catch (error) {
    console.error('Error saving test record:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack
    })
    return NextResponse.json(
      { 
        error: 'Failed to save test record',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// PUT: 약점 분석 업데이트
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { userId, characterStats, mistakePatterns } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }
    
    const userProgress = await UserProgress.findOne({ userId })
    
    if (!userProgress) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 문자별 통계 업데이트
    if (characterStats) {
      for (const stat of characterStats) {
        const existing = userProgress.weakCharacters.find((c: any) => c.char === stat.char)
        if (existing) {
          existing.totalAttempts += stat.totalAttempts || 1
          existing.mistakes += stat.mistakes || 0
          existing.averageTime = stat.averageTime || existing.averageTime
        } else {
          userProgress.weakCharacters.push(stat)
        }
      }
      
      // 실수율 순으로 정렬하고 상위 50개만 유지
      userProgress.weakCharacters.sort((a: any, b: any) => {
        const errorRateA = a.mistakes / a.totalAttempts
        const errorRateB = b.mistakes / b.totalAttempts
        return errorRateB - errorRateA
      })
      userProgress.weakCharacters = userProgress.weakCharacters.slice(0, 50)
    }
    
    // 실수 패턴 업데이트
    if (mistakePatterns) {
      for (const pattern of mistakePatterns) {
        const existing = userProgress.commonMistakes.find(
          (m: any) => m.wrong === pattern.wrong && m.correct === pattern.correct
        )
        if (existing) {
          existing.count += pattern.count || 1
        } else {
          userProgress.commonMistakes.push(pattern)
        }
      }
      
      // 빈도 순으로 정렬하고 상위 30개만 유지
      userProgress.commonMistakes.sort((a: any, b: any) => b.count - a.count)
      userProgress.commonMistakes = userProgress.commonMistakes.slice(0, 30)
    }
    
    await userProgress.save()
    
    return NextResponse.json({ 
      success: true,
      progress: userProgress 
    })
  } catch (error) {
    console.error('Error updating analysis:', error)
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    )
  }
}

// DELETE: 진행상황 초기화
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }
    
    await UserProgress.findOneAndDelete({ userId })
    
    return NextResponse.json({ 
      success: true,
      message: 'Progress reset successfully' 
    })
  } catch (error) {
    console.error('Error resetting progress:', error)
    return NextResponse.json(
      { error: 'Failed to reset progress' },
      { status: 500 }
    )
  }
}