'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { CheckCircle2, Clock3, Download, FileText, Save, Edit2, Palette, Type, Space, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { ResumePreview, type TemplateType } from '@/components/editor/resume-preview'
import { SaveVersionModal } from '@/components/versions/save-version-modal'
import { LoginModal } from '@/components/auth/login-modal'
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

export default function Editor() {
  const { user } = useAuth()
  const [resumeName, setResumeName] = useState('My Resume')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('My Resume')

  const [draftStatus, setDraftStatus] = useState<'unsaved' | 'draft_saved' | 'ready_to_save'>(
    'draft_saved'
  )
  const [currentVersion, setCurrentVersion] = useState(1)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Customization Options
  const [template, setTemplate] = useState<TemplateType>('modern')
  const [accentColor, setAccentColor] = useState<string>('blue')
  const [density, setDensity] = useState<'airy' | 'normal' | 'compact' | 'auto'>('auto')
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans')
  
  const [preview, setPreview] = useState('')
  const [editorContent, setEditorContent] = useState<EditorContent | null>(null)
  const [saveVersionModalOpen, setSaveVersionModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // Load Initial State
  useEffect(() => {
    // Client-side initialization
    const local = localStorage.getItem('career-commit-editor-state')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        setEditorContent(parsed)
        setResumeName(parsed.name ? `${parsed.name}'s Resume` : 'My Resume')
        if (parsed.accentColor) setAccentColor(parsed.accentColor)
        if (parsed.density) setDensity(parsed.density)
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily)
        
        triggerPreviewUpdate(parsed)
        return
      } catch (e) {
        console.error(e)
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
  }, [])

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

  const handleEditorChange = useCallback((content: EditorContent) => {
    setEditorContent(content)
    setDraftStatus('unsaved')
    triggerPreviewUpdate(content)

    // Sync to LocalStorage
    localStorage.setItem('career-commit-editor-state', JSON.stringify(content))
  }, [])

  const handleDraftSave = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    setDraftStatus('draft_saved')
    setLastSaved(new Date())
  }

  const handleSaveVersionConfirm = (_data: { title: string; changeNote: string; source: string }) => {
    setCurrentVersion(currentVersion + 1)
    setDraftStatus('ready_to_save')
    setSaveVersionModalOpen(false)
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
      <Navbar />
      
      {/* Redesigned Premium Editor Workspace Panel - Light Mode Theme */}
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-slate-50 text-slate-800">
        
        {/* Workspace Toolbar (Controls) */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between z-10 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          
          {/* Left: Rename field, Version status, Save State */}
          <div className="flex flex-wrap items-center gap-4 min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-indigo-600">
                <FileText className="h-4.5 w-4.5" />
              </div>
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
                <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[10px] text-slate-500 font-medium">
                  <span>v{currentVersion}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{formatRelativeTime(lastSaved)}</span>
                </div>
              </div>
            </div>

            {/* Save Status Badge */}
            <div className="flex items-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  draftStatus === 'unsaved'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}
              >
                {draftStatus === 'unsaved' ? (
                  <Clock3 className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                {draftCopy}
              </span>
            </div>

            {/* Resume Strength Score Progress */}
            <div className="hidden lg:flex items-center gap-2.5 pl-4 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Strength:</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className={`h-full bg-gradient-to-r ${strengthColor} transition-all duration-500`}
                  style={{ width: `${resumeStrength}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{resumeStrength}%</span>
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

            <div className="flex items-center gap-1.5 ml-2">
              <Button
                size="sm"
                onClick={handleDraftSave}
                className="gap-1.5 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all font-semibold"
                title={user ? 'Save Draft' : 'Sign in to save'}
              >
                <Save className="h-3.5 w-3.5" />
                Save
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
            </div>
          </div>
        </div>

        {/* Viewport-Locked Split Workspace Screen */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          
          {/* Left Side: Scrollable Input Form */}
          <div className="w-full lg:w-[55%] h-full overflow-y-auto px-6 py-6 border-r border-slate-200/80 bg-white custom-scrollbar">
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
              currentVersion={currentVersion}
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
        isOpen={saveVersionModalOpen}
        currentVersion={currentVersion}
        onClose={() => setSaveVersionModalOpen(false)}
        onSave={handleSaveVersionConfirm}
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
