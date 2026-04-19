import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const start = (page - 1) * limit
    
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    
    if (id) {
      query = query.eq('id', id).single()
      const { data, error } = await query
      
      if (error) throw error
      return NextResponse.json({ success: true, article: data })
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error, count } = await query.range(start, start + limit - 1)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      articles: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('articles')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, article: data[0] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, article: data[0] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}