'use client'

import {
  normalizeParsedResume,
  toEditorResumeContent,
  toExtractedResume,
  type ParsedResumeDocument,
} from '@/lib/resume-parser-shared'

async function extractPdfText(file: File) {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs')
  const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .filter(Boolean)
      .join(' ')
    if (text.trim()) pages.push(text.trim())
  }

  return pages.join('\n\n')
}

async function extractDocxText(file: File) {
  const mammoth = await import('mammoth/mammoth.browser')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value || ''
}

export async function extractTextFromDocument(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()

  try {
    if (ext === 'pdf' || file.type === 'application/pdf') {
      return await extractPdfText(file)
    }

    if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractDocxText(file)
    }

    return await file.text()
  } catch (error) {
    console.error('[Parser] Failed to extract text:', error)
    return file.name
  }
}

export async function parseResumeWithFallback(text: string): Promise<{
  parsed: ParsedResumeDocument
  source: 'cerebras' | 'local' | 'local-fallback'
  debug?: any
}> {
  console.log('[Parse] Starting with text length:', text.length)
  console.log('[Parse] Text preview:', text.substring(0, 300))

  // Get API key from localStorage if available
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('cerebras-api-key') : null

  const response = await fetch('/api/ai/parse-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, apiKey }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Parse request failed')
  }

  const result = await response.json()
  console.log('[Parse] Result source:', result.source)
  console.log('[Parse] Parsed data:', result.data)
  if (result.debug) console.log('[Parse] Debug info:', result.debug)

  return {
    parsed: normalizeParsedResume(result.data),
    source: result.source,
    debug: result.debug,
  }
}

export function mapParsedResumeToExtracted(parsed: ParsedResumeDocument) {
  return toExtractedResume(parsed)
}

export function mapParsedResumeToEditor(parsed: ParsedResumeDocument) {
  return toEditorResumeContent(parsed)
}
