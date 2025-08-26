import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: 사용자 진행상황 조회 - Prisma/PostgreSQL 사용
export async function GET(request: NextRequest) {
  try {
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

    // Prisma로 사용자 진행상황 조회
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
      include: {
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 50 // 최근 50개만
        }
      }
    })

    if (!userProgress) {
      return NextResponse.json({
        userId,
        isNew: true,
        progress: null
      })
    }

    return NextResponse.json({
      userId,
      isNew: false,
      progress: {
        totalTests: userProgress.totalTests,
        bestWPM: userProgress.bestWPM,
        bestCPM: userProgress.bestCPM,
        averageAccuracy: userProgress.averageAccuracy,
        totalTypeTime: userProgress.totalTypeTime,
        currentTier: userProgress.currentTier,
        tierPoints: userProgress.tierPoints,
        recentResults: userProgress.testResults,
        createdAt: userProgress.createdAt,
        lastActive: userProgress.lastActive
      }
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    
    // 에러 발생 시 localStorage 폴백 모드로 응답
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
    const tempUserId = userId || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({ 
      userId: tempUserId,
      isNew: true,
      progress: null,
      fallback: true,
      error: 'Database connection failed - using localStorage'
    })
  } finally {
    await prisma.$disconnect()
  }
}

// POST: 사용자 진행상황 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      wpm, 
      cpm, 
      accuracy, 
      testDuration, 
      textType, 
      language,
      mistakes,
      keystrokeData 
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 사용자 진행상황 업서트
    const userProgress = await prisma.userProgress.upsert({
      where: { userId },
      update: {
        totalTests: { increment: 1 },
        bestWPM: Math.max(wpm || 0),
        bestCPM: Math.max(cpm || 0),
        totalTypeTime: { increment: testDuration || 0 },
        lastActive: new Date(),
        // 평균 정확도 재계산은 복잡하므로 일단 현재 값으로
        averageAccuracy: accuracy || 0
      },
      create: {
        userId,
        totalTests: 1,
        bestWPM: wpm || 0,
        bestCPM: cpm || 0,
        averageAccuracy: accuracy || 0,
        totalTypeTime: testDuration || 0,
        currentTier: 'B',
        tierPoints: 0,
        createdAt: new Date(),
        lastActive: new Date()
      }
    })

    // 테스트 결과 저장
    const testResult = await prisma.testResult.create({
      data: {
        userProgressId: userProgress.id,
        wpm: wpm || 0,
        cpm: cpm || 0,
        accuracy: accuracy || 0,
        testDuration: testDuration || 0,
        textType: textType || 'sentences',
        language: language || 'korean',
        mistakes: mistakes || 0,
        keystrokeData: keystrokeData || null,
        createdAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      userProgress,
      testResult
    })
  } catch (error) {
    console.error('Error saving user progress:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Database save failed - data only stored locally',
      fallback: true
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE: 사용자 진행상황 삭제
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 관련된 테스트 결과들도 함께 삭제 (CASCADE)
    await prisma.userProgress.delete({
      where: { userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user progress:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Delete failed' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}