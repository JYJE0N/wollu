import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'MongoDB connection test is disabled',
    suggestion: 'MongoDB features are currently not in use'
  })
}