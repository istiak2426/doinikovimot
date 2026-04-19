import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test the database connection
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      tables: 'articles table exists'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}