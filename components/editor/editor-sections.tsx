'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Edit2, X, Trash2, ArrowUp, ArrowDown, Sparkles, Plus, User, Briefcase, GraduationCap, Code2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { AISuggestionModal } from './ai-suggestion-modal'
import { BulletEditor } from './bullet-editor'

interface Bullet {
  id: string
  text: string
}

interface ExperienceEntry {
  id: string
  company: string
  position: string
  duration: string
  bullets: Bullet[]
  expanded?: boolean
}

interface EducationEntry {
  id: string
  school: string
  degree: string
  duration: string
  expanded?: boolean
}

interface SkillGroup {
  id: string
  label: string
  items: string[]
}

interface CustomField {
  id: string
  label: string
  value: string
}

interface ProjectEntry {
  id: string
  name: string
  description: string
  technologies?: string
  expanded?: boolean
}

interface EditorContent {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills' | 'projects', string>
  summary: string
  experiences: ExperienceEntry[]
  educationEntries: EducationEntry[]
  projects: ProjectEntry[]
  skills: SkillGroup[]
  customFields: CustomField[]
}

type EditorSectionId = 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom'

interface EditorSectionsProps {
  initialContent: EditorContent | null
  onContentChange?: (content: EditorContent) => void
  /**
   * Bump this number to force the form to re-sync from `initialContent`
   * (e.g. after the Resume Assistant applies actions). Normal typing does not
   * change it, so editing is never disrupted.
   */
  syncSignal?: number
  /**
   * When `syncSignal` changes, navigate the form to this section so the user
   * immediately sees what the assistant just changed.
   */
  focusSection?: EditorSectionId
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 
  'Python', 'AWS', 'TailwindCSS', 'Docker', 
  'GraphQL', 'PostgreSQL', 'Git', 'Agile'
]

export function EditorSections({ initialContent, onContentChange, syncSignal, focusSection }: EditorSectionsProps) {
  const [activeSection, setActiveSection] = useState<EditorSectionId>('personal')
  const lastSyncedContentKeyRef = useRef<string | null>(null)
  const [sections, setSections] = useState<Record<string, { title: string; expanded: boolean }>>({
    summary: { title: initialContent?.sectionTitles?.summary || 'Professional Summary', expanded: true },
    experience: { title: initialContent?.sectionTitles?.experience || 'Experience', expanded: true },
    education: { title: initialContent?.sectionTitles?.education || 'Education', expanded: true },
    projects: { title: initialContent?.sectionTitles?.projects || 'Projects', expanded: true },
    skills: { title: initialContent?.sectionTitles?.skills || 'Skills', expanded: true },
  })

  const handleSectionSwitch = (section: 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom') => {
    setActiveSection(section)
    const container = document.querySelector('.custom-scrollbar')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const SectionFooter = ({ current }: { current: 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom' }) => {
    const list: ('personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom')[] = [
      'personal', 'summary', 'experience', 'education', 'projects', 'skills', 'custom'
    ]
    const idx = list.indexOf(current)
    const prev = idx > 0 ? list[idx - 1] : null
    const next = idx < list.length - 1 ? list[idx + 1] : null

    const getLabel = (key: string) => {
      switch (key) {
        case 'personal': return 'Personal Info'
        case 'summary': return 'Summary'
        case 'experience': return 'Experience'
        case 'education': return 'Education'
        case 'projects': return 'Projects'
        case 'skills': return 'Skills'
        case 'custom': return 'Custom'
        default: return ''
      }
    }

    return (
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-4 mt-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div>
          {prev && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSectionSwitch(prev)}
              className="text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              ← Back to {getLabel(prev)}
            </Button>
          )}
        </div>
        <div>
          {next && (
            <Button
              type="button"
              onClick={() => handleSectionSwitch(next)}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm rounded-lg px-4 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Next: {getLabel(next)} →
            </Button>
          )}
        </div>
      </div>
    )
  }

  const [editingBullet, setEditingBullet] = useState<{ expId: string; bulletId: string } | null>(null)
  const [renamingSection, setRenamingSection] = useState<string | null>(null)
  
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean
    type: 'improve' | 'shorten' | 'fix_grammar'
    original: string
    expId: string | null
    bulletId: string | null
  }>({
    isOpen: false,
    type: 'improve',
    original: '',
    expId: null,
    bulletId: null,
  })

  // Core Identity State
  const [name, setName] = useState(initialContent?.name || '')
  const [title, setTitle] = useState(initialContent?.title || '')
  const [email, setEmail] = useState(initialContent?.email || '')
  const [phone, setPhone] = useState(initialContent?.phone || '')
  const [linkedin, setLinkedin] = useState(initialContent?.linkedin || '')
  const [github, setGithub] = useState(initialContent?.github || '')
  
  // Professional Summary State
  const [summary, setSummary] = useState(initialContent?.summary || '')
  
  // Experiences State
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(
    initialContent?.experiences?.length 
      ? initialContent.experiences.map((exp, i) => ({ ...exp, expanded: i === 0 }))
      : [{ id: 'exp-1', company: '', position: '', duration: '', bullets: [], expanded: true }]
  )

  // Education State
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    initialContent?.educationEntries?.length
      ? initialContent.educationEntries.map((edu, i) => ({ ...edu, expanded: i === 0 }))
      : [{ id: 'edu-1', school: '', degree: '', duration: '', expanded: true }]
  )

  // Skills State
  const [skills, setSkills] = useState<SkillGroup[]>(
    initialContent?.skills?.length
      ? initialContent.skills
      : [
          { id: 'skills-1', label: 'Languages', items: [] },
          { id: 'skills-2', label: 'Frameworks', items: [] },
          { id: 'skills-3', label: 'Tools & Cloud', items: [] },
        ]
  )
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({})

  // Custom Fields State
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialContent?.customFields || []
  )

  // Projects State
  const [projects, setProjects] = useState<ProjectEntry[]>(
    initialContent?.projects || []
  )

  // Sync initialContent changes to local state.
  // Key on the actual content the form manages (not just name/title/email) so
  // that loading saved resumes, switching versions, or assistant edits all
  // re-sync — even when personal fields are blank. Typing round-trips through
  // the parent and comes back identical, so the signature is stable and editing
  // is not disrupted.
  const contentKey = initialContent
    ? JSON.stringify([
        initialContent.name,
        initialContent.title,
        initialContent.email,
        initialContent.phone,
        initialContent.linkedin,
        initialContent.github,
        initialContent.summary,
        initialContent.experiences,
        initialContent.educationEntries,
        initialContent.projects,
        initialContent.skills,
        initialContent.customFields,
        initialContent.sectionTitles,
      ])
    : null
  useEffect(() => {
    if (!initialContent) return

    const shouldSyncFromParent = syncSignal || contentKey !== lastSyncedContentKeyRef.current
    if (!shouldSyncFromParent) return

    console.log('[EditorSections] Syncing initialContent:', initialContent.title)
    setName(initialContent.name || '')
    setTitle(initialContent.title || '')
    setEmail(initialContent.email || '')
    setPhone(initialContent.phone || '')
    setLinkedin(initialContent.linkedin || '')
    setGithub(initialContent.github || '')
    setSummary(initialContent.summary || '')
    setExperiences(initialContent.experiences || [])
    setEducationEntries(initialContent.educationEntries || [])
    setProjects(initialContent.projects || [])
    setSkills(initialContent.skills || [])
    setCustomFields(initialContent.customFields || [])
    setSections(prev => ({
      ...prev,
      summary: { ...prev.summary, title: initialContent.sectionTitles?.summary || prev.summary.title },
      experience: { ...prev.experience, title: initialContent.sectionTitles?.experience || prev.experience.title },
      education: { ...prev.education, title: initialContent.sectionTitles?.education || prev.education.title },
      projects: { ...prev.projects, title: initialContent.sectionTitles?.projects || prev.projects.title },
      skills: { ...prev.skills, title: initialContent.sectionTitles?.skills || prev.skills.title },
    }))
    lastSyncedContentKeyRef.current = contentKey
  }, [contentKey, initialContent, syncSignal])

  // When the assistant applies a change, jump to the section it edited so the
  // user can see it. Keyed on syncSignal only, so typing never triggers a jump.
  useEffect(() => {
    if (syncSignal && focusSection) {
      setActiveSection(focusSection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncSignal])

  // Sync to Parent Callback
  useEffect(() => {
    const content: EditorContent = {
      name,
      title,
      email,
      phone,
      linkedin,
      github,
      sectionTitles: {
        summary: sections.summary.title,
        experience: sections.experience.title,
        education: sections.education.title,
        projects: sections.projects.title,
        skills: sections.skills.title,
      },
      summary,
      experiences,
      educationEntries,
      projects,
      skills,
      customFields,
    }
    lastSyncedContentKeyRef.current = JSON.stringify([
      content.name,
      content.title,
      content.email,
      content.phone,
      content.linkedin,
      content.github,
      content.summary,
      content.experiences,
      content.educationEntries,
      content.projects,
      content.skills,
      content.customFields,
      content.sectionTitles,
    ])
    onContentChange?.(content)
  }, [
    name,
    title,
    email,
    phone,
    linkedin,
    github,
    sections.summary.title,
    sections.experience.title,
    sections.education.title,
    sections.projects.title,
    sections.skills.title,
    summary,
    experiences,
    educationEntries,
    projects,
    skills,
    customFields,
    onContentChange,
  ])

  // AI Helper functions
  const getSuggestedText = (original: string, type: 'improve' | 'shorten' | 'fix_grammar') => {
    const suggestions = {
      improve: `${original} resulting in measurable growth, key milestone execution, and seamless team alignment`,
      shorten: original.length > 50 ? `${original.substring(0, Math.max(30, original.length - 25))}...` : original,
      fix_grammar: original.replace(/reducing/gi, 'reducing').replace(/building/gi, 'building'),
    }
    return suggestions[type]
  }

  const openAiSuggestion = (type: 'improve' | 'shorten' | 'fix_grammar', expId: string, bulletId: string, text: string) => {
    setAiModal({
      isOpen: true,
      type,
      original: text,
      expId,
      bulletId,
    })
  }

  const applyAiSuggestion = (text: string) => {
    if (!aiModal.expId || !aiModal.bulletId) return

    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === aiModal.expId) {
          return {
            ...exp,
            bullets: exp.bullets.map((b) => (b.id === aiModal.bulletId ? { ...b, text } : b)),
          }
        }
        return exp
      })
    )

    setEditingBullet(null)
    setAiModal({
      isOpen: false,
      type: 'improve',
      original: '',
      expId: null,
      bulletId: null,
    })
  }

  const toggleSection = (key: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key].expanded },
    }))
  }

  const handleSectionTitleChange = (key: string, title: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], title },
    }))
  }

  // --- MULTIPLE EXPERIENCE OPERATIONS ---
  const handleAddExperience = () => {
    const id = `exp-${Date.now()}`
    setExperiences((prev) => [
      ...prev.map(e => ({ ...e, expanded: false })),
      { id, company: '', position: '', duration: '', bullets: [], expanded: true }
    ])
  }

  const handleUpdateExperience = (id: string, patch: Partial<Omit<ExperienceEntry, 'id' | 'bullets'>>) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp))
    )
  }

  const handleDeleteExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id))
  }

  const handleMoveExperience = (idx: number, direction: 'up' | 'down') => {
    setExperiences((prev) => {
      const next = [...prev]
      if (direction === 'up' && idx > 0) {
        ;[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      } else if (direction === 'down' && idx < next.length - 1) {
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      }
      return next
    })
  }

  const toggleExperienceExpand = (id: string) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, expanded: !exp.expanded } : exp))
    )
  }

  // --- BULLET OPERATIONS (PER EXPERIENCE) ---
  const handleAddBullet = (expId: string) => {
    const bulletId = `bullet-${Date.now()}`
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: [...exp.bullets, { id: bulletId, text: '' }],
          }
        }
        return exp
      })
    )
    setEditingBullet({ expId, bulletId })
  }

  const handleUpdateBullet = (expId: string, bulletId: string, text: string) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
          }
        }
        return exp
      })
    )
    setEditingBullet(null)
  }

  const handleDeleteBullet = (expId: string, bulletId: string) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: exp.bullets.filter((b) => b.id !== bulletId),
          }
        }
        return exp
      })
    )
    if (editingBullet?.bulletId === bulletId) {
      setEditingBullet(null)
    }
  }

  const handleMoveBullet = (expId: string, bulletId: string, direction: 'up' | 'down') => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          const list = [...exp.bullets]
          const idx = list.findIndex((b) => b.id === bulletId)
          if (direction === 'up' && idx > 0) {
            ;[list[idx], list[idx - 1]] = [list[idx - 1], list[idx]]
          } else if (direction === 'down' && idx < list.length - 1) {
            ;[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]
          }
          return { ...exp, bullets: list }
        }
        return exp
      })
    )
  }

  // --- EDUCATION OPERATIONS ---
  const handleAddEducationEntry = () => {
    const id = `edu-${Date.now()}`
    setEducationEntries((prev) => [
      ...prev.map(e => ({ ...e, expanded: false })),
      { id, school: '', degree: '', duration: '', expanded: true }
    ])
  }

  const handleUpdateEducationEntry = (id: string, patch: Partial<Omit<EducationEntry, 'id'>>) => {
    setEducationEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    )
  }

  const handleDeleteEducationEntry = (id: string) => {
    setEducationEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleMoveEducation = (idx: number, direction: 'up' | 'down') => {
    setEducationEntries((prev) => {
      const next = [...prev]
      if (direction === 'up' && idx > 0) {
        ;[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      } else if (direction === 'down' && idx < next.length - 1) {
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      }
      return next
    })
  }

  const toggleEducationExpand = (id: string) => {
    setEducationEntries((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, expanded: !edu.expanded } : edu))
    )
  }

  // --- PROJECTS OPERATIONS ---
  const handleAddProject = () => {
    const id = `proj-${Date.now()}`
    setProjects((prev) => [
      ...prev.map(p => ({ ...p, expanded: false })),
      { id, name: '', description: '', expanded: true }
    ])
  }

  const handleUpdateProject = (id: string, patch: Partial<Omit<ProjectEntry, 'id'>>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...patch } : proj))
    )
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
  }

  const handleMoveProject = (idx: number, direction: 'up' | 'down') => {
    setProjects((prev) => {
      const next = [...prev]
      if (direction === 'up' && idx > 0) {
        ;[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      } else if (direction === 'down' && idx < next.length - 1) {
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      }
      return next
    })
  }

  const handleToggleProjectExpand = (id: string) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, expanded: !proj.expanded } : proj))
    )
  }

  // --- SKILLS OPERATIONS ---
  const handleAddSkillGroup = () => {
    const id = `skills-${Date.now()}`
    setSkills((prev) => [...prev, { id, label: 'New Category', items: [] }])
    setSkillInputs((prev) => ({ ...prev, [id]: '' }))
  }

  const handleUpdateSkillGroup = (id: string, patch: Partial<Omit<SkillGroup, 'id'>>) => {
    setSkills((prev) => prev.map((group) => (group.id === id ? { ...group, ...patch } : group)))
  }

  const handleDeleteSkillGroup = (id: string) => {
    setSkills((prev) => prev.filter((group) => group.id !== id))
    setSkillInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleAddSkillToGroup = (groupId: string, explicitValue?: string) => {
    const value = (explicitValue || skillInputs[groupId] || '').trim()
    if (!value) return

    setSkills((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          if (group.items.includes(value)) return group
          return { ...group, items: [...group.items, value] }
        }
        return group
      })
    )
    setSkillInputs((prev) => ({ ...prev, [groupId]: '' }))
  }

  const handleDeleteSkill = (groupId: string, skill: string) => {
    setSkills((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, items: group.items.filter((item) => item !== skill) } : group
      )
    )
  }

  // --- CUSTOM FIELD OPERATIONS ---
  const handleAddCustomField = () => {
    const id = `cf-${Date.now()}`
    setCustomFields((prev) => [...prev, { id, label: '', value: '' }])
  }

  const handleUpdateCustomField = (id: string, patch: Partial<Omit<CustomField, 'id'>>) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    )
  }

  const handleDeleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id))
  }

  // Shared editor layout constants
  const panelHeader = 'flex flex-row items-center justify-between gap-4 border-b border-slate-100/80 bg-white/95 px-8 py-7 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/75'
  const panelTitle = 'font-serif text-3xl font-light tracking-tight text-slate-900 dark:text-slate-50'
  const panelSubtitle = 'font-serif italic text-[15px] text-slate-500 dark:text-slate-400'
  const fieldLabel = 'text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors duration-300 group-focus-within:text-slate-600 dark:text-slate-500 dark:group-focus-within:text-slate-200'
  const inputClass = 'w-full bg-transparent pt-1 text-sm text-slate-900 placeholder-slate-400 outline-none border-none dark:text-slate-100 dark:placeholder-slate-500'
  const formFieldClass = 'group relative rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2 transition-all duration-300 focus-within:border-slate-700 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:border-slate-700 dark:bg-slate-900/45 dark:focus-within:border-slate-500 dark:focus-within:bg-slate-900/60 dark:focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.18)]'

  const getSectionMonogram = (key: string) => {
    switch (key) {
      case 'personal': return 'I'
      case 'summary': return 'S'
      case 'experience': return 'W'
      case 'education': return 'E'
      case 'skills': return 'K'
      case 'custom': return 'C'
      default: return 'C'
    }
  }

   const getUnifiedShellClass = (colorKey: string) => {
    const activeBorders: Record<string, string> = {
      personal: 'border-t-indigo-600',
      summary: 'border-t-violet-650',
      experience: 'border-t-blue-655',
      education: 'border-t-emerald-650',
      skills: 'border-t-amber-655',
      custom: 'border-t-rose-650',
    }
    
    return `rounded-2xl border border-slate-205 bg-white transition-all duration-300 relative shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] border-t-[4px] ${activeBorders[colorKey]} overflow-hidden dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]`
  }

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'personal':
        return <User className="w-4 h-4 text-indigo-600" />
      case 'summary':
        return <Sparkles className="w-4 h-4 text-violet-600" />
      case 'experience':
        return <Briefcase className="w-4 h-4 text-blue-600" />
      case 'education':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />
      case 'skills':
        return <Code2 className="w-4 h-4 text-amber-600" />
      case 'custom':
        return <PlusCircle className="w-4 h-4 text-rose-600" />
      default:
        return <PlusCircle className="w-4 h-4 text-slate-600" />
    }
  }

  const getSectionIconBg = (key: string) => {
    switch (key) {
      case 'personal': return 'bg-indigo-50 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20'
      case 'summary': return 'bg-violet-50 border border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20'
      case 'experience': return 'bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
      case 'education': return 'bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
      case 'skills': return 'bg-amber-50 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
      case 'custom': return 'bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'
      default: return 'bg-slate-50 border border-slate-100 dark:bg-slate-900/35 dark:border-slate-800'
    }
  }

  const SectionHeader = ({ sectionKey, counts }: { sectionKey: string; counts: string }) =>
    renamingSection === sectionKey ? (
      <div className={panelHeader}>
        <input
          autoFocus
          value={sections[sectionKey].title}
          onChange={(e) => handleSectionTitleChange(sectionKey, e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Save"
          className="rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 ml-2 dark:text-emerald-400 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Cancel"
          className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <div className={panelHeader}>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 text-left">
          <h3 className={panelTitle}>{sections[sectionKey].title}</h3>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block w-8 h-[1px] bg-slate-200" />
            <p className={panelSubtitle}>{counts}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(sectionKey)}
          title="Rename Section"
          className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    )

  return (
    <div className="pr-1 pb-10">
      <div className={getUnifiedShellClass(activeSection)}>
      {/* Quick Navigation Tabs - Pipeline Stepper Style with Connection Arrow */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pb-2 pt-4 px-5 w-full relative border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex h-11 w-full rounded-full p-[3px] bg-white border border-slate-200 shadow-sm relative z-20 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
          {[
            { id: 'personal', label: 'Personal Info' },
            { id: 'summary', label: 'Summary' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
            { id: 'projects', label: 'Projects' },
            { id: 'skills', label: 'Skills' },
            { id: 'custom', label: 'Custom' },
          ].map((step, idx, arr) => {
            const isActive = activeSection === step.id;
            
            let clipPath = '';
            let marginLeft = idx === 0 ? '0' : '-14px';
            let paddingLeft = idx === 0 ? 'pl-5' : 'pl-8';
            let paddingRight = idx === arr.length - 1 ? 'pr-5' : 'pr-8';

            if (idx === 0) {
              clipPath = 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)';
            } else if (idx === arr.length - 1) {
              clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)';
            } else {
              clipPath = 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)';
            }

            const colors: Record<string, { active: string; inactive: string; text: string; arrowBg: string; borderColor: string }> = {
              personal: { active: 'bg-indigo-200 dark:bg-indigo-500/20', inactive: 'bg-indigo-50/60 hover:bg-indigo-100/80 dark:bg-slate-900/55 dark:hover:bg-indigo-500/10', text: 'text-indigo-900 dark:text-indigo-100', arrowBg: 'bg-indigo-200 dark:bg-indigo-500/20', borderColor: '#4f46e5' },
              summary: { active: 'bg-violet-200 dark:bg-violet-500/20', inactive: 'bg-violet-50/60 hover:bg-violet-100/80 dark:bg-slate-900/55 dark:hover:bg-violet-500/10', text: 'text-violet-900 dark:text-violet-100', arrowBg: 'bg-violet-200 dark:bg-violet-500/20', borderColor: '#7c3aed' },
              experience: { active: 'bg-blue-200 dark:bg-blue-500/20', inactive: 'bg-blue-50/60 hover:bg-blue-100/80 dark:bg-slate-900/55 dark:hover:bg-blue-500/10', text: 'text-blue-900 dark:text-blue-100', arrowBg: 'bg-blue-200 dark:bg-blue-500/20', borderColor: '#2563eb' },
              education: { active: 'bg-emerald-200 dark:bg-emerald-500/20', inactive: 'bg-emerald-50/60 hover:bg-emerald-100/80 dark:bg-slate-900/55 dark:hover:bg-emerald-500/10', text: 'text-emerald-900 dark:text-emerald-100', arrowBg: 'bg-emerald-200 dark:bg-emerald-500/20', borderColor: '#059669' },
              projects: { active: 'bg-cyan-200 dark:bg-cyan-500/20', inactive: 'bg-cyan-50/60 hover:bg-cyan-100/80 dark:bg-slate-900/55 dark:hover:bg-cyan-500/10', text: 'text-cyan-900 dark:text-cyan-100', arrowBg: 'bg-cyan-200 dark:bg-cyan-500/20', borderColor: '#0891b2' },
              skills: { active: 'bg-amber-200 dark:bg-amber-500/20', inactive: 'bg-amber-50/60 hover:bg-amber-100/80 dark:bg-slate-900/55 dark:hover:bg-amber-500/10', text: 'text-amber-900 dark:text-amber-100', arrowBg: 'bg-amber-200 dark:bg-amber-500/20', borderColor: '#d97706' },
              custom: { active: 'bg-rose-200 dark:bg-rose-500/20', inactive: 'bg-rose-50/60 hover:bg-rose-100/80 dark:bg-slate-900/55 dark:hover:bg-rose-500/10', text: 'text-rose-900 dark:text-rose-100', arrowBg: 'bg-rose-200 dark:bg-rose-500/20', borderColor: '#e11d48' },
            };
            const colorClass = isActive ? colors[step.id].active : colors[step.id].inactive;

            return (
              <div
                key={step.id}
                style={{ marginLeft }}
                className="relative flex-1 group"
              >
                {/* The clipped background layer */}
                <button
                  type="button"
                  onClick={() => handleSectionSwitch(step.id as any)}
                  style={{ clipPath }}
                  className={`absolute inset-0 w-full h-full transition-colors duration-200 ${colorClass} ${idx === 0 ? 'rounded-l-full' : ''} ${idx === arr.length - 1 ? 'rounded-r-full' : ''}`}
                />
                
                {/* The text layer */}
                <button
                   type="button"
                   onClick={() => handleSectionSwitch(step.id as any)}
                   className={`relative z-10 w-full h-full flex items-center justify-center text-[11px] sm:text-xs uppercase tracking-wider ${paddingLeft} ${paddingRight} ${(isActive || step.id === 'projects') ? colors[step.id].text + ' font-bold' : 'text-slate-700 font-medium'}`}
                >
                  <span className="truncate">{step.label}</span>
                </button>

                {/* The Connecting Arrow */}
                {isActive && (
                  <div 
                    className={`absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 border-b-[1px] border-r-[1px] border-slate-200 dark:border-slate-700 z-10 shadow-[2px_2px_4px_-2px_rgba(0,0,0,0.05)] ${colors[step.id].arrowBg}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative bg-white min-h-[500px] dark:bg-slate-900/90">
      {/* 1. Personal Info */}
      {activeSection === 'personal' && (
        <div id="sec-personal" className="animate-in fade-in duration-300">
          <div className={panelHeader}>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 text-left">
              <h3 className={panelTitle}>Personal Information</h3>
              <div className="flex items-center gap-4">
                <span className="hidden sm:block w-8 h-[1px] bg-slate-200 dark:bg-slate-700" />
                <p className={panelSubtitle}>Your identity and professional contacts</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={formFieldClass}>
                <label className={fieldLabel}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className={formFieldClass}>
                <label className={fieldLabel}>Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={formFieldClass}>
                <label className={fieldLabel}>Email Address</label>
                <input
                  type="email"
                  placeholder="alex.morgan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className={formFieldClass}>
                <label className={fieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={formFieldClass}>
                <label className={fieldLabel}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className={formFieldClass}>
                <label className={fieldLabel}>GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <SectionFooter current="personal" />
        </div>
      )}

      {/* 2. Professional Summary */}
      {activeSection === 'summary' && (
        <div id="sec-summary" className="animate-in fade-in duration-300">
          <SectionHeader 
            sectionKey="summary" 
            counts={summary.trim() ? `${summary.trim().split(/\s+/).length} words` : 'No summary written yet'} 
          />
          <div className="p-5 pb-0">
            <div className="relative">
              <textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onFocus={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                className={`${inputClass} resize-y min-h-[150px] pb-10 overflow-hidden`}
                placeholder="Write a compelling summary highlighting your core skills, years of experience, and achievements..."
              />
              <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-bold uppercase">
                {summary.trim() ? summary.trim().split(/\s+/).length : 0} Words
              </div>
            </div>
          </div>
          <SectionFooter current="summary" />
        </div>
      )}

      {/* 3. Work Experience */}
      {activeSection === 'experience' && (
        <div id="sec-experience" className="animate-in fade-in duration-300">
          <SectionHeader 
            sectionKey="experience" 
            counts={`${experiences.length} positions · ${experiences.reduce((acc, exp) => acc + exp.bullets.length, 0)} bullets`} 
          />
          <div className="p-5 pb-0 space-y-5">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 relative group/card transition-all hover:border-slate-350 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600">
                {/* Collapsible Sub-Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExperienceExpand(exp.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform dark:text-slate-500 ${exp.expanded ? 'rotate-180' : ''}`} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {exp.position || exp.company ? (
                          <>
                            {exp.position || 'Position'} <span className="text-slate-400 dark:text-slate-500">at</span> {exp.company || 'Company'}
                          </>
                        ) : (
                          `Work Experience ${idx + 1}`
                        )}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        title="Move Up"
                        onClick={() => handleMoveExperience(idx, 'up')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < experiences.length - 1 && (
                      <button
                        title="Move Down"
                        onClick={() => handleMoveExperience(idx, 'down')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Remove Position"
                      onClick={() => handleDeleteExperience(exp.id)}
                      disabled={experiences.length === 1}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {exp.expanded && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. InnovateTech Solutions"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>Role / Position</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Software Engineer"
                          value={exp.position}
                          onChange={(e) => handleUpdateExperience(exp.id, { position: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className={formFieldClass}>
                      <label className={fieldLabel}>Duration</label>
                      <div className="pt-1">
                        <DateRangePicker
                          value={exp.duration}
                          onChange={(val) => handleUpdateExperience(exp.id, { duration: val })}
                          presentLabel="I currently work here"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <label className={fieldLabel}>Core Achievements & Responsibilities</label>
                      
                      <div className="space-y-2.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <BulletEditor
                            key={bullet.id}
                            bullet={bullet}
                            onEdit={(id, text) => handleUpdateBullet(exp.id, id, text)}
                            onImprove={() => openAiSuggestion('improve', exp.id, bullet.id, bullet.text)}
                            onShorten={() => openAiSuggestion('shorten', exp.id, bullet.id, bullet.text)}
                            onDelete={(id) => handleDeleteBullet(exp.id, id)}
                            onMoveUp={() => handleMoveBullet(exp.id, bullet.id, 'up')}
                            onMoveDown={() => handleMoveBullet(exp.id, bullet.id, 'down')}
                            isEditing={editingBullet?.expId === exp.id && editingBullet?.bulletId === bullet.id}
                            canMoveUp={bIdx > 0}
                            canMoveDown={bIdx < exp.bullets.length - 1}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBullet(exp.id)}
                        className="w-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg py-1.5 font-medium transition-all shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Bullet Point
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={handleAddExperience}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Professional Experience
            </Button>
          </div>
          <SectionFooter current="experience" />
        </div>
      )}

      {/* 4. Education */}
      {activeSection === 'education' && (
        <div id="sec-education" className="animate-in fade-in duration-300">
          <SectionHeader 
            sectionKey="education" 
            counts={`${educationEntries.length} entries`} 
          />
          <div className="p-5 pb-0 space-y-5">
            {educationEntries.map((entry, idx) => (
              <div key={entry.id} className={`rounded-xl border transition-all p-5 relative group/card ${
                entry.expanded 
                  ? 'bg-white border-slate-350 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/70 dark:border-slate-700 dark:ring-slate-800' 
                  : 'bg-slate-50/40 border-slate-200/80 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => toggleEducationExpand(entry.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform dark:text-slate-500 ${entry.expanded ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                      {entry.school || entry.degree ? (
                        <>
                          {entry.degree || 'Degree'} <span className="text-slate-400 dark:text-slate-500">at</span> {entry.school || 'School'}
                        </>
                      ) : (
                        `Education ${idx + 1}`
                      )}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        title="Move Up"
                        onClick={() => handleMoveEducation(idx, 'up')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < educationEntries.length - 1 && (
                      <button
                        title="Move Down"
                        onClick={() => handleMoveEducation(idx, 'down')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Remove Education"
                      onClick={() => handleDeleteEducationEntry(entry.id)}
                      disabled={educationEntries.length === 1}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {entry.expanded && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>School / University</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={entry.school}
                          onChange={(e) => handleUpdateEducationEntry(entry.id, { school: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>Degree / Certificate</label>
                        <input
                          type="text"
                          placeholder="e.g. B.S. in Computer Science"
                          value={entry.degree}
                          onChange={(e) => handleUpdateEducationEntry(entry.id, { degree: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className={formFieldClass}>
                      <label className={fieldLabel}>Duration / Dates</label>
                      <div className="pt-1">
                        <DateRangePicker
                          value={entry.duration}
                          onChange={(val) => handleUpdateEducationEntry(entry.id, { duration: val })}
                          presentLabel="I'm currently studying here"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={handleAddEducationEntry}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </div>
          <SectionFooter current="education" />
        </div>
      )}

      {/* 5. Projects */}
      {activeSection === 'projects' && (
        <div id="sec-projects" className="animate-in fade-in duration-300">
          <SectionHeader
            sectionKey="projects"
            counts={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          />
          <div className="p-5 pb-0 space-y-5">
            {projects.map((project, idx) => (
              <div key={project.id} className={`rounded-xl border transition-all p-5 relative group/card ${
                project.expanded
                  ? 'bg-white border-slate-350 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/70 dark:border-slate-700 dark:ring-slate-800'
                  : 'bg-slate-50/40 border-slate-200/80 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:border-slate-600'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleToggleProjectExpand(project.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 dark:text-slate-500 ${project.expanded ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{project.name || `Project ${idx + 1}`}</span>
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        title="Move Up"
                        onClick={() => handleMoveProject(idx, 'up')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < projects.length - 1 && (
                      <button
                        title="Move Down"
                        onClick={() => handleMoveProject(idx, 'down')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Remove Project"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={projects.length === 1}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {project.expanded && (
                  <div className="space-y-4 pt-1">
                    <div className={formFieldClass}>
                      <label className={fieldLabel}>Project Name</label>
                      <input
                        type="text"
                        placeholder="e.g. BuildBot"
                        value={project.name}
                        onChange={(e) => handleUpdateProject(project.id, { name: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div className={formFieldClass}>
                      <label className={fieldLabel}>Description</label>
                      <textarea
                        placeholder="Brief description of the project and your role..."
                        value={project.description}
                        onChange={(e) => handleUpdateProject(project.id, { description: e.target.value })}
                        className={`${inputClass} resize-none min-h-[80px]`}
                      />
                    </div>

                    <div className={formFieldClass}>
                      <label className={fieldLabel}>Technologies (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node.js, AWS"
                        value={project.technologies || ''}
                        onChange={(e) => handleUpdateProject(project.id, { technologies: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={handleAddProject}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>
          <SectionFooter current="projects" />
        </div>
      )}

      {/* 6. Skills */}
      {activeSection === 'skills' && (
        <div id="sec-skills" className="animate-in fade-in duration-300">
          <SectionHeader 
            sectionKey="skills" 
            counts={`${skills.reduce((sum, group) => sum + group.items.length, 0)} skills across ${skills.length} categories`} 
          />
          <div className="p-5 pb-0 space-y-6">
            {skills.map((group) => (
              <div key={group.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 transition-all hover:border-slate-350 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600">
                <div className="flex items-center gap-3 justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 max-w-[240px]">
                    <input
                      value={group.label}
                      onChange={(e) => handleUpdateSkillGroup(group.id, { label: e.target.value })}
                      placeholder="Category name"
                      className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 text-sm font-semibold text-slate-800 outline-none pb-0.5 transition-all w-full dark:text-slate-100 dark:hover:border-slate-600"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/20">
                      {group.items.length} items
                    </span>
                    <button
                      title="Delete Category"
                      onClick={() => handleDeleteSkillGroup(group.id)}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Skill Tags */}
                {group.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-lg bg-white border border-slate-200/60 shadow-inner-sm dark:border-slate-700 dark:bg-slate-900/50">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleDeleteSkill(group.id, item)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                        title="Click to remove"
                      >
                        {item}
                        <X className="w-3 h-3 text-slate-400 group-hover:text-rose-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input
                    value={skillInputs[group.id] ?? ''}
                    onChange={(e) =>
                      setSkillInputs((prev) => ({ ...prev, [group.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkillToGroup(group.id)
                      }
                    }}
                    placeholder="Type skill and press Enter"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/15"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleAddSkillToGroup(group.id)}
                    className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg px-4 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                  >
                    Add
                  </Button>
                </div>

                {/* Quick Add Pills */}
                <div className="mt-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quick Add Suggestions</p>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SKILLS.filter(s => !group.items.includes(s)).slice(0, 7).map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkillToGroup(group.id, skill)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-0.5 rounded-md border border-slate-200 bg-white transition-colors shadow-xxs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={handleAddSkillGroup}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Skill Category
            </Button>
          </div>
          <SectionFooter current="skills" />
        </div>
      )}

      {/* 7. Custom Fields */}
      {activeSection === 'custom' && (
        <div id="sec-custom" className="animate-in fade-in duration-300">
          <div className={panelHeader}>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 text-left">
              <h3 className={panelTitle}>Custom Sections</h3>
              <div className="flex items-center gap-4">
                <span className="hidden sm:block w-8 h-[1px] bg-slate-200" />
                <p className={panelSubtitle}>Add custom metadata</p>
              </div>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-serif italic text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20">
              {customFields.length} fields
            </span>
          </div>
          <div className="p-5 pb-0 space-y-4">
            {customFields.length > 0 ? (
              <div className="space-y-4">
                {customFields.map((field, idx) => (
                  <div key={field.id} className="rounded-xl border border-slate-205 bg-slate-50/20 p-5 relative group/card transition-all hover:border-slate-350 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-semibold text-slate-500 font-serif italic dark:text-slate-300">Custom Field {idx + 1}</span>
                      <button
                        onClick={() => handleDeleteCustomField(field.id)}
                        className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                          placeholder="e.g. Certifications"
                          className={inputClass}
                        />
                      </div>
                      <div className={formFieldClass}>
                        <label className={fieldLabel}>Value</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                          placeholder="e.g. AWS Solutions Architect (2024)"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/45">
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-300">No Custom Sections Added Yet</p>
                <p className="mt-1 text-xs text-slate-500 max-w-[280px] mx-auto dark:text-slate-400">Create custom sections to show certifications, languages, awards, or links.</p>
              </div>
            )}
            
            <Button
              onClick={handleAddCustomField}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs mb-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Custom Field
            </Button>
          </div>
          <SectionFooter current="custom" />
        </div>
      )}
      </div>
      </div>

      <AISuggestionModal
        isOpen={aiModal.isOpen}
        originalText={aiModal.original}
        suggestedText={getSuggestedText(aiModal.original, aiModal.type)}
        actionType={aiModal.type}
        onApply={applyAiSuggestion}
        onClose={() =>
          setAiModal({
            isOpen: false,
            type: 'improve',
            original: '',
            expId: null,
            bulletId: null,
          })
        }
      />
    </div>
  )
}
