import { type AgentAction, type AddProjectAction, type UpdateProjectAction } from './resume-agent-actions'

export type EditorContent = {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills' | 'projects', string>
  summary: string
  experiences: Array<{ id: string; company: string; position: string; duration: string; bullets: Array<{ id: string; text: string }> }>
  educationEntries: Array<{ id: string; school: string; degree: string; duration: string }>
  projects: Array<{ id: string; name: string; description: string; technologies?: string }>
  skills: Array<{ id: string; label: string; items: string[] }>
  customFields: Array<{ id: string; label: string; value: string }>
  accentColor: string
  density: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily: 'sans' | 'serif' | 'mono'
}

export function applyAgentActions(content: EditorContent, actions: AgentAction[]): EditorContent {
  let updated = { ...content }

  for (const action of actions) {
    switch (action.type) {
      case 'update_personal_info': {
        updated = { ...updated, ...action.updates }
        break
      }

      case 'add_project': {
        const addAction = action as AddProjectAction
        updated = {
          ...updated,
          projects: [
            ...updated.projects,
            {
              id: crypto.randomUUID(),
              name: addAction.name,
              description: addAction.description,
              technologies: addAction.technologies,
            },
          ],
        }
        break
      }

      case 'update_project': {
        const updateAction = action as UpdateProjectAction
        updated = {
          ...updated,
          projects: updated.projects.map((proj) =>
            proj.id === updateAction.projectId ? { ...proj, ...updateAction.updates } : proj,
          ),
        }
        break
      }

      case 'delete_project': {
        updated = {
          ...updated,
          projects: updated.projects.filter((proj) => proj.id !== action.projectId),
        }
        break
      }

      case 'add_skill': {
        const existingSkill = updated.skills.find((s) => s.label === action.category)
        if (existingSkill) {
          updated = {
            ...updated,
            skills: updated.skills.map((s) =>
              s.label === action.category ? { ...s, items: [...new Set([...s.items, ...action.items])] } : s,
            ),
          }
        } else {
          updated = {
            ...updated,
            skills: [
              ...updated.skills,
              {
                id: crypto.randomUUID(),
                label: action.category,
                items: action.items,
              },
            ],
          }
        }
        break
      }

      case 'add_bullet': {
        updated = {
          ...updated,
          experiences: updated.experiences.map((exp) =>
            exp.id === action.experienceId
              ? {
                  ...exp,
                  bullets: [...exp.bullets, { id: crypto.randomUUID(), text: action.text }],
                }
              : exp,
          ),
        }
        break
      }

      case 'update_experience': {
        updated = {
          ...updated,
          experiences: updated.experiences.map((exp) =>
            exp.id === action.experienceId ? { ...exp, ...action.updates } : exp,
          ),
        }
        break
      }
    }
  }

  return updated
}
