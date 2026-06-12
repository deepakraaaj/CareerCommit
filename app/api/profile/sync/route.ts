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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const { id, email, name } = await request.json()

    if (!id || !email || !name) {
      return NextResponse.json({ error: 'id, email and name are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id, email, name, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) {
      console.error('[API] Profile sync error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
