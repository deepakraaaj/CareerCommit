'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, Plus, History, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { ResumePreview, type TemplateType } from '@/components/editor/resume-preview'
import { SaveVersionModal } from '@/components/versions/save-version-modal'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'

export default function Editor() {
  const { user } = useAuth()
  const [resumeName, setResumeName] = useState('Resume')
  const [draftStatus, setDraftStatus] = useState<'unsaved' | 'draft_saved' | 'ready_to_save'>(
    'draft_saved'
  )
  const [currentVersion, setCurrentVersion] = useState(1)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [preview, setPreview] = useState('')
  const [saveVersionModalOpen, setSaveVersionModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [template, setTemplate] = useState<TemplateType>('modern')

  useEffect(() => {
    let active = true

    loadResumes().then((rows) => {
      if (active && rows[0]) {
        setResumeName(rows[0].name)
        setPreview(rows[0].contentText ?? '')
      }
    })

    return () => {
      active = false
    }
  }, [])

  const handleEditorChange = (content: {
    name: string
    title: string
    email: string
    phone: string
    linkedin: string
    github: string
    sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
    summary: string
    company: string
    position: string
    duration: string
    bullets: { id: string; text: string }[]
    educationEntries: { id: string; school: string; degree: string; duration: string }[]
    skills: { id: string; label: string; items: string[] }[]
    customFields: { id: string; label: string; value: string }[]
  }) => {
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

    // Convert editor content to preview text format
    const previewText = `${content.name}
${content.title}
${contactParts.join(' | ')}

${content.sectionTitles.summary.toUpperCase()}
${content.summary}

${content.sectionTitles.experience.toUpperCase()}
${content.position} | ${content.company} | ${content.duration}
${content.bullets.map((b) => `- ${b.text}`).join('\n')}

${content.sectionTitles.education.toUpperCase()}
${educationLines.join('\n')}

${content.sectionTitles.skills.toUpperCase()}
${skillLines.join('\n')}
${customFieldLines.length > 0 ? `\n${customFieldLines.join('\n\n')}` : ''}`.trim()

    setPreview(previewText)
    setDraftStatus('unsaved')
  }

  const handleDraftSave = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    setDraftStatus('draft_saved')
    setLastSaved(new Date())
  }

  const handleVersionSave = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    setSaveVersionModalOpen(true)
  }

  const handleSaveVersionConfirm = (data: { title: string; changeNote: string; source: string }) => {
    setCurrentVersion(currentVersion + 1)
    setDraftStatus('ready_to_save')
    setSaveVersionModalOpen(false)
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 overflow-hidden">
        {/* Premium Top Bar */}
        <div className="border-b border-slate-200/50 dark:border-slate-700/50 shrink-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Resume Editor</h2>
                <div className="h-5 w-px bg-slate-300/50 dark:bg-slate-600/50"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{resumeName}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Template</span>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as TemplateType)}
                    className="bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimalist">Minimal</option>
                    <option value="creative">Creative</option>
                    <option value="elegant">Elegant</option>
                    <option value="bold">Bold</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <Button
                  size="sm"
                  onClick={handleDraftSave}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl transition-all"
                  title={user ? 'Save changes' : 'Sign in to save'}
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const element = document.getElementById('download-pdf-btn')
                    element?.click()
                  }}
                  className="gap-2 font-semibold border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-900 dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col lg:flex-row gap-8 py-8">
            {/* Left: Editor - scrollable */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-5 pb-20 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              <EditorSections onContentChange={handleEditorChange} />
            </div>

            {/* Right: Preview - fits in viewport, no scroll */}
            <div className="w-full lg:w-[48%] lg:min-w-112.5 flex flex-col gap-4 pr-2">
              <div className="flex-1 overflow-hidden">
                <ResumePreview
                  name={resumeName}
                  currentVersion={currentVersion}
                  draftStatus={draftStatus}
                  preview={preview}
                  template={template}
                  onTemplateChange={setTemplate}
                />
              </div>
            </div>
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
