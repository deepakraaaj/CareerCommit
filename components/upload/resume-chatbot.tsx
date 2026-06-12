'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Bot, Send, Sparkles, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sendResumeChatMessage } from '@/lib/resume-chat-client'
import type { ChatMessage } from '@/lib/resume-chat-shared'
import type { AgentAction } from '@/lib/resume-agent-actions'

interface ResumeChatbotProps {
  context: string
  sourceLabel?: string
  onApplyActions?: (actions: AgentAction[]) => void
}

export function ResumeChatbot({ context, sourceLabel, onApplyActions }: ResumeChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hey! 👋 I\'m your resume assistant. I can help you add projects, update your experience, add skills, or improve your resume. Just tell me what you\'d like to do! For example, you could say "Add a project called BuildBot" or "Add Python and JavaScript to my skills". What would you like to work on?',
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSource, setLastSource] = useState<'cerebras' | null>(null)
  const [appliedActions, setAppliedActions] = useState<AgentAction[]>([])

  const chatContext = useMemo(() => context.trim(), [context])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || sending || !chatContext) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const result = await sendResumeChatMessage({
        context: chatContext,
        messages: nextMessages,
      })
      setMessages((current) => [...current, { role: 'assistant', content: result.text }])
      setLastSource(result.source)

      if (result.actions.length > 0) {
        setAppliedActions(result.actions)
        onApplyActions?.(result.actions)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `Oops! I ran into an issue: ${message}. Please make sure you have a Cerebras API key set up. 🤔`,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Resume Assistant</div>
            <div className="text-xs text-slate-500">
              {sourceLabel ? `${sourceLabel} · ` : ''}
              {lastSource === 'cerebras' ? 'Cerebras AI' : 'Ready to help'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[26rem] overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you'd like to add or change..."
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          />
          <Button type="submit" disabled={sending || !input.trim() || !chatContext} className="shrink-0">
            {sending ? <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {appliedActions.length > 0 ? (
            <>✓ Applied {appliedActions.length} change{appliedActions.length !== 1 ? 's' : ''}</>
          ) : (
            'I can help you edit your resume in seconds!'
          )}
        </p>
      </form>
    </div>
  )
}
