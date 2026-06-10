'use client'

import { useState } from 'react'
import { Save, Plus, History, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { EditorSections } from '@/components/editor/editor-sections'
import { ResumePreview } from '@/components/editor/resume-preview'
import { FitChecker } from '@/components/editor/fit-checker'
import { AISuggestionModal } from '@/components/editor/ai-suggestion-modal'
import { SaveVersionModal } from '@/components/versions/save-version-modal'
import { calculateWordCount } from '@/lib/utils'
import { defaultEditorContent } from '@/lib/mock-data'

export default function Editor() {
  const [draftStatus, setDraftStatus] = useState<'unsaved' | 'draft_saved' | 'ready_to_save'>(
    'draft_saved'
  )
  const [currentVersion, setCurrentVersion] = useState(5)
  const [preview, setPreview] = useState(defaultEditorContent)
  const [saveVersionModalOpen, setSaveVersionModalOpen] = useState(false)
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean
    type: 'improve' | 'shorten' | 'fix_grammar'
    original: string
  }>({
    isOpen: false,
    type: 'improve',
    original: '',
  })

  const wordCount = calculateWordCount(preview)
  const readability = 85 // Fixed value - real ATS score only from JD Matcher analysis

  const handleEditorChange = (content: {
    name: string
    title: string
    email: string
    phone: string
    summary: string
    company: string
    position: string
    duration: string
    bullets: { id: string; text: string }[]
    education: string
    skills: string
  }) => {
    // Convert editor content to preview text format
    const previewText = `${content.name}
${content.title}
${content.email} | ${content.phone}

PROFESSIONAL SUMMARY
${content.summary}

EXPERIENCE
${content.position} | ${content.company} | ${content.duration}
${content.bullets.map((b) => `- ${b.text}`).join('\n')}

EDUCATION
${content.education}

SKILLS
${content.skills}`

    setPreview(previewText)
    setDraftStatus('unsaved')
  }

  const handleDraftSave = () => {
    setDraftStatus('draft_saved')
  }

  const handleVersionSave = () => {
    setSaveVersionModalOpen(true)
  }

  const handleSaveVersionConfirm = (data: { title: string; changeNote: string; source: string }) => {
    setCurrentVersion(currentVersion + 1)
    setDraftStatus('ready_to_save')
    setSaveVersionModalOpen(false)
  }

  const getSuggestedText = (original: string, type: string) => {
    const suggestions: Record<string, string> = {
      improve:
        original +
        ' (with measurable impact on system performance and team efficiency)',
      shorten: original.substring(0, Math.max(20, original.length - 30)) + '...',
      fix_grammar: original.replace('reducing', 'reducing'),
    }
    return suggestions[type] || original
  }

  const handleAIAction = (type: 'improve' | 'shorten' | 'fix_grammar', text: string) => {
    setAiModal({
      isOpen: true,
      type,
      original: text,
    })
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden">
        {/* Top Action Bar */}
        <div className="bg-card border-b border-border shrink-0 z-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Senior Developer Resume</h1>
                <p className="text-sm text-muted-foreground">Last edited 2 hours ago</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDraftSave}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>

                <Button
                  size="sm"
                  onClick={handleVersionSave}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Save New Version
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
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
              <FitChecker
                wordCount={wordCount}
                readability={readability}
              />

              <div className="flex-1 overflow-hidden">
                <ResumePreview
                  name="Senior Developer Resume"
                  currentVersion={currentVersion}
                  draftStatus={draftStatus}
                  preview={preview}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={aiModal.isOpen}
        originalText={aiModal.original}
        suggestedText={getSuggestedText(aiModal.original, aiModal.type)}
        actionType={aiModal.type}
        onApply={(text) => {
          console.log('Applied:', text)
        }}
        onClose={() => setAiModal({ ...aiModal, isOpen: false })}
      />

      {/* Save Version Modal */}
      <SaveVersionModal
        isOpen={saveVersionModalOpen}
        currentVersion={currentVersion}
        onClose={() => setSaveVersionModalOpen(false)}
        onSave={handleSaveVersionConfirm}
      />
    </>
  )
}
