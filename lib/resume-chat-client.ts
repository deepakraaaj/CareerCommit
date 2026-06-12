'use client'

import { buildResumeAssistantMessages, type ChatMessage } from '@/lib/resume-chat-shared'
import { parseAgentResponse, type AgentResponse } from '@/lib/resume-agent-actions'

export async function sendResumeChatMessage(params: {
  context: string
  messages: ChatMessage[]
}): Promise<AgentResponse> {
  const messages = buildResumeAssistantMessages(params.context, params.messages)

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context: params.context, messages }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Chat request failed')
  }

  const result = await response.json()
  const text = String(result.text || '')
  const { text: cleanText, actions } = parseAgentResponse(text)
  return { text: cleanText, actions, source: 'cerebras' }
}
