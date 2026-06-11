'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ResumePreviewProps {
  name: string
  currentVersion: number
  draftStatus: 'unsaved' | 'draft_saved' | 'ready_to_save'
  preview: string
}

export type TemplateType =
  | 'modern'
  | 'classic'
  | 'minimalist'
  | 'creative'
  | 'elegant'
  | 'bold'
  | 'technical'

export type Block =
  | { kind: 'bullet'; text: string }
  | { kind: 'entry'; primary: string; middle: string[]; date: string | null }
  | { kind: 'labeled'; label: string; text: string }
  | { kind: 'para'; text: string }

interface ParsedSection {
  heading: string
  blocks: Block[]
}

export interface ParsedResume {
  name: string | null
  role: string | null
  contacts: string[]
  intro: Block[]
  sections: ParsedSection[]
  lineCount: number
  isEmpty: boolean
}

const CONTACT_RE =
  /@|linkedin|github|portfolio|\bwww\.|https?:\/\/|\+?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/i
const DATE_RE = /\d{4}|present|current/i
const SECTION_WORDS_RE =
  /SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS?|CERTIFICATIONS?|OBJECTIVE|ACHIEVEMENTS?|AWARDS|LANGUAGES|INTERESTS|PROFILE|WORK|EMPLOYMENT|VOLUNTEER|PUBLICATIONS|REFERENCES/

function isUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function formatContactLabel(value: string) {
  if (/linkedin/i.test(value)) return 'LinkedIn'
  if (/github/i.test(value)) return 'GitHub'
  return value
}

function isSectionHeading(line: string): boolean {
  return (
    line === line.toUpperCase() &&
    /[A-Z]/.test(line) &&
    line.length >= 2 &&
    line.length <= 60 &&
    !/^[-•*–]/.test(line) &&
    !CONTACT_RE.test(line)
  )
}

function parseBlock(line: string): Block {
  if (/^[-•*–]\s*/.test(line)) {
    return { kind: 'bullet', text: line.replace(/^[-•*–]\s*/, '') }
  }

  if (line.includes('|')) {
    const parts = line
      .split('|')
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length >= 2) {
      const last = parts[parts.length - 1]
      const hasDate = DATE_RE.test(last) && parts.length > 1
      return {
        kind: 'entry',
        primary: parts[0],
        middle: hasDate ? parts.slice(1, -1) : parts.slice(1),
        date: hasDate ? last : null,
      }
    }
  }

  const labeled = line.match(/^([A-Za-z][A-Za-z &/]{1,28}):\s+(.+)$/)
  if (labeled) {
    return { kind: 'labeled', label: labeled[1], text: labeled[2] }
  }

  return { kind: 'para', text: line }
}

export function parseResume(text: string): ParsedResume {
  const lines = text.split('\n').map((l) => l.trim())
  const nonEmpty = lines.filter(Boolean)

  const result: ParsedResume = {
    name: null,
    role: null,
    contacts: [],
    intro: [],
    sections: [],
    lineCount: nonEmpty.length,
    isEmpty: nonEmpty.length === 0,
  }

  let currentSection: ParsedSection | null = null
  let inHeaderZone = true

  for (const line of lines) {
    if (!line) continue

    if (isSectionHeading(line) && (!inHeaderZone || result.name || SECTION_WORDS_RE.test(line))) {
      currentSection = { heading: line, blocks: [] }
      result.sections.push(currentSection)
      inHeaderZone = false
      continue
    }

    if (inHeaderZone) {
      if (CONTACT_RE.test(line) && result.name) {
        result.contacts.push(
          ...line
            .split('|')
            .map((p) => p.trim())
            .filter(Boolean)
        )
      } else if (!result.name) {
        result.name = line
      } else if (!result.role) {
        result.role = line
      } else {
        result.intro.push(parseBlock(line))
      }
      continue
    }

    const block = parseBlock(line)
    if (currentSection) {
      currentSection.blocks.push(block)
    } else {
      result.intro.push(block)
    }
  }

  return result
}

type Density = 'airy' | 'normal' | 'compact'

interface TemplateStyle {
  page: string
  headerWrap: string
  name: string
  role: string
  contactWrap: string
  contactSep: string
  heading: string
  headingPrefix?: string
  entryPrimary: string
  entryMiddle: string
  entryDate: string
  bulletMarker: string
  para: string
  label: string
  /** Tailwind classes for a thin accent bar along the left edge of the page */
  sidebar?: string
}

const TEMPLATE_STYLES: Record<TemplateType, TemplateStyle> = {
  modern: {
    page: 'font-sans text-gray-800',
    headerWrap: 'pb-3 border-b-2 border-blue-700',
    name: 'font-extrabold tracking-tight text-gray-900 leading-tight',
    role: 'font-semibold text-blue-700 mt-0.5',
    contactWrap: 'text-gray-500 mt-1.5',
    contactSep: 'mx-1.5 text-gray-300',
    heading:
      'font-bold uppercase tracking-[0.16em] text-blue-800 border-b border-blue-200 pb-1',
    entryPrimary: 'font-bold text-gray-900',
    entryMiddle: 'text-gray-600',
    entryDate: 'text-gray-500',
    bulletMarker: 'text-blue-600',
    para: 'text-gray-700',
    label: 'font-semibold text-gray-900',
  },
  classic: {
    page: 'font-serif text-gray-800',
    headerWrap: 'text-center pb-3 border-b border-gray-700',
    name: 'font-bold tracking-wide text-gray-900 leading-tight',
    role: 'italic text-gray-700 mt-0.5',
    contactWrap: 'text-gray-600 mt-1.5',
    contactSep: 'mx-1.5 text-gray-400',
    heading:
      'font-bold uppercase tracking-[0.12em] text-gray-900 border-b border-gray-400 pb-0.5',
    entryPrimary: 'font-bold text-gray-900',
    entryMiddle: 'text-gray-700',
    entryDate: 'italic text-gray-600',
    bulletMarker: 'text-gray-800',
    para: 'text-gray-800',
    label: 'font-bold text-gray-900',
  },
  minimalist: {
    page: 'font-sans text-gray-700',
    headerWrap: 'pb-2',
    name: 'font-medium tracking-[0.06em] text-gray-900 leading-tight',
    role: 'uppercase tracking-[0.22em] text-gray-400 font-medium mt-1',
    contactWrap: 'text-gray-400 mt-1.5',
    contactSep: 'mx-2 text-gray-200',
    heading: 'font-semibold uppercase tracking-[0.22em] text-gray-400',
    entryPrimary: 'font-medium text-gray-900',
    entryMiddle: 'text-gray-500',
    entryDate: 'text-gray-400',
    bulletMarker: 'text-gray-300',
    para: 'text-gray-600',
    label: 'font-medium text-gray-900',
  },
  creative: {
    page: 'font-sans text-gray-800',
    headerWrap: 'pb-3',
    name: 'font-extrabold tracking-tight text-blue-700 leading-tight',
    role: 'font-medium text-gray-600 mt-0.5',
    contactWrap: 'text-gray-500 mt-2',
    contactSep: 'mx-1.5 text-blue-200',
    heading: 'font-extrabold uppercase tracking-[0.1em] text-blue-600',
    entryPrimary: 'font-bold text-gray-900',
    entryMiddle: 'text-gray-600',
    entryDate: 'font-medium text-blue-600',
    bulletMarker: 'text-blue-500',
    para: 'text-gray-700',
    label: 'font-semibold text-blue-700',
    sidebar: 'bg-linear-to-b from-blue-600 to-violet-600',
  },
  elegant: {
    page: 'font-serif text-gray-800',
    headerWrap: 'text-center pb-4 border-b border-amber-300',
    name: 'font-bold tracking-[0.04em] text-gray-900 leading-tight',
    role: 'italic text-amber-700 mt-1',
    contactWrap: 'text-gray-500 mt-2',
    contactSep: 'mx-2 text-amber-200',
    heading: 'font-semibold uppercase tracking-[0.24em] text-gray-800 border-b border-amber-200 pb-1',
    entryPrimary: 'font-semibold text-gray-900',
    entryMiddle: 'text-gray-600',
    entryDate: 'italic text-amber-700',
    bulletMarker: 'text-amber-500',
    para: 'text-gray-700',
    label: 'font-semibold text-gray-900',
  },
  bold: {
    page: 'font-sans text-gray-800',
    headerWrap: 'pb-3 border-b-4 border-emerald-600',
    name: 'font-black tracking-tight text-gray-900 leading-tight',
    role: 'font-bold uppercase tracking-[0.14em] text-emerald-600 mt-1',
    contactWrap: 'text-gray-500 mt-1.5',
    contactSep: 'mx-1.5 text-emerald-200',
    heading: 'font-extrabold uppercase tracking-[0.14em] text-emerald-700 border-b-2 border-emerald-500 pb-1',
    entryPrimary: 'font-bold text-gray-900',
    entryMiddle: 'text-gray-600',
    entryDate: 'font-bold text-emerald-700',
    bulletMarker: 'text-emerald-600',
    para: 'text-gray-700',
    label: 'font-bold text-gray-900',
    sidebar: 'bg-linear-to-b from-emerald-500 to-emerald-600',
  },
  technical: {
    page: 'font-mono text-slate-700',
    headerWrap: 'pb-3 border-b border-slate-300',
    name: 'font-bold tracking-tight text-slate-900 leading-tight',
    role: 'text-teal-600 font-medium mt-0.5',
    contactWrap: 'text-slate-500 mt-1.5',
    contactSep: 'mx-1.5 text-slate-300',
    heading: 'font-semibold uppercase tracking-[0.1em] text-slate-700 border-b border-slate-200 pb-1',
    headingPrefix: '// ',
    entryPrimary: 'font-semibold text-slate-900',
    entryMiddle: 'text-slate-500',
    entryDate: 'text-teal-600',
    bulletMarker: 'text-teal-500',
    para: 'text-slate-600',
    label: 'font-semibold text-slate-900',
  },
}

const DENSITY: Record<
  Density,
  { name: string; role: string; contact: string; heading: string; body: string; sectionGap: string; blockGap: string; padding: string }
> = {
  airy: {
    name: 'text-[28px]',
    role: 'text-[13px]',
    contact: 'text-[11px]',
    heading: 'text-[11px]',
    body: 'text-[12px] leading-[1.7]',
    sectionGap: 'space-y-6',
    blockGap: 'space-y-2',
    padding: 'p-10',
  },
  normal: {
    name: 'text-[24px]',
    role: 'text-[12.5px]',
    contact: 'text-[10.5px]',
    heading: 'text-[10.5px]',
    body: 'text-[11.5px] leading-[1.55]',
    sectionGap: 'space-y-5',
    blockGap: 'space-y-1.5',
    padding: 'p-9',
  },
  compact: {
    name: 'text-[21px]',
    role: 'text-[12px]',
    contact: 'text-[10px]',
    heading: 'text-[10px]',
    body: 'text-[10.5px] leading-[1.45]',
    sectionGap: 'space-y-4',
    blockGap: 'space-y-1',
    padding: 'p-8',
  },
}

function BlockView({
  block,
  style,
  body,
}: {
  block: Block
  style: TemplateStyle
  body: string
}) {
  switch (block.kind) {
    case 'bullet':
      return (
        <div className={`flex items-start gap-2 pl-1 ${body}`}>
          <span className={`shrink-0 ${style.bulletMarker}`}>•</span>
          <span className={style.para}>{block.text}</span>
        </div>
      )
    case 'entry':
      return (
        <div className={`flex items-baseline justify-between gap-3 ${body}`}>
          <span className="min-w-0">
            <span className={style.entryPrimary}>{block.primary}</span>
            {block.middle.length > 0 && (
              <span className={style.entryMiddle}>
                {' '}
                · {block.middle.join(' · ')}
              </span>
            )}
          </span>
          {block.date && (
            <span className={`shrink-0 whitespace-nowrap ${style.entryDate}`}>
              {block.date}
            </span>
          )}
        </div>
      )
    case 'labeled':
      return (
        <div className={body}>
          <span className={style.label}>{block.label}: </span>
          <span className={style.para}>{block.text}</span>
        </div>
      )
    case 'para':
      return <p className={`${body} ${style.para}`}>{block.text}</p>
  }
}

// A4 page size in CSS px at 96dpi, matching the @react-pdf/renderer output
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-10">
      <div className="w-full max-w-55 space-y-2.5" aria-hidden>
        <div className="h-3.5 w-2/5 rounded bg-gray-100" />
        <div className="h-2 w-3/5 rounded bg-gray-100" />
        <div className="h-px w-full bg-gray-100 mt-4!" />
        <div className="h-2 w-1/4 rounded bg-gray-100 mt-4!" />
        <div className="h-2 w-full rounded bg-gray-50" />
        <div className="h-2 w-5/6 rounded bg-gray-50" />
        <div className="h-2 w-1/4 rounded bg-gray-100 mt-4!" />
        <div className="h-2 w-full rounded bg-gray-50" />
        <div className="h-2 w-4/6 rounded bg-gray-50" />
      </div>
      <p className="text-xs text-gray-400 text-center">
        Start writing in the editor — your resume takes shape here.
      </p>
    </div>
  )
}

function ResumeContent({
  parsed,
  template,
}: {
  parsed: ParsedResume
  template: TemplateType
}) {
  const style = TEMPLATE_STYLES[template]
  const density: Density =
    parsed.lineCount <= 20 ? 'airy' : parsed.lineCount <= 45 ? 'normal' : 'compact'
  const d = DENSITY[density]

  return (
    <div
      className={`${d.padding} ${style.page} ${style.sidebar ? 'pl-10' : ''}`}
      style={{ width: A4_WIDTH_PX }}
    >
      <div className={d.sectionGap}>
        {/* Header */}
        {(parsed.name || parsed.role || parsed.contacts.length > 0) && (
          <header className={style.headerWrap}>
            {parsed.name && <div className={`${d.name} ${style.name}`}>{parsed.name}</div>}
            {parsed.role && <div className={`${d.role} ${style.role}`}>{parsed.role}</div>}
            {parsed.contacts.length > 0 && (
              <div className={`${d.contact} ${style.contactWrap}`}>
                {parsed.contacts.map((c, i) => (
                  <span key={i}>
                    {i > 0 && <span className={style.contactSep}>·</span>}
                    {isUrl(c) ? (
                      <a
                        href={c}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:opacity-80"
                      >
                        {formatContactLabel(c)}
                      </a>
                    ) : (
                      c
                    )}
                  </span>
                ))}
              </div>
            )}
          </header>
        )}

        {/* Intro */}
        {parsed.intro.length > 0 && (
          <div className={d.blockGap}>
            {parsed.intro.map((block, i) => (
              <BlockView key={i} block={block} style={style} body={d.body} />
            ))}
          </div>
        )}

        {/* Sections with page break handling */}
        {parsed.sections.map((section, i) => (
          <section key={i} className="break-inside-avoid">
            <h4 className={`${d.heading} ${style.heading} mb-2`}>
              {style.headingPrefix}
              {section.heading}
            </h4>
            {section.blocks.length > 0 ? (
              <div className={d.blockGap}>
                {section.blocks.map((block, j) => (
                  <BlockView key={j} block={block} style={style} body={d.body} />
                ))}
              </div>
            ) : (
              <p className={`${d.body} italic text-gray-300 select-none`}>Nothing here yet</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function PageFrame({
  index,
  scale,
  template,
  children,
}: {
  index: number
  scale: number
  template: TemplateType
  children: React.ReactNode
}) {
  const style = TEMPLATE_STYLES[template]

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-sm bg-white shadow-md"
      style={{ width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }}
    >
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {style.sidebar && (
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.sidebar}`} />
        )}
        <div style={{ marginTop: -index * A4_HEIGHT_PX }}>{children}</div>
      </div>
    </div>
  )
}

function PaginatedResume({
  parsed,
  template,
}: {
  parsed: ParsedResume
  template: TemplateType
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.clientWidth / A4_WIDTH_PX)
      }
      if (measureRef.current) {
        setPageCount(Math.max(1, Math.ceil(measureRef.current.scrollHeight / A4_HEIGHT_PX)))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    if (measureRef.current) ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [parsed, template])

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 py-4">
      {/* Off-screen copy used only to measure the full content height */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: -10000,
          width: A4_WIDTH_PX,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {!parsed.isEmpty && <ResumeContent parsed={parsed} template={template} />}
      </div>

      {parsed.isEmpty ? (
        <PageFrame index={0} scale={scale} template={template}>
          <EmptyState />
        </PageFrame>
      ) : (
        Array.from({ length: pageCount }).map((_, i) => (
          <PageFrame key={i} index={i} scale={scale} template={template}>
            <ResumeContent parsed={parsed} template={template} />
          </PageFrame>
        ))
      )}
    </div>
  )
}

export function ResumePreview({
  name,
  currentVersion,
  draftStatus,
  preview,
}: ResumePreviewProps) {
  const [template, setTemplate] = useState<TemplateType>('modern')
  const parsed = useMemo(() => parseResume(preview), [preview])

  const handleDownloadPDF = async () => {
    if (parsed.isEmpty) return

    const [{ pdf }, { ResumePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./resume-pdf'),
    ])

    const blob = await pdf(<ResumePDF parsed={parsed} template={template} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${parsed.name || 'resume'}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDraftBadgeColor = () => {
    switch (draftStatus) {
      case 'unsaved':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'draft_saved':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'ready_to_save':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    }
  }

  const getDraftLabel = () => {
    switch (draftStatus) {
      case 'unsaved':
        return 'Unsaved changes'
      case 'draft_saved':
        return 'Draft saved locally'
      case 'ready_to_save':
        return 'Ready to save version'
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <button
        id="download-pdf-btn"
        onClick={handleDownloadPDF}
        style={{ display: 'none' }}
      >
        Download
      </button>
      <div className="flex items-center justify-center gap-3 shrink-0">
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as TemplateType)}
          className="h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

      <div className="flex-1 min-h-0 rounded-lg border border-border shadow-sm bg-muted overflow-y-auto">
        <PaginatedResume parsed={parsed} template={template} />
      </div>
    </div>
  )
}
