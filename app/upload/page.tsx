'use client'

import { useState } from 'react'
import { Cloud, CheckCircle2, AlertCircle, FileText, File, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { mockExtractedResume, mockUploadedFiles } from '@/lib/mock-data'
import { getConfidenceBadge, getConfidenceLabel } from '@/lib/utils'

type UploadState = 'ready' | 'uploading' | 'extracting' | 'completed' | 'review_needed' | 'failed'

export default function Upload() {
  const [uploadState, setUploadState] = useState<UploadState>('ready')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: 'PDF' | 'DOCX' } | null>(null)

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
        handleFileSelect(file.name, fileType)
      }
    }
  }

  const handleFileSelect = (name: string, type: 'PDF' | 'DOCX') => {
    setUploadedFile({ name, size: 245000, type })
    setUploadState('uploading')

    setTimeout(() => {
      setUploadState('extracting')
    }, 1500)

    setTimeout(() => {
      setUploadState('completed')
    }, 3000)
  }

  const handleReviewClick = () => {
    setUploadState('review_needed')
  }

  const handleLoadToEditor = () => {
    window.location.href = '/editor'
  }

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
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-2">Upload Resume</h1>
              <p className="text-muted-foreground">
                Import your resume and we&apos;ll extract the content into an editable format.
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`card-premium p-12 border-2 border-dashed transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
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
                    if (file) {
                      const type = file.name.endsWith('.pdf') ? 'PDF' : 'DOCX'
                      handleFileSelect(file.name, type)
                    }
                  }}
                />

                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: PDF, DOCX (up to 5 MB)
                </p>
              </div>
            </div>

            <div className="card-premium p-6 mt-12 bg-secondary">
              <p className="text-sm text-muted-foreground">
                CareerCommit extracts your resume content and rebuilds it into a clean editable format.
                It does not edit the original PDF/DOCX directly.
              </p>
            </div>

            {mockUploadedFiles.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">Recently Uploaded</h3>
                <div className="space-y-2">
                  {mockUploadedFiles.map((file) => (
                    <div key={file.id} className="card-premium p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {file.type === 'PDF' ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.type} • {(file.size / 1024).toFixed(0)} KB • {file.uploadedAt.split('T')[0]}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
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
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="card-premium p-8">
              <div className="flex flex-col items-center gap-6 py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">{getStatusMessage(uploadState)}</h2>
                  <p className="text-sm text-muted-foreground">
                    {uploadState === 'uploading'
                      ? `Processing ${uploadedFile?.name}...`
                      : 'Analyzing your resume content...'}
                  </p>
                </div>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all duration-500"
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
    const extracted = mockExtractedResume

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-3xl font-bold">Extraction Completed</h1>
                  <p className="text-muted-foreground mt-1">
                    Review the extracted information below. Confidence badges show extraction reliability.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Header Info */}
                <div className="card-premium p-6">
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
                <div className="card-premium p-6">
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
                  <div className="card-premium p-6">
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
                  <div className="card-premium p-6">
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
                <div className="card-premium p-6">
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

                <div className="card-premium p-6">
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
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}
