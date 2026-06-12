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

    const body = await request.json()
    const { id, user_id, name, title, template, content_text, created_at, updated_at } = body

    // Build upsert object with only provided fields
    const upsertData: Record<string, any> = { id }
    if (user_id) upsertData.user_id = user_id
    if (name) upsertData.name = name
    if (title) upsertData.title = title
    if (template) upsertData.template = template
    if (content_text) upsertData.content_text = content_text
    if (created_at) upsertData.created_at = created_at
    if (updated_at) upsertData.updated_at = updated_at

    console.log('[API] Upserting resume:', { id, name, hasContent: !!content_text })

    const { data, error } = await supabase
      .from('resumes')
      .upsert(upsertData)
      .select()
      .single()

    if (error) {
      console.error('[API] Supabase error:', error.message, error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[API] Resume saved successfully:', id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
