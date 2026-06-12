'use client'

import { useEffect, useState } from 'react'
import { ExportOptions } from '@/components/export/export-options'
import { FormatComparison } from '@/components/export/format-comparison'
import { parseResume } from '@/components/editor/resume-preview'
import { loadResumes } from '@/lib/supabase-loaders'
import type { Resume } from '@/lib/types'

export default function Export() {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | null>(null)
  const [exported, setExported] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')

  useEffect(() => {
    let active = true

    loadResumes().then((rows) => {
      if (!active) return
      setResumes(rows)
      if (rows[0]) setSelectedResumeId(String(rows[0].id))
    })

    return () => {
      active = false
    }
  }, [])

  const selectedResume = resumes.find((resume) => String(resume.id) === selectedResumeId) ?? resumes[0]

  const handleExport = async (format: 'pdf' | 'docx') => {
    setSelectedFormat(format)

    if (format === 'pdf') {
      const parsed = parseResume(selectedResume?.contentText || '')
      const [{ pdf }, { ResumePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/editor/resume-pdf'),
      ])

      const blob = await pdf(<ResumePDF parsed={parsed} template="modern" />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedResume?.name || parsed.name || 'resume'}.pdf`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Export Resume</h1>
            <p className="text-muted-foreground">
              Download your resume in your preferred format, optimized for ATS systems.
            </p>
          </div>

          <div className="card-premium p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Select Resume</h2>
            <select
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.length > 0 ? (
                resumes.map((resume) => (
                  <option key={resume.id} value={String(resume.id)}>
                    {resume.name}
                    {resume.versions ? ` (${resume.versions} versions)` : ''}
                  </option>
                ))
              ) : (
                <option value="">No saved resumes found</option>
              )}
            </select>
          </div>

          <ExportOptions selectedFormat={selectedFormat} onExport={handleExport} />

          {exported && (
            <div className="card-premium p-6 mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <p className="text-green-700 dark:text-green-400 font-medium">
                {selectedFormat === 'pdf'
                  ? 'Resume exported as PDF and downloaded!'
                  : 'DOCX export is coming soon — try PDF for now.'}
              </p>
            </div>
          )}

          <FormatComparison />

          <div className="space-y-4 mt-8">
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Before You Submit</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Preview your exported resume to ensure formatting is correct</li>
                <li>Check that all text is readable and properly formatted</li>
                <li>Use PDF for most online applications</li>
                <li>Use DOCX if the employer specifically requests Word format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
