'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { CheckCircle2, Clock3, Download, FileText, Save, Edit2, Palette, Type, Space, Sparkles, ChevronDown, Archive } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { supabasePlaceholder, type DbResume } from '@/lib/supabase-placeholder'
import { ResumePreview, type TemplateType } from '@/components/editor/resume-preview'
import { LoginModal } from '@/components/auth/login-modal'
import { SaveVersionModal, type SaveVersionData } from '@/components/versions/save-version-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'

type ExperienceEntry = {
  id: string
  company: string
  position: string
  duration: string
  bullets: { id: string; text: string }[]
  expanded?: boolean
}

type EditorContent = {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
  summary: string
  experiences: ExperienceEntry[]
  educationEntries: { id: string; school: string; degree: string; duration: string; expanded?: boolean }[]
  skills: { id: string; label: string; items: string[] }[]
  customFields: { id: string; label: string; value: string }[]
  accentColor: string
  density: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily: 'sans' | 'serif' | 'mono'
}

function formatRelativeTime(value: Date | null) {
  if (!value) return 'Not saved yet'

  const diffMs = Date.now() - value.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Saved just now'
  if (diffMinutes < 60) return `Saved ${diffMinutes}m ago`
  if (diffHours < 24) return `Saved ${diffHours}h ago`
  if (diffDays < 7) return `Saved ${diffDays}d ago`

  return `Saved ${value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

const DEFAULT_RESUME_DATA: EditorContent = {
  name: 'Alex Morgan',
  title: 'Senior Full Stack Engineer',
  email: 'alex.morgan@design.com',
  phone: '+1 (555) 019-2834',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  github: 'https://github.com/alexmorgan',
  sectionTitles: {
    summary: 'Professional Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
  },
  summary: 'Passionate and results-driven Software Engineer with over 6 years of experience building scalable web applications. Expert in React, Next.js, Node.js, and modern cloud infrastructure. Dedicated to writing clean, maintainable code and mentoring developers to achieve high-velocity product delivery. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  experiences: [
    {
      id: 'exp-1',
      company: 'InnovateTech Solutions',
      position: 'Lead Software Engineer',
      duration: '2022 - Present',
      bullets: [
        { id: 'b1-1', text: 'Architected and built a micro-frontend dashboard using Next.js, reducing bundle size by 40% and improving page load speeds by 1.2 seconds.' },
        { id: 'b1-2', text: 'Spearheaded the migration of legacy REST APIs to GraphQL, increasing developer productivity by 25% and reducing server roundtrips.' },
        { id: 'b1-3', text: 'Mentored a team of 4 junior developers, conducting regular code reviews and introducing testing best practices with Jest and Cypress.' }
      ],
      expanded: true
    },
    {
      id: 'exp-2',
      company: 'CloudScale Inc.',
      position: 'Senior Frontend Developer',
      duration: '2020 - 2022',
      bullets: [
        { id: 'b2-1', text: 'Redesigned the core e-commerce platform using TailwindCSS and React, resulting in a 15% increase in conversion rate and seamless mobile responsive layouts.' },
        { id: 'b2-2', text: 'Optimized state management using Redux Toolkit and swr, eliminating redundant API requests and saving $5k/month in server costs.' }
      ],
      expanded: false
    }
  ],
  educationEntries: [
    { id: 'edu-1', school: 'University of Washington', degree: 'B.S. in Computer Science', duration: '2016 - 2020', expanded: false }
  ],
  skills: [
    { id: 'skills-1', label: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL', 'HTML/CSS'] },
    { id: 'skills-2', label: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Express', 'TailwindCSS', 'Redux'] },
    { id: 'skills-3', label: 'Tools & Cloud', items: ['Docker', 'AWS', 'Vercel', 'Git', 'GraphQL', 'PostgreSQL'] }
  ],
  customFields: [
    { id: 'cf-1', label: 'Certifications', value: 'AWS Certified Solutions Architect (2024)' },
    { id: 'cf-2', label: 'Languages Spoken', value: 'English (Native), Spanish (Conversational)' }
  ],
  accentColor: 'blue',
  density: 'auto',
  fontFamily: 'sans'
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
function getOrCreateResumeId(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('career-commit-resume-id') : null
  if (stored) return stored

  const newId = crypto.randomUUID()
  if (typeof window !== 'undefined') {
    localStorage.setItem('career-commit-resume-id', newId)
  }
  return newId
}

export default function Editor() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [versionId, setVersionId] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resumeName, setResumeName] = useState('My Resume')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('My Resume')
  const resumeId = getOrCreateResumeId()

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
  const [editorContent, setEditorContent] = useState<EditorContent>(DEFAULT_RESUME_DATA)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Account'
  const displayEmail = user?.email || 'No email available'

  // Extract versionId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setVersionId(params.get('versionId'))
  }, [])

  // Load Initial State
  useEffect(() => {
    // If versionId is in URL, fetch that version
    if (versionId) {
      console.log('[Editor] Loading version:', versionId)
      fetch(`/api/resumes/versions?userId=${user?.id}`)
        .then(r => r.json())
        .then(result => {
          const version = result.data?.find((v: any) => String(v.id) === String(versionId))
          if (version && version.content_snapshot) {
            console.log('[Editor] ✅ Loaded version from API:', version.content_snapshot.title)
            const snapshot = version.content_snapshot as EditorContent
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

    if (local) {
      try {
        const parsed = JSON.parse(local)
        console.log('[Editor] Loaded from localStorage:', parsed.title)
        setEditorContent(parsed)
        setResumeName(parsed.name ? `${parsed.name}'s Resume` : 'My Resume')
        if (parsed.accentColor) setAccentColor(parsed.accentColor)
        if (parsed.density) setDensity(parsed.density)
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily)

        triggerPreviewUpdate(parsed)
        return
      } catch (e) {
        console.error('[Editor] Error parsing localStorage:', e)
      }
    }

    loadResumes().then((rows) => {
      if (rows && rows[0]) {
        setResumeName(rows[0].name)
        setEditorContent(DEFAULT_RESUME_DATA)
        triggerPreviewUpdate(DEFAULT_RESUME_DATA)
      } else {
        setEditorContent(DEFAULT_RESUME_DATA)
        triggerPreviewUpdate(DEFAULT_RESUME_DATA)
      }
    })
  }, [versionId, user?.id])

  useEffect(() => {
    if (!userMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

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

  const triggerPreviewUpdate = (content: EditorContent) => {
    const contactParts = [content.email, content.phone, content.linkedin, content.github].filter(Boolean)
    const customFieldLines = content.customFields
      .filter((field) => field.label.trim() && field.value.trim())
      .map((field) => `${field.label.trim().toUpperCase()}\n${field.value.trim()}`)
    const educationLines = content.educationEntries
      .filter((entry) => entry.school.trim() || entry.degree.trim() || entry.duration.trim())
      .map((entry) =>
        [entry.school.trim(), entry.degree.trim(), entry.duration.trim()].filter(Boolean).join(' | ')
      )
    const skillLines = content.skills
      .filter((group) => group.label.trim() && group.items.length > 0)
      .map((group) => `${group.label.trim()}: ${group.items.join(', ')}`)

    // Format multiple experiences
    const experienceLines = content.experiences
      .map((exp) => {
        const header = [exp.position.trim(), exp.company.trim(), exp.duration.trim()].filter(Boolean).join(' | ')
        const bulletsText = exp.bullets.map((b) => `- ${b.text.trim()}`).filter((t) => t !== '-').join('\n')
        return `${header}\n${bulletsText}`.trim()
      })
      .filter(Boolean)

    const previewText = `${content.name}
${content.title}
${contactParts.join(' | ')}

${content.sectionTitles.summary.toUpperCase()}
${content.summary}

${content.sectionTitles.experience.toUpperCase()}
${experienceLines.join('\n')}

${content.sectionTitles.education.toUpperCase()}
${educationLines.join('\n')}

${content.sectionTitles.skills.toUpperCase()}
${skillLines.join('\n')}
${customFieldLines.length > 0 ? `\n${customFieldLines.join('\n\n')}` : ''}`.trim()

    setPreview(previewText)
  }

  const handleEditorChange = useCallback((content: any) => {
    setEditorContent(content)
    setDraftStatus('unsaved')
    triggerPreviewUpdate(content)

    // Sync to LocalStorage
    localStorage.setItem('career-commit-editor-state', JSON.stringify(content))
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

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
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

  const draftCopy =
    draftStatus === 'unsaved'
      ? 'Unsaved changes'
      : draftStatus === 'draft_saved'
        ? 'Draft saved'
        : 'Version ready'

  return (
    <>
      
      {/* Redesigned Premium Editor Workspace Panel - Light Mode Theme */}
      <div className="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800">
        
        {/* Workspace Toolbar (Controls) */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-3.5 flex flex-col md:flex-row gap-4 items-center justify-between z-10 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          
          {/* Left: Logo, Separator, Document Details, Save Status Badge */}
          <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight">CareerCommit</div>
                <div className="text-[10px] text-slate-400 font-medium -mt-0.5">Workspace</div>
              </div>
            </Link>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                {isEditingName ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => { setTempName(resumeName); setIsEditingName(true); }}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title="Click to rename"
                  >
                    <h2 className="truncate text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {resumeName}
                    </h2>
                    <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span>{formatRelativeTime(lastSaved)}</span>
                </div>
              </div>

              {/* Save Status Badge */}
              <div className="flex items-center ml-1 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    draftStatus === 'unsaved'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}
                >
                  {draftStatus === 'unsaved' ? (
                    <Clock3 className="h-2.5 w-2.5" />
                  ) : (
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  )}
                  {draftCopy}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Styling & Action Controls */}
          <div className="flex flex-wrap items-center gap-3 md:justify-end w-full md:w-auto">
            
            {/* Customizer: Accent Color Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
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
                    className={`w-3.5 h-3.5 rounded-full ${c.class} transition-all hover:scale-125 ${
                      accentColor === c.name ? 'ring-2 ring-offset-2 ring-offset-white' : ''
                    }`}
                    title={`Accent: ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Customizer: Font Picker */}
            <div className="flex h-8.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <Type className="w-3.5 h-3.5 text-slate-400" />
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
                className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none border-none pr-1"
              >
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>

            {/* Customizer: Spacing Picker */}
            <div className="flex h-8.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <Space className="w-3.5 h-3.5 text-slate-400" />
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
                className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none border-none pr-1"
              >
                <option value="auto">Spacing: Auto</option>
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="airy">Airy</option>
              </select>
            </div>

            {/* Customizer: Template Selector */}
            <div className="flex h-8.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateType)}
                className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none border-none pr-1"
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

            <div className="flex items-center gap-2 ml-2">
              <Button
                size="sm"
                onClick={handleDraftSave}
                disabled={isSaving}
                className="gap-1.5 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="gap-1.5 rounded-lg border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="gap-1.5 rounded-lg border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 transition-all font-semibold shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              {user ? (
                <div ref={userMenuRef} className="relative z-30">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-1.5 p-1 rounded-lg text-sm text-slate-650 hover:bg-slate-50 border border-slate-200 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-[60]"
                    >
                      <div className="rounded-xl bg-slate-50 px-3 py-3 border border-slate-100 mb-2">
                        <div className="truncate text-sm font-semibold text-slate-800">{displayName}</div>
                        <div className="truncate text-xs text-slate-500">{displayEmail}</div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        📊 My Resumes
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        ↗ Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-800 rounded-lg px-3 py-1.5 h-8.5"
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Viewport-Locked Split Workspace Screen */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          
          {/* Left Side: Scrollable Input Form */}
          <div className="w-full lg:w-[55%] h-full overflow-y-auto px-6 py-6 border-r border-slate-200/80 bg-[#FAF9F6] custom-scrollbar">
            {editorContent && (
              <EditorSections
                initialContent={editorContent}
                onContentChange={handleEditorChange}
              />
            )}
          </div>

          {/* Right Side: Sticky Rendered A4 Preview */}
          <div className="w-full lg:w-[45%] h-full overflow-y-hidden bg-slate-100">
            <ResumePreview
              name={resumeName}
              draftStatus={draftStatus}
              preview={preview}
              template={template}
              onTemplateChange={setTemplate}
              accentColor={accentColor}
              density={density}
              fontFamily={fontFamily}
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
