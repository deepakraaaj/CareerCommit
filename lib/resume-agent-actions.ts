export type AgentAction =
  | UpdatePersonalInfoAction
  | AddProjectAction
  | UpdateProjectAction
  | DeleteProjectAction
  | AddSkillAction
  | UpdateExperienceAction
  | AddBulletAction

export interface UpdatePersonalInfoAction {
  type: 'update_personal_info'
  updates: {
    name?: string
    title?: string
    email?: string
    phone?: string
    linkedin?: string
    github?: string
  }
}

export interface AddProjectAction {
  type: 'add_project'
  name: string
  description: string
  technologies?: string
}

export interface UpdateProjectAction {
  type: 'update_project'
  projectId: string
  updates: {
    name?: string
    description?: string
    technologies?: string
  }
}

export interface DeleteProjectAction {
  type: 'delete_project'
  projectId: string
}

export interface AddSkillAction {
  type: 'add_skill'
  category: string
  items: string[]
}

export interface UpdateExperienceAction {
  type: 'update_experience'
  experienceId: string
  updates: {
    company?: string
    position?: string
    duration?: string
  }
}

export interface AddBulletAction {
  type: 'add_bullet'
  experienceId: string
  text: string
}

export interface AgentResponse {
  text: string
  actions: AgentAction[]
  source: 'cerebras'
}

const KNOWN_ACTION_TYPES = new Set([
  'update_personal_info',
  'add_project',
  'update_project',
  'delete_project',
  'add_skill',
  'update_experience',
  'add_bullet',
])

function coerceActions(parsed: unknown): AgentAction[] {
  const raw = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as any).actions)
      ? (parsed as any).actions
      : parsed && typeof parsed === 'object' && typeof (parsed as any).type === 'string'
        ? [parsed]
        : []

  return raw.filter(
    (item: unknown): item is AgentAction =>
      !!item && typeof item === 'object' && KNOWN_ACTION_TYPES.has((item as any).type),
  )
}

/**
 * Extract agent actions from a model reply. Tolerant of how different models
 * format their output: fenced (```json, ```JSON, or plain ```) or a bare JSON
 * array/object embedded anywhere in the text. The matched JSON is stripped from
 * the text that gets shown to the user.
 */
export function parseAgentResponse(content: string): { text: string; actions: AgentAction[] } {
  // 1. Try fenced code blocks first (most explicit).
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi
  let match: RegExpExecArray | null
  while ((match = fenceRegex.exec(content)) !== null) {
    try {
      const actions = coerceActions(JSON.parse(match[1].trim()))
      if (actions.length > 0) {
        const text = content.replace(match[0], '').trim()
        return { text: text || 'Done! ✅', actions }
      }
    } catch {
      // keep scanning other fenced blocks
    }
  }

  // 2. Fall back to a bare JSON array/object anywhere in the text.
  const bareMatch = content.match(/(\[[\s\S]*\]|\{[\s\S]*"type"[\s\S]*\})/)
  if (bareMatch) {
    try {
      const actions = coerceActions(JSON.parse(bareMatch[0]))
      if (actions.length > 0) {
        const text = content.replace(bareMatch[0], '').trim()
        return { text: text || 'Done! ✅', actions }
      }
    } catch {
      // not valid JSON — fall through to plain text
    }
  }

  return { text: content.trim(), actions: [] }
}
