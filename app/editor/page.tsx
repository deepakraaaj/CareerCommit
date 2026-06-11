'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, Plus, History, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { ResumePreview } from '@/components/editor/resume-preview'
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
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden">
        {/* Top Action Bar */}
        <div className="border-b border-border/50 shrink-0 z-20 bg-background/80 backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                onClick={handleDraftSave}
                className="gap-2"
                title={user ? 'Save changes' : 'Sign in to save'}
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col lg:flex-row gap-6 py-6">
            {/* Left: Editor - scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
              <EditorSections onContentChange={handleEditorChange} />
            </div>

            {/* Right: Preview - fits in viewport, no scroll */}
            <div className="w-full lg:w-[45%] lg:min-w-112.5 flex flex-col gap-3 pr-2">
              <div className="flex-1 overflow-hidden">
                <ResumePreview
                  name={resumeName}
                  currentVersion={currentVersion}
                  draftStatus={draftStatus}
                  preview={preview}
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
