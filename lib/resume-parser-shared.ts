import type { ExtractedEducation, ExtractedExperience, ExtractedProject, ExtractedResume } from '@/lib/types'

export interface ParsedExperience {
  company: string
  position: string
  duration: string
  bullets: string[]
}

export interface ParsedProject {
  name: string
  description: string
}

export interface ParsedEducation {
  school: string
  degree: string
  field: string
  graduation: string
  duration: string
}

export interface ParsedResumeDocument {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  summary: string
  skills: string[]
  experiences: ParsedExperience[]
  projects: ParsedProject[]
  education: ParsedEducation[]
}

export interface EditorExperienceEntry {
  id: string
  company: string
  position: string
  duration: string
  bullets: { id: string; text: string }[]
  expanded?: boolean
}

export interface EditorResumeContent {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
  summary: string
  experiences: EditorExperienceEntry[]
  educationEntries: { id: string; school: string; degree: string; duration: string; expanded?: boolean }[]
  skills: { id: string; label: string; items: string[] }[]
  customFields: { id: string; label: string; value: string }[]
  accentColor: string
  density: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily: 'sans' | 'serif' | 'mono'
}

export const RESUME_PARSE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    title: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    summary: { type: 'string' },
    skills: {
      type: 'array',
      items: { type: 'string' },
    },
    experiences: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          company: { type: 'string' },
          position: { type: 'string' },
          duration: { type: 'string' },
          bullets: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['company', 'position', 'duration', 'bullets'],
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name', 'description'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          school: { type: 'string' },
          degree: { type: 'string' },
          field: { type: 'string' },
          graduation: { type: 'string' },
          duration: { type: 'string' },
        },
        required: ['school', 'degree', 'field', 'graduation', 'duration'],
      },
    },
  },
  required: [
    'name',
    'title',
    'email',
    'phone',
    'location',
    'linkedin',
    'github',
    'summary',
    'skills',
    'experiences',
    'projects',
    'education',
  ],
} as const

export function buildResumeParsingPrompt(text: string) {
  return [
    {
      role: 'system' as const,
      content:
        'Extract resume data from the provided document text and return only valid JSON matching the schema. ' +
        'Use empty strings when a field is unknown. Do not invent facts. ' +
        'Prefer concise bullet points for experience. If the document is noisy, still preserve the most likely structured information.',
    },
    {
      role: 'user' as const,
      content: `Document text:\n\n${text}`,
    },
  ]
}

export function normalizeParsedResume(value: unknown): ParsedResumeDocument {
  const source = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>

  const toString = (input: unknown) => (typeof input === 'string' ? input : '')
  const toStringArray = (input: unknown) =>
    Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : []

  const toParsedExperiences = (input: unknown): ParsedExperience[] =>
    Array.isArray(input)
      ? input.map((item) => {
          const entry = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
          return {
            company: toString(entry.company),
            position: toString(entry.position),
            duration: toString(entry.duration),
            bullets: toStringArray(entry.bullets),
          }
        })
      : []

  const toParsedProjects = (input: unknown): ParsedProject[] =>
    Array.isArray(input)
      ? input.map((item) => {
          const entry = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
          return {
            name: toString(entry.name),
            description: toString(entry.description),
          }
        })
      : []

  const toParsedEducation = (input: unknown): ParsedEducation[] =>
    Array.isArray(input)
      ? input.map((item) => {
          const entry = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
          return {
            school: toString(entry.school),
            degree: toString(entry.degree),
            field: toString(entry.field),
            graduation: toString(entry.graduation),
            duration: toString(entry.duration),
          }
        })
      : []

  return {
    name: toString(source.name),
    title: toString(source.title),
    email: toString(source.email),
    phone: toString(source.phone),
    location: toString(source.location),
    linkedin: toString(source.linkedin),
    github: toString(source.github),
    summary: toString(source.summary),
    skills: toStringArray(source.skills),
    experiences: toParsedExperiences(source.experiences),
    projects: toParsedProjects(source.projects),
    education: toParsedEducation(source.education),
  }
}

function confidenceFromFilledFields(filled: number, total: number): ExtractedResume['confidence'] {
  const ratio = total === 0 ? 0 : filled / total
  if (ratio >= 0.75) return 'high'
  if (ratio >= 0.45) return 'medium'
  if (ratio > 0) return 'needs_review'
  return 'missing'
}

export function toExtractedResume(parsed: ParsedResumeDocument): ExtractedResume {
  const experience: ExtractedExperience[] = parsed.experiences.map((item) => {
    const filled = [item.company, item.position, item.duration, item.bullets.join(' ')].filter(Boolean).length
    return {
      company: item.company || null,
      position: item.position || null,
      duration: item.duration || null,
      description: item.bullets.join(' ') || null,
      confidence: confidenceFromFilledFields(filled, 4) as ExtractedExperience['confidence'],
    }
  })

  const projects: ExtractedProject[] = parsed.projects.map((item) => {
    const filled = [item.name, item.description].filter(Boolean).length
    return {
      name: item.name || null,
      description: item.description || null,
      confidence: confidenceFromFilledFields(filled, 2) as ExtractedProject['confidence'],
    }
  })

  const education: ExtractedEducation[] = parsed.education.map((item) => {
    const filled = [item.school, item.degree, item.field, item.graduation, item.duration].filter(Boolean).length
    return {
      school: item.school || null,
      degree: item.degree || null,
      field: item.field || null,
      graduation: item.graduation || null,
      confidence: confidenceFromFilledFields(filled, 5) as ExtractedEducation['confidence'],
    }
  })

  const totalSignals = [
    parsed.name,
    parsed.title,
    parsed.email,
    parsed.phone,
    parsed.location,
    parsed.linkedin,
    parsed.github,
    parsed.summary,
    parsed.skills.join(' '),
    ...parsed.experiences.map((item) => [item.company, item.position, item.duration, item.bullets.join(' ')].join(' ')),
  ]

  const filledCount = totalSignals.filter(Boolean).length

  return {
    name: parsed.name || null,
    role: parsed.title || null,
    email: parsed.email || null,
    phone: parsed.phone || null,
    location: parsed.location || null,
    skills: parsed.skills,
    experience,
    projects,
    education,
    confidence: confidenceFromFilledFields(filledCount, totalSignals.length),
  }
}

export function toEditorResumeContent(parsed: ParsedResumeDocument): EditorResumeContent {
  return {
    name: parsed.name || '',
    title: parsed.title || '',
    email: parsed.email || '',
    phone: parsed.phone || '',
    linkedin: parsed.linkedin || '',
    github: parsed.github || '',
    sectionTitles: {
      summary: 'Professional Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
    },
    summary: parsed.summary || '',
    experiences: parsed.experiences.map((item, index) => ({
      id: `exp-${index + 1}`,
      company: item.company || '',
      position: item.position || '',
      duration: item.duration || '',
      bullets: item.bullets.map((bullet, bulletIndex) => ({
        id: `exp-${index + 1}-b-${bulletIndex + 1}`,
        text: bullet,
      })),
      expanded: index === 0,
    })),
    educationEntries: parsed.education.map((item, index) => ({
      id: `edu-${index + 1}`,
      school: item.school || '',
      degree: item.degree || '',
      duration: [item.field, item.graduation, item.duration].filter(Boolean).join(' | '),
      expanded: index === 0,
    })),
    skills: parsed.skills.length
      ? [{ id: 'skills-1', label: 'Skills', items: parsed.skills }]
      : [],
    customFields: [],
    accentColor: 'blue',
    density: 'auto',
    fontFamily: 'sans',
  }
}
