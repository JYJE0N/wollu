import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    console.log('Attempting MongoDB connection...')
    
    await connectDB()
    
    console.log('MongoDB connection successful')
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful'
    })
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message)
    console.error('Error details:', error)
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed',
      error: error.message,
      details: error.name
    }, { status: 500 })
  }
}