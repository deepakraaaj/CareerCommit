import { NextRequest, NextResponse } from 'next/server'
import { buildResumeAssistantMessages, type ChatMessage } from '@/lib/resume-chat-shared'
import { parseAgentResponse } from '@/lib/resume-agent-actions'

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1'

function getApiKey() {
  return process.env.CEREBRAS_API_KEY || process.env.VITE_CEREBRAS_API_KEY
}

function getModel() {
  return process.env.VITE_CEREBRAS_MODEL || process.env.CEREBRAS_MODEL || 'llama-3.1-8b'
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CEREBRAS_API_KEY not configured. Set it in .env.local' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const context = typeof body?.context === 'string' ? body.context : ''
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : []

    if (!context.trim()) {
      return NextResponse.json({ error: 'context required' }, { status: 400 })
    }

    const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Cerebras-3rd-Party-Integration': 'career-commit',
      },
      body: JSON.stringify({
        model: getModel(),
        messages: buildResumeAssistantMessages(context, messages),
        temperature: 0.3,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('[AI] API Error:', detail)
      return NextResponse.json(
        { error: detail || 'Cerebras request failed' },
        { status: response.status }
      )
    }

    const result = await response.json()
    const text = String(result?.choices?.[0]?.message?.content || '')

    // Parse actions from the response
    const { text: cleanText, actions } = parseAgentResponse(text)

    return NextResponse.json({
      text: cleanText,
      actions,
      source: 'cerebras',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[AI] Chat failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
