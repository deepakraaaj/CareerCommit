'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cloud, CheckCircle2, FileText, File, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loadUploadedFiles } from '@/lib/supabase-loaders'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import { getConfidenceBadge, getConfidenceLabel } from '@/lib/utils'
import type { ExtractedResume, UploadedFile } from '@/lib/types'
import {
  extractTextFromDocument,
  mapParsedResumeToEditor,
  mapParsedResumeToExtracted,
  parseResumeWithFallback,
  type EditorResumeContent,
} from '@/lib/resume-parser-client'
import { ResumeChatbot } from '@/components/upload/resume-chatbot'

type UploadState = 'ready' | 'uploading' | 'extracting' | 'completed' | 'review_needed' | 'failed'

export default function Upload() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>('ready')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: 'PDF' | 'DOCX' } | null>(null)
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([])
  const [parsedResume, setParsedResume] = useState<ExtractedResume | null>(null)
  const [parsedEditorContent, setParsedEditorContent] = useState<EditorResumeContent | null>(null)
  const [parseSource, setParseSource] = useState<'cerebras' | null>(null)

  useEffect(() => {
    let active = true

    loadUploadedFiles().then((rows) => {
      if (active) setRecentUploads(rows)
    })

    return () => {
      active = false
    }
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      const fileName = file.name
      const fileType = fileName.endsWith('.pdf') ? 'PDF' : fileName.endsWith('.docx') ? 'DOCX' : null

      if (fileType) {
        void handleFileSelect(file)
      }
    }
  }

  const handleFileSelect = async (file: File) => {
    const type = file.name.endsWith('.pdf') ? 'PDF' : 'DOCX'
    const id = crypto.randomUUID()
    setUploadedFile({ name: file.name, size: file.size, type })
    setUploadState('uploading')
    setParsedResume(null)
    setParsedEditorContent(null)
    setParseSource(null)
    setRecentUploads((current) => [
      {
        id,
        name: file.name,
        type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
      },
      ...current,
    ])

    void supabasePlaceholder.uploadFile({
      id,
      user_id: null,
      filename: file.name,
      file_type: type,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    })

    try {
      setUploadState('extracting')
      const extractedText = await extractTextFromDocument(file)
      const { parsed, source } = await parseResumeWithFallback(extractedText)
      const extracted = mapParsedResumeToExtracted(parsed)
      const editorContent = mapParsedResumeToEditor(parsed)

      setParseSource(source)
      setParsedResume(extracted)
      setParsedEditorContent(editorContent)
      setUploadState(extracted.confidence === 'high' ? 'completed' : 'review_needed')
      setRecentUploads((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                status: 'completed',
              }
            : entry
        )
      )
    } catch (error) {
      console.error('[Upload] Parsing failed:', error)
      setUploadState('failed')
      setRecentUploads((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                status: 'failed',
              }
            : entry
        )
      )
    }
  }

  const handleReviewClick = () => {
    setUploadState('review_needed')
  }

  const handleLoadToEditor = () => {
    if (parsedEditorContent) {
      localStorage.setItem('career-commit-editor-state', JSON.stringify(parsedEditorContent))
      localStorage.setItem('career-commit-resume-id', crypto.randomUUID())
    }
    router.push('/editor')
  }

  const resumeChatContext = parsedEditorContent
    ? JSON.stringify(parsedEditorContent, null, 2)
    : parsedResume
      ? JSON.stringify(parsedResume, null, 2)
      : ''

  const getStatusMessage = (state: UploadState) => {
    switch (state) {
      case 'ready':
        return 'Ready to upload'
      case 'uploading':
        return 'Uploading file...'
      case 'extracting':
        return 'Extracting content...'
      case 'completed':
        return 'Extraction completed'
      case 'review_needed':
        return 'Review extracted content'
      case 'failed':
        return 'Extraction failed'
      default:
        return ''
    }
  }

  if (uploadState === 'ready' || uploadState === 'failed') {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="absolute inset-0 -z-10 premium-grid opacity-25" />
          <div className="absolute left-[-8rem] top-20 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-6rem] top-40 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
              <h1 className="text-5xl font-semibold tracking-tight mb-2">Upload Resume</h1>
              <p className="text-lg text-muted-foreground">
                Import your resume and we&apos;ll extract the content into an editable format.
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`premium-shell p-12 border-2 border-dashed transition-all ${
                dragActive
                  ? 'border-primary bg-primary/10 border-solid'
                  : 'border-border/50 hover:border-primary/50 hover:bg-card/60'
              }`}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <Cloud className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h2 className="text-xl font-semibold mb-1">Drag and drop your resume</h2>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                </div>

                <Button size="lg" onClick={() => document.getElementById('file-input')?.click()}>
                  Select File
                </Button>

                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFileSelect(file)
                  }}
                />

                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: PDF, DOCX (up to 5 MB)
                </p>
              </div>
            </div>

            <div className="premium-chip mt-12 p-4 inline-flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">💡 Smart Extraction:</span> CareerCommit extracts your content and rebuilds it into an editable format. Original files stay untouched.
              </p>
            </div>

            {recentUploads.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6">Recently Uploaded</h3>
                <div className="grid gap-3">
                  {recentUploads.map((file) => (
                    <div key={file.id} className="card-premium p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/60">
                          {file.type === 'PDF' ? (
                            <FileText className="w-6 h-6 text-red-500" />
                          ) : (
                            <File className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{file.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.type} • {(file.size / 1024).toFixed(0)} KB • {file.uploadedAt.split('T')[0]}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLoadToEditor}>
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  if (uploadState === 'uploading' || uploadState === 'extracting') {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="absolute inset-0 -z-10 premium-grid opacity-20" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="premium-shell p-12">
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-primary animate-spin relative" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-semibold mb-2">{getStatusMessage(uploadState)}</h2>
                  <p className="text-base text-muted-foreground">
                    {uploadState === 'uploading'
                      ? `Processing ${uploadedFile?.name}...`
                      : 'Analyzing your resume content...'}
                  </p>
                </div>
                <div className="w-full max-w-xs bg-background/60 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: uploadState === 'uploading' ? '40%' : '80%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (uploadState === 'completed' || uploadState === 'review_needed') {
    const extracted = parsedResume ?? {
      name: uploadedFile ? uploadedFile.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') : null,
      role: null,
      email: null,
      phone: null,
      location: null,
      skills: [],
      experience: [],
      projects: [],
      education: [],
      confidence: 'missing' as const,
    }

    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="absolute inset-0 -z-10 premium-grid opacity-25" />
          <div className="absolute left-[-8rem] top-20 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-[-6rem] top-40 -z-10 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight">Extraction Completed</h1>
                  <p className="text-muted-foreground mt-2">
                    Review the extracted information below. Confidence badges show extraction reliability.
                  </p>
                  {parseSource && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5" />
                      Parsed with Cerebras AI
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Header Info */}
                <div className="premium-shell p-7">
                  <h3 className="text-lg font-semibold mb-4">Header Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
                        <p className="font-medium">{extracted.name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge('high')}`}>
                        {getConfidenceLabel('high')}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Professional Title</p>
                        <p className="font-medium">{extracted.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge('high')}`}>
                        {getConfidenceLabel('high')}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Contact Information</p>
                      <div className="space-y-1 text-sm">
                        <p>{extracted.email}</p>
                        <p>{extracted.phone}</p>
                        <p>{extracted.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="premium-shell p-7">
                  <h3 className="text-lg font-semibold mb-4">
                    Experience ({extracted.experience.length})
                  </h3>
                  <div className="space-y-4">
                    {extracted.experience.map((exp, idx) => (
                      <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{exp.position}</p>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge(exp.confidence)}`}
                          >
                            {getConfidenceLabel(exp.confidence)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{exp.duration}</p>
                        <p className="text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {extracted.projects.length > 0 && (
                  <div className="premium-shell p-7">
                    <h3 className="text-lg font-semibold mb-4">Projects ({extracted.projects.length})</h3>
                    <div className="space-y-3">
                      {extracted.projects.map((proj, idx) => (
                        <div key={idx} className="pb-3 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm">{proj.name}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge(proj.confidence)}`}
                            >
                              {getConfidenceLabel(proj.confidence)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {extracted.education.length > 0 && (
                  <div className="premium-shell p-7">
                    <h3 className="text-lg font-semibold mb-4">Education</h3>
                    <div className="space-y-3">
                      {extracted.education.map((edu, idx) => (
                        <div key={idx} className="pb-3 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{edu.degree}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge(edu.confidence)}`}
                            >
                              {getConfidenceLabel(edu.confidence)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                          {edu.field && <p className="text-sm text-muted-foreground">{edu.field}</p>}
                          {edu.graduation && <p className="text-xs text-muted-foreground">Graduated: {edu.graduation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                <div className="premium-shell p-7">
                  <h3 className="text-lg font-semibold mb-4">Extraction Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Skills Found</p>
                      <p className="font-semibold text-lg">{extracted.skills.length}</p>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-muted-foreground mb-1">Experience Entries</p>
                      <p className="font-semibold text-lg">{extracted.experience.length}</p>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-muted-foreground mb-1">Education Entries</p>
                      <p className="font-semibold text-lg">{extracted.education.length}</p>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-muted-foreground mb-1">Overall Confidence</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge('high')}`}>
                        {getConfidenceLabel('high')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="premium-shell p-7">
                  <h3 className="text-lg font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {extracted.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleLoadToEditor}
                    disabled={!parsedEditorContent}
                  >
                    Load into Editor
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleReviewClick}
                  >
                    Review Extracted Content
                  </Button>
                </div>

                {resumeChatContext && (
                  <div className="mt-6">
                    <ResumeChatbot
                      context={resumeChatContext}
                      sourceLabel="Cerebras"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}
