import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildResumeParsingPrompt, normalizeParsedResume, RESUME_PARSE_JSON_SCHEMA } from '@/lib/resume-parser-shared'
import { parseResumeLocally, shouldFallbackToAI } from '@/lib/resume-parser-local'

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1'

async function checkUserAccess(userId?: string | null) {
  // If no user ID, allow (anonymous)
  if (!userId) return true

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) return true // Supabase not configured

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('users')
      .select('ai_access_enabled, approved')
      .eq('id', userId)
      .single()

    if (!data) return false // User not in table
    return data.ai_access_enabled === true || data.approved === true
  } catch (error) {
    console.error('[Parser] Error checking user access:', error)
    return false
  }
}

function getApiKey(userProvidedKey?: string) {
  // Prefer user-provided key from UI, fall back to env var
  return userProvidedKey || process.env.CEREBRAS_API_KEY
}

function getModel() {
  return process.env.CEREBRAS_MODEL || 'gpt-oss-120b'
}

async function parseWithCerebras(text: string, apiKey?: string) {
  const key = getApiKey(apiKey)
  if (!key) {
    throw new Error('Cerebras API key not configured. Please set it in Settings.')
  }

  const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Cerebras-3rd-Party-Integration': 'career-commit',
    },
    body: JSON.stringify({
      model: getModel(),
      messages: buildResumeParsingPrompt(text),
      temperature: 0,
      max_tokens: 2048,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'resume_parse',
          strict: true,
          schema: RESUME_PARSE_JSON_SCHEMA,
        },
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'Cerebras request failed')
  }

  const result = await response.json()
  const content = result?.choices?.[0]?.message?.content ?? result?.choices?.[0]?.message ?? '{}'
  return normalizeParsedResume(typeof content === 'string' ? JSON.parse(content) : content)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = typeof body?.text === 'string' ? body.text : ''
    const userId = typeof body?.userId === 'string' ? body.userId : null
    // API key from request body (for local testing) or env (production)
    const requestApiKey = typeof body?.apiKey === 'string' ? body.apiKey : ''
    const envApiKey = process.env.CEREBRAS_API_KEY
    const apiKey = requestApiKey || envApiKey

    if (!text.trim()) {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    // Check user access if API key will be used
    if (apiKey && userId) {
      const hasAccess = await checkUserAccess(userId)
      if (!hasAccess) {
        console.log('[Parser] User', userId, 'denied API access - contact support')
        return NextResponse.json(
          { error: 'contact_support', message: 'Your account needs approval for AI features' },
          { status: 403 }
        )
      }
    }

    console.log('[Parser] Extracted text preview:', text.substring(0, 500))

    // Try local parsing first
    const { parsed: localResult, confidence } = parseResumeLocally(text)
    console.log('[Parser] Local parse confidence:', {
      score: confidence.overallScore,
      source: 'local',
      hasEmail: confidence.hasEmail,
      hasExperience: confidence.hasExperience,
      name: localResult.name,
      email: localResult.email,
    })

    // If API key available (from env or request), always use Cerebras for best results
    if (apiKey) {
      console.log('[Parser] Using Cerebras API (from', requestApiKey ? 'request' : 'env', ')')
    } else if (!shouldFallbackToAI(confidence)) {
      // Only use local if no API key and confidence is good
      return NextResponse.json({
        data: localResult,
        source: 'local',
        confidence,
        debug: { textLength: text.length, textPreview: text.substring(0, 200) }
      })
    }

    // Use Cerebras
    console.log('[Parser] Falling back to Cerebras API')
    try {
      const aiResult = await parseWithCerebras(text, apiKey)
      return NextResponse.json({
        data: aiResult,
        source: 'cerebras',
        confidence,
        debug: { usedFallback: true, localConfidence: confidence.overallScore }
      })
    } catch (error) {
      // If Cerebras fails, still return local result
      console.warn('[Parser] Cerebras fallback failed, using local result:', error)
      return NextResponse.json({
        data: localResult,
        source: 'local-fallback',
        confidence,
        debug: {
          usedFallback: true,
          cerebasError: error instanceof Error ? error.message : String(error),
          textLength: text.length
        }
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Parser] Resume parsing failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
