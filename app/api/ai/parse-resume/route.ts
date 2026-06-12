import { NextRequest, NextResponse } from 'next/server'
import { buildResumeParsingPrompt, normalizeParsedResume, RESUME_PARSE_JSON_SCHEMA } from '@/lib/resume-parser-shared'

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1'
const CEREBRAS_MODEL = 'llama-3.1-8b'

function getApiKey() {
  return process.env.CEREBRAS_API_KEY
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json({ error: 'Cerebras not configured' }, { status: 503 })
    }

    const body = await request.json()
    const text = typeof body?.text === 'string' ? body.text : ''

    if (!text.trim()) {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Cerebras-3rd-Party-Integration': 'career-commit',
      },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
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
      return NextResponse.json({ error: detail || 'Cerebras request failed' }, { status: response.status })
    }

    const result = await response.json()
    const content = result?.choices?.[0]?.message?.content ?? result?.choices?.[0]?.message ?? '{}'
    const parsed = normalizeParsedResume(typeof content === 'string' ? JSON.parse(content) : content)

    return NextResponse.json({ data: parsed, source: 'cerebras' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[AI] Parse resume failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
