import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Prisma를 통한 PostgreSQL 연결 테스트
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      success: true, 
      message: 'PostgreSQL connection successful',
      database: 'PostgreSQL via Prisma',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({ 
      success: false, 
      message: 'PostgreSQL connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}