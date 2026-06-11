'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, Edit2, X, Trash2, ArrowUp, ArrowDown, Sparkles, Plus } from 'lucide-react'
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

interface EditorContent {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
  summary: string
  experiences: ExperienceEntry[]
  educationEntries: EducationEntry[]
  skills: SkillGroup[]
  customFields: CustomField[]
}

interface EditorSectionsProps {
  initialContent: EditorContent | null
  onContentChange?: (content: EditorContent) => void
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 
  'Python', 'AWS', 'TailwindCSS', 'Docker', 
  'GraphQL', 'PostgreSQL', 'Git', 'Agile'
]

export function EditorSections({ initialContent, onContentChange }: EditorSectionsProps) {
  const [personalInfoExpanded, setPersonalInfoExpanded] = useState(true)
  const [sections, setSections] = useState<Record<string, { title: string; expanded: boolean }>>({
    summary: { title: initialContent?.sectionTitles?.summary || 'Professional Summary', expanded: true },
    experience: { title: initialContent?.sectionTitles?.experience || 'Experience', expanded: true },
    education: { title: initialContent?.sectionTitles?.education || 'Education', expanded: false },
    skills: { title: initialContent?.sectionTitles?.skills || 'Skills', expanded: false },
  })

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
        skills: sections.skills.title,
      },
      summary,
      experiences,
      educationEntries,
      skills,
      customFields,
    }
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
    sections.skills.title,
    summary,
    experiences,
    educationEntries,
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

  // Light Mode Layout Constants
  const panelShell = 'overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300'
  const panelHeader = 'flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/40 px-5 py-4'
  const panelTitle = 'text-[11px] font-bold tracking-wider text-slate-700 uppercase'
  const panelSubtitle = 'mt-1 text-[11px] text-slate-500 font-medium'
  const fieldLabel = 'text-[10px] font-bold uppercase tracking-wider text-slate-500'
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'

  const SectionHeader = ({ sectionKey, counts }: { sectionKey: string; counts: string }) =>
    renamingSection === sectionKey ? (
      <div className={panelHeader}>
        <input
          autoFocus
          value={sections[sectionKey].title}
          onChange={(e) => handleSectionTitleChange(sectionKey, e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 transition-all"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Save"
          className="rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 ml-2"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Cancel"
          className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <div className={panelHeader}>
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left group"
        >
          <div className="min-w-0">
            <h3 className={panelTitle}>{sections[sectionKey].title}</h3>
            <p className={panelSubtitle}>{counts}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 group-hover:text-slate-600 ${sections[sectionKey].expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(sectionKey)}
          title="Rename Section"
          className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    )

  return (
    <div className="space-y-6 pr-1">
      {/* 1. Personal Info */}
      <div className={panelShell}>
        <div className={panelHeader}>
          <div className="flex-1">
            <h3 className={panelTitle}>Personal Information</h3>
            <p className={panelSubtitle}>Your identity and professional contacts</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPersonalInfoExpanded((prev) => !prev)}
            title={personalInfoExpanded ? 'Collapse' : 'Expand'}
            className="rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${personalInfoExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
        {personalInfoExpanded && (
          <div className="grid gap-4 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className={fieldLabel}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
                <label className={fieldLabel}>Email Address</label>
                <input
                  type="email"
                  placeholder="alex.morgan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
                <label className={fieldLabel}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-1.5">
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
        )}
      </div>

      {/* 2. Professional Summary */}
      <div className={panelShell}>
        <SectionHeader 
          sectionKey="summary" 
          counts={summary.trim() ? `${summary.trim().split(/\s+/).length} words` : 'No summary written yet'} 
        />
        {sections.summary.expanded && (
          <div className="p-5">
            <div className="relative">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={`${inputClass} resize-none min-h-[100px] pb-10`}
                placeholder="Write a compelling summary highlighting your core skills, years of experience, and achievements..."
              />
              <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-bold uppercase">
                {summary.trim() ? summary.trim().split(/\s+/).length : 0} Words
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Work Experience */}
      <div className={panelShell}>
        <SectionHeader 
          sectionKey="experience" 
          counts={`${experiences.length} positions · ${experiences.reduce((acc, exp) => acc + exp.bullets.length, 0)} bullets`} 
        />
        {sections.experience.expanded && (
          <div className="p-5 space-y-5">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 relative group/card transition-all hover:border-slate-300">
                {/* Collapsible Sub-Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExperienceExpand(exp.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${exp.expanded ? 'rotate-180' : ''}`} />
                      <span className="text-sm font-semibold text-slate-700">
                        {exp.position || exp.company ? (
                          <>
                            {exp.position || 'Position'} <span className="text-slate-400">at</span> {exp.company || 'Company'}
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
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < experiences.length - 1 && (
                      <button
                        title="Move Down"
                        onClick={() => handleMoveExperience(idx, 'down')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md"
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
                      <div className="grid gap-1.5">
                        <label className={fieldLabel}>Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. InnovateTech Solutions"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid gap-1.5">
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

                    <div className="grid gap-1.5">
                      <label className={fieldLabel}>Duration</label>
                      <DateRangePicker
                        value={exp.duration}
                        onChange={(val) => handleUpdateExperience(exp.id, { duration: val })}
                        presentLabel="I currently work here"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
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
                        className="w-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg py-1.5 font-medium transition-all shadow-xs"
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
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Professional Experience
            </Button>
          </div>
        )}
      </div>

      {/* 4. Education */}
      <div className={panelShell}>
        <SectionHeader 
          sectionKey="education" 
          counts={`${educationEntries.length} entries`} 
        />
        {sections.education.expanded && (
          <div className="p-5 space-y-5">
            {educationEntries.map((entry, idx) => (
              <div key={entry.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 relative group/card transition-all hover:border-slate-300">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => toggleEducationExpand(entry.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${entry.expanded ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-semibold text-slate-700">
                      {entry.school || entry.degree ? (
                        <>
                          {entry.degree || 'Degree'} <span className="text-slate-400">at</span> {entry.school || 'School'}
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
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < educationEntries.length - 1 && (
                      <button
                        title="Move Down"
                        onClick={() => handleMoveEducation(idx, 'down')}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md"
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
                      <div className="grid gap-1.5">
                        <label className={fieldLabel}>School / University</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={entry.school}
                          onChange={(e) => handleUpdateEducationEntry(entry.id, { school: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid gap-1.5">
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

                    <div className="grid gap-1.5">
                      <label className={fieldLabel}>Duration / Dates</label>
                      <DateRangePicker
                        value={entry.duration}
                        onChange={(val) => handleUpdateEducationEntry(entry.id, { duration: val })}
                        presentLabel="I'm currently studying here"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={handleAddEducationEntry}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </div>
        )}
      </div>

      {/* 5. Skills */}
      <div className={panelShell}>
        <SectionHeader 
          sectionKey="skills" 
          counts={`${skills.reduce((sum, group) => sum + group.items.length, 0)} skills across ${skills.length} categories`} 
        />
        {sections.skills.expanded && (
          <div className="p-5 space-y-6">
            {skills.map((group) => (
              <div key={group.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 transition-all hover:border-slate-350">
                <div className="flex items-center gap-3 justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 max-w-[240px]">
                    <input
                      value={group.label}
                      onChange={(e) => handleUpdateSkillGroup(group.id, { label: e.target.value })}
                      placeholder="Category name"
                      className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 text-sm font-semibold text-slate-800 outline-none pb-0.5 transition-all w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/15">
                      {group.items.length} items
                    </span>
                    <button
                      title="Delete Category"
                      onClick={() => handleDeleteSkillGroup(group.id)}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Skill Tags */}
                {group.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-lg bg-white border border-slate-200/60 shadow-inner-sm">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleDeleteSkill(group.id, item)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
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
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleAddSkillToGroup(group.id)}
                    className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg px-4 shadow-xs"
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
                        className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-0.5 rounded-md border border-slate-200 bg-white transition-colors shadow-xxs"
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
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Skill Category
            </Button>
          </div>
        )}
      </div>

      {/* 6. Custom Fields */}
      <div className={panelShell}>
        <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className={panelTitle}>Custom Sections</h3>
            <p className={panelSubtitle}>Add custom key-value metadata like Certifications or Languages</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/15">
            {customFields.length} fields
          </span>
        </div>
        <div className="p-5 space-y-4">
          {customFields.length > 0 ? (
            <div className="space-y-4">
              {customFields.map((field, idx) => (
                <div key={field.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 relative group/card transition-all hover:border-slate-350">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold text-slate-500">Custom Field {idx + 1}</span>
                    <button
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="p-1 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <label className={fieldLabel}>Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                        placeholder="e.g. Certifications"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-1.5">
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
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-slate-400">No Custom Sections Added Yet</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[280px] mx-auto">Create custom sections to show certifications, languages, awards, or links.</p>
            </div>
          )}
          
          <Button
            onClick={handleAddCustomField}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl py-2 font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Custom Field
          </Button>
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
