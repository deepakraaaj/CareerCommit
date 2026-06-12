import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const userId = request.nextUrl.searchParams.get('userId')
    const resumeId = request.nextUrl.searchParams.get('resumeId')
    // fields=resume_id returns only resume ids, for cheap version counting
    const fields = request.nextUrl.searchParams.get('fields')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    let query = supabase
      .from('resume_versions')
      .select(fields === 'resume_id' ? 'resume_id' : '*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (resumeId) {
      query = query.eq('resume_id', resumeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[API] Fetched', data?.length || 0, 'versions')
    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
