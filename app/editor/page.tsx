'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Download, Save, Edit2, Palette, Type, Space, Sparkles, Archive, Plus, Eye, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { supabasePlaceholder, type DbResume } from '@/lib/supabase-placeholder'
import { ResumePreview, type TemplateType, type PreviewMetrics } from '@/components/editor/resume-preview'
import { LoginModal } from '@/components/auth/login-modal'
import { SaveVersionModal, type SaveVersionData } from '@/components/versions/save-version-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'
import { applyAgentActions, type EditorContent as ActionEditorContent } from '@/lib/resume-action-handler'
import type { AgentAction } from '@/lib/resume-agent-actions'

type ExperienceEntry = {
  id: string
  company: string
  position: string
  duration: string
  bullets: { id: string; text: string }[]
  expanded?: boolean
}

type ProjectEntry = {
  id: string
  name: string
  description: string
  technologies?: string
  expanded?: boolean
}

type EditorContent = {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills' | 'projects', string>
  summary: string
  experiences: ExperienceEntry[]
  educationEntries: { id: string; school: string; degree: string; duration: string; expanded?: boolean }[]
  projects: ProjectEntry[]
  skills: { id: string; label: string; items: string[] }[]
  customFields: { id: string; label: string; value: string }[]
  accentColor: string
  density: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily: 'sans' | 'serif' | 'mono'
}

function createBlankResumeData(): EditorContent {
  return {
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    sectionTitles: {
      summary: 'Professional Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
    },
    summary: '',
    experiences: [],
    educationEntries: [],
    projects: [],
    skills: [],
    customFields: [],
    accentColor: 'blue',
    density: 'auto',
    fontFamily: 'sans',
  }
}

function normalizeResumeContent(content: Partial<EditorContent> | null | undefined): EditorContent {
  const blank = createBlankResumeData()

  return {
    ...blank,
    ...content,
    sectionTitles: {
      ...blank.sectionTitles,
      ...(content?.sectionTitles ?? {}),
    },
    experiences: content?.experiences ?? blank.experiences,
    educationEntries: content?.educationEntries ?? blank.educationEntries,
    projects: content?.projects ?? blank.projects,
    skills: content?.skills ?? blank.skills,
    customFields: content?.customFields ?? blank.customFields,
  }
}

const COLOR_OPTIONS = [
  { name: 'blue', class: 'bg-blue-500 ring-blue-500/30' },
  { name: 'indigo', class: 'bg-indigo-500 ring-indigo-500/30' },
  { name: 'emerald', class: 'bg-emerald-500 ring-emerald-500/30' },
  { name: 'amber', class: 'bg-amber-500 ring-amber-500/30' },
  { name: 'rose', class: 'bg-rose-500 ring-rose-500/30' },
  { name: 'violet', class: 'bg-violet-500 ring-violet-500/30' },
  { name: 'slate', class: 'bg-slate-500 ring-slate-500/30' },
]

// Initialize resume ID synchronously before component render
function getOrCreateResumeId(forceNew = false): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('career-commit-resume-id') : null
  if (!forceNew && stored) return stored

  const newId = crypto.randomUUID()
  if (typeof window !== 'undefined') {
    localStorage.setItem('career-commit-resume-id', newId)
  }
  return newId
}

export default function Editor() {
  const { user } = useAuth()
  const router = useRouter()
  const [versionId, setVersionId] = useState<string | null>(null)
  const [isNewResume, setIsNewResume] = useState(false)
  const [resumeName, setResumeName] = useState('My Resume')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('My Resume')
  const [resumeId, setResumeId] = useState(() => getOrCreateResumeId())

  const [draftStatus, setDraftStatus] = useState<'unsaved' | 'draft_saved' | 'ready_to_save'>(
    'draft_saved'
  )
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Customization Options
  const [template, setTemplate] = useState<TemplateType>('modern')
  const [accentColor, setAccentColor] = useState<string>('blue')
  const [density, setDensity] = useState<'airy' | 'normal' | 'compact' | 'auto'>('auto')
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans')

  const [preview, setPreview] = useState('')
  const [editorContent, setEditorContent] = useState<EditorContent>(createBlankResumeData())
  const [agentSyncSignal, setAgentSyncSignal] = useState(0)
  const [agentFocusSection, setAgentFocusSection] = useState<
    'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom' | undefined
  >(undefined)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Preview zoom + metrics (lifted from ResumePreview so the control strip lives in the toolbar)
  const [previewMetrics, setPreviewMetrics] = useState<PreviewMetrics>({ pageCount: 1, scale: 0.7 })
  const [zoomLevel, setZoomLevel] = useState<number | null>(null) // null means Auto-Fit

  const currentVersion = 1

  const getDraftLabel = () => {
    switch (draftStatus) {
      case 'unsaved':
        return 'Unsaved Changes'
      case 'draft_saved':
        return 'Saved Locally'
      case 'ready_to_save':
        return 'Version Ready'
    }
  }

  const handleZoomIn = () => {
    const current = zoomLevel || previewMetrics.scale
    setZoomLevel(Math.min(1.5, parseFloat((current + 0.1).toFixed(1))))
  }

  const handleZoomOut = () => {
    const current = zoomLevel || previewMetrics.scale
    setZoomLevel(Math.max(0.4, parseFloat((current - 0.1).toFixed(1))))
  }

  const handleResetZoom = () => {
    setZoomLevel(null) // Restore Auto-Fit
  }

  const displayZoom = Math.round((zoomLevel || previewMetrics.scale) * 100)

  // Extract versionId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setVersionId(params.get('versionId'))
  }, [])

  // Load Initial State
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newResumeMode = params.get('new') === '1'
    setIsNewResume(newResumeMode)

    if (newResumeMode) {
      const blank = createBlankResumeData()
      const freshResumeId = getOrCreateResumeId(true)
      setResumeId(freshResumeId)
      setVersionId(null)
      setResumeName('New Resume')
      setTempName('New Resume')
      setEditorContent(blank)
      setAccentColor(blank.accentColor)
      setDensity(blank.density)
      setFontFamily(blank.fontFamily)
      setPreview('')
      return
    }

    // If versionId is in URL, fetch that version
    if (versionId) {
      console.log('[Editor] Loading version:', versionId)
      fetch(`/api/resumes/versions?userId=${user?.id}`)
        .then(r => r.json())
        .then(result => {
          const version = result.data?.find((v: any) => String(v.id) === String(versionId))
          if (version && version.content_snapshot) {
            console.log('[Editor] ✅ Loaded version from API:', version.content_snapshot.title)
            const snapshot = normalizeResumeContent(version.content_snapshot as Partial<EditorContent>)
            setEditorContent(snapshot)
            setResumeName(snapshot.name ? `${snapshot.name}'s Resume` : 'My Resume')
            if (snapshot.accentColor) setAccentColor(snapshot.accentColor)
            if (snapshot.density) setDensity(snapshot.density)
            if (snapshot.fontFamily) setFontFamily(snapshot.fontFamily)
            triggerPreviewUpdate(snapshot)
          }
        })
        .catch(err => console.error('[Editor] Error loading version:', err))
      return
    }

    // Client-side initialization
    const local = localStorage.getItem('career-commit-editor-state')
    console.log('[Editor] Initialization - localStorage content:', local ? 'Found' : 'Not found')
    console.log('[Editor] Raw localStorage string:', local?.substring(0, 200))

    if (local) {
      try {
        const parsed = JSON.parse(local)
        console.log('[Editor] ✅ Parsed localStorage successfully:', { name: parsed.name, title: parsed.title, expCount: parsed.experiences?.length })
        const normalized = normalizeResumeContent(parsed)
        console.log('[Editor] After normalization:', { name: normalized.name, title: normalized.title, expCount: normalized.experiences?.length })
        setEditorContent(normalized)
        setResumeName(normalized.name ? `${normalized.name}'s Resume` : 'My Resume')
        if (normalized.accentColor) setAccentColor(normalized.accentColor)
        if (normalized.density) setDensity(normalized.density)
        if (normalized.fontFamily) setFontFamily(normalized.fontFamily)

        triggerPreviewUpdate(normalized)
        console.log('[Editor] ✅ Loaded and displayed from localStorage')
        return
      } catch (e) {
        console.error('[Editor] Error parsing localStorage:', e)
      }
    }

    // Don't load from DB if we just loaded from localStorage
    console.log('[Editor] No localStorage data, loading from database...')
    loadResumes().then((rows) => {
      console.log('[Editor] Database resumes loaded:', rows?.length)
      if (rows && rows[0]) {
        setResumeName(rows[0].name)
        const blank = createBlankResumeData()
        setEditorContent(blank)
        triggerPreviewUpdate(blank)
      } else {
        const blank = createBlankResumeData()
        setEditorContent(blank)
        triggerPreviewUpdate(blank)
      }
    })
  }, [versionId, user?.id])

  const handleSaveName = () => {
    setIsEditingName(false)
    if (tempName.trim()) {
      setResumeName(tempName.trim())
      if (editorContent) {
        const next = { ...editorContent, name: tempName.trim() }
        setEditorContent(next)
        localStorage.setItem('career-commit-editor-state', JSON.stringify(next))
      }
    }
  }

  const triggerPreviewUpdate = (content: Partial<EditorContent> | null | undefined) => {
    const safe = normalizeResumeContent(content)
    const contactParts = [safe.email, safe.phone, safe.linkedin, safe.github].filter(Boolean)
    const customFieldLines = safe.customFields
      .filter((field) => field.label.trim() && field.value.trim())
      .map((field) => `${field.label.trim().toUpperCase()}\n${field.value.trim()}`)
    const educationLines = safe.educationEntries
      .filter((entry) => entry.school.trim() || entry.degree.trim() || entry.duration.trim())
      .map((entry) =>
        [entry.school.trim(), entry.degree.trim(), entry.duration.trim()].filter(Boolean).join(' | ')
      )
    const skillLines = safe.skills
      .filter((group) => group.label.trim() && group.items.length > 0)
      .map((group) => `${group.label.trim()}: ${group.items.join(', ')}`)

    const projectLines = safe.projects
      .filter((proj) => proj.name.trim() || proj.description.trim())
      .map((proj) => {
        const title = proj.name.trim()
        const description = proj.description.trim()
        const tech = proj.technologies?.trim()
        return [title, description, tech || ''].filter(Boolean).join(' | ')
      })

    // Format multiple experiences
    const experienceLines = safe.experiences
      .map((exp) => {
        const header = [exp.position.trim(), exp.company.trim(), exp.duration.trim()].filter(Boolean).join(' | ')
        const bulletsText = exp.bullets.map((b) => `- ${b.text.trim()}`).filter((t) => t !== '-').join('\n')
        return `${header}\n${bulletsText}`.trim()
      })
      .filter(Boolean)

    const previewText = `${safe.name}
${safe.title}
${contactParts.join(' | ')}

${safe.sectionTitles.summary.toUpperCase()}
${safe.summary}

${safe.sectionTitles.experience.toUpperCase()}
${experienceLines.join('\n')}

${safe.sectionTitles.education.toUpperCase()}
${educationLines.join('\n')}

${safe.sectionTitles.projects.toUpperCase()}
${projectLines.join('\n')}

${safe.sectionTitles.skills.toUpperCase()}
${skillLines.join('\n')}
${customFieldLines.length > 0 ? `\n${customFieldLines.join('\n\n')}` : ''}`.trim()

    setPreview(previewText)
  }

  const handleEditorChange = useCallback((content: any) => {
    // Don't save blank content to localStorage
    if (!content.name && !content.email && !content.phone) {
      console.log('[Editor] Ignoring blank content save')
      return
    }

    setEditorContent(content)
    setDraftStatus('unsaved')
    triggerPreviewUpdate(content)

    // Sync to LocalStorage only if content has data
    if (content.name || content.experiences?.length > 0 || content.educationEntries?.length > 0) {
      localStorage.setItem('career-commit-editor-state', JSON.stringify(content))
    }
  }, [])

  const handleApplyAgentActions = useCallback((actions: AgentAction[]) => {
    setEditorContent((prev) => {
      const updated = applyAgentActions(prev as ActionEditorContent, actions)
      setDraftStatus('unsaved')
      triggerPreviewUpdate(updated)
      localStorage.setItem('career-commit-editor-state', JSON.stringify(updated))
      return updated
    })
    // Navigate the form to the section the last action touched.
    const last = actions[actions.length - 1]
    const sectionByType: Record<string, typeof agentFocusSection> = {
      update_personal_info: 'personal',
      add_project: 'projects',
      update_project: 'projects',
      delete_project: 'projects',
      add_skill: 'skills',
      update_experience: 'experience',
      add_bullet: 'experience',
    }
    setAgentFocusSection(last ? sectionByType[last.type] : undefined)
    // Force the form to re-sync from the updated content so assistant changes
    // (new projects, skills, etc.) become visible immediately.
    setAgentSyncSignal((s) => s + 1)
  }, [])

  const handleDraftSave = async () => {
    console.log('[Save] Button clicked. User:', user?.email)

    if (!user) {
      setLoginModalOpen(true)
      return
    }

    setIsSaving(true)
    try {
      const resume: DbResume = {
        id: resumeId,
        user_id: user.id,
        name: resumeName,
        title: editorContent.title,
        template: 'modern',
        content_text: preview || 'Resume content',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('[Save] Saving to Supabase...')

      // Add 15 second timeout to Supabase call
      const savePromise = supabasePlaceholder.saveResume(user.id, resume)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timed out after 15 seconds. Check Supabase status.')), 15000)
      )

      const result = await Promise.race([savePromise, timeoutPromise as any])

      if (result) {
        setDraftStatus('draft_saved')
        setLastSaved(new Date())
        console.log('[Save] ✅ Success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[Save] ❌ Failed:', message)
      alert(`Error: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveVersionClick = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    setVersionModalOpen(true)
  }

  const handleSaveVersion = async (data: SaveVersionData) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/resumes/versions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: resumeId,
          user_id: user.id,
          title: data.title,
          content_snapshot: editorContent,
          change_notes: data.description,
          saved_by: data.source,
          fit_score: 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save version')
      }

      setVersionModalOpen(false)
      alert('✅ Version saved successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[SaveVersion] Error:', message)
      alert(`Error saving version: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNewResume = () => {
    const nextPath = '/editor?new=1'

    if (isNewResume) {
      const blank = createBlankResumeData()
      const freshResumeId = getOrCreateResumeId(true)
      setResumeId(freshResumeId)
      setVersionId(null)
      setResumeName('New Resume')
      setTempName('New Resume')
      setEditorContent(blank)
      setAccentColor(blank.accentColor)
      setDensity(blank.density)
      setFontFamily(blank.fontFamily)
      setPreview('')
      localStorage.removeItem('career-commit-editor-state')
      return
    }

    router.push(nextPath)
  }


  const resumeStrength = useMemo(() => {
    if (!editorContent) return 0
    let score = 0
    if (editorContent.name.trim()) score += 10
    if (editorContent.title.trim()) score += 10
    if (editorContent.email.trim()) score += 10
    if (editorContent.phone.trim()) score += 10
    if (editorContent.summary.trim()) score += 15
    
    const hasExp = editorContent.experiences?.some(exp => exp.company.trim() || exp.position.trim())
    if (hasExp) score += 15
    
    const hasEdu = editorContent.educationEntries?.some(edu => edu.school.trim() || edu.degree.trim())
    if (hasEdu) score += 15
    
    const hasSkills = editorContent.skills?.some(s => s.items.length > 0)
    if (hasSkills) score += 15
    
    return score
  }, [editorContent])

  const strengthColor = resumeStrength < 50 ? 'from-rose-500 to-amber-500' : resumeStrength < 80 ? 'from-amber-500 to-emerald-500' : 'from-emerald-500 to-indigo-500'

  return (
    <>
      
      {/* Redesigned Premium Editor Workspace Panel - Light Mode Theme */}
      <div className="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0b1020] dark:text-slate-100">

        {/* Workspace Toolbar */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-4">
            <div className="flex w-full flex-1 flex-col gap-2">
              <div className="grid w-full gap-3 rounded-[1.4rem] border border-slate-200/80 bg-slate-50/90 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:justify-items-stretch">
                <div className="flex w-full flex-wrap items-center gap-2 xl:justify-self-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-950/80">
                    <Palette className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <div className="flex items-center gap-1.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setAccentColor(c.name)
                            if (editorContent) {
                              const next = { ...editorContent, accentColor: c.name }
                              localStorage.setItem('career-commit-editor-state', JSON.stringify(next))
                            }
                          }}
                          className={`h-3.5 w-3.5 rounded-full ${c.class} transition-transform hover:scale-125 ${
                            accentColor === c.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950' : ''
                          }`}
                          title={`Accent: ${c.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950/80">
                    <Type className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        const val = e.target.value as 'sans' | 'serif' | 'mono'
                        setFontFamily(val)
                        if (editorContent) {
                          const next = { ...editorContent, fontFamily: val }
                          localStorage.setItem('career-commit-editor-state', JSON.stringify(next))
                        }
                      }}
                      className="cursor-pointer bg-transparent pr-1 text-xs font-semibold text-slate-700 outline-none border-none dark:text-slate-200"
                    >
                      <option value="sans">Sans</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Mono</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950/80">
                    <Space className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <select
                      value={density}
                      onChange={(e) => {
                        const val = e.target.value as 'airy' | 'normal' | 'compact' | 'auto'
                        setDensity(val)
                        if (editorContent) {
                          const next = { ...editorContent, density: val }
                          localStorage.setItem('career-commit-editor-state', JSON.stringify(next))
                        }
                      }}
                      className="cursor-pointer bg-transparent pr-1 text-xs font-semibold text-slate-700 outline-none border-none dark:text-slate-200"
                    >
                      <option value="auto">Spacing: Auto</option>
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="airy">Airy</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950/80">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as TemplateType)}
                      className="cursor-pointer bg-transparent pr-1 text-xs font-semibold text-slate-700 outline-none border-none dark:text-slate-200"
                    >
                      <option value="modern">Modern Theme</option>
                      <option value="classic">Classic Theme</option>
                      <option value="minimalist">Minimal Theme</option>
                      <option value="creative">Creative Theme</option>
                      <option value="elegant">Elegant Theme</option>
                      <option value="bold">Bold Theme</option>
                      <option value="technical">Technical Theme</option>
                    </select>
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 xl:justify-self-end xl:justify-end">
                  <Button
                    size="sm"
                    onClick={handleDraftSave}
                    disabled={isSaving}
                    className="h-9 gap-1.5 rounded-full bg-indigo-600 px-4 text-white shadow-md shadow-indigo-600/10 transition-all font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    title={user ? (isSaving ? 'Saving...' : 'Save Draft') : 'Sign in to save'}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSaveVersionClick}
                    disabled={isSaving}
                    variant="outline"
                    className="h-9 gap-1.5 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    title={user ? 'Save a version snapshot' : 'Sign in to save versions'}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Version
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const element = document.getElementById('download-pdf-btn')
                      element?.click()
                    }}
                    className="h-9 gap-1.5 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNewResume}
                    className="h-9 gap-1.5 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>

                </div>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 xl:w-auto xl:flex-none xl:justify-end">
              <div className="min-w-0">
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                      }}
                      className="min-w-0 rounded-2xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(resumeName)
                        setIsEditingName(true)
                      }}
                      className="group flex min-w-0 items-center gap-1.5 text-left"
                      title="Click to rename"
                    >
                      <h2 className="truncate text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300">
                        {resumeName}
                      </h2>
                      <Edit2 className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview status + zoom (moved up from the preview pane) */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${draftStatus === 'unsaved' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                  {getDraftLabel()}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                  v{currentVersion}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                  {previewMetrics.pageCount} page{previewMetrics.pageCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Zoom and Fit Toolbar */}
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleResetZoom}
                  title="Auto-Fit Screen"
                  className={`min-w-20 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    zoomLevel === null
                      ? 'border border-indigo-500/15 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  {displayZoom}% {zoomLevel === null && 'Auto'}
                </button>

                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                {zoomLevel !== null && (
                  <>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    <button
                      onClick={handleResetZoom}
                      title="Fit to Width"
                      className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Viewport-Locked Split Workspace Screen */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          
          {/* Left Side: Scrollable Input Form */}
          <div className="w-full lg:w-[55%] h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 border-r border-slate-200/80 bg-[#FAF9F6] custom-scrollbar dark:border-slate-800 dark:bg-[#0f172a]">
            {editorContent && (
              <div className="space-y-8">
                <EditorSections
                  initialContent={editorContent}
                  onContentChange={handleEditorChange}
                  syncSignal={agentSyncSignal}
                  focusSection={agentFocusSection}
                />

                {user && (
                  <div className="pb-6">
                    {/* ResumeChatbot temporarily disabled */}
                    {/* <ResumeChatbot
                      context={JSON.stringify(editorContent)}
                      sourceLabel="Editor"
                      onApplyActions={handleApplyAgentActions}
                    /> */}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Sticky Rendered A4 Preview */}
          <div className="w-full lg:w-[45%] h-full overflow-y-hidden bg-slate-100 dark:bg-[#020617]">
            <ResumePreview
              name={resumeName}
              currentVersion={currentVersion}
              draftStatus={draftStatus}
              preview={preview}
              template={template}
              onTemplateChange={setTemplate}
              accentColor={accentColor}
              density={density}
              fontFamily={fontFamily}
              zoomLevel={zoomLevel}
              onMetricsChange={setPreviewMetrics}
            />
          </div>
        </div>
      </div>

      {/* Save Version Modal */}
      <SaveVersionModal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        onSave={handleSaveVersion}
        isSaving={isSaving}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </>
  )
}
