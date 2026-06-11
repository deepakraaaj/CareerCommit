import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase not configured')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SaveVersionRequest {
  resume_id: string
  user_id: string
  title: string
  content_snapshot: Record<string, unknown>
  change_notes?: string
  saved_by?: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
  fit_score?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveVersionRequest
    const {
      resume_id,
      user_id,
      title,
      content_snapshot,
      change_notes,
      saved_by = 'Manual',
      fit_score = 0,
    } = body

    if (!resume_id || !user_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: resume_id, user_id, title' },
        { status: 400 }
      )
    }

    console.log('[API] Saving version for user:', user_id)

    // Insert the version
    const { data, error } = await supabase
      .from('resume_versions')
      .insert({
        resume_id,
        user_id,
        title,
        content_snapshot,
        change_notes: change_notes || null,
        section_changes: {},
        saved_by,
        fit_score,
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Database error:', error.message)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 400 }
      )
    }

    console.log('[API] ✅ Version saved:', data.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
