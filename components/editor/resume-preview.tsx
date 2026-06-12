'use client'

import { useLayoutEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { Eye, ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react'

interface ResumePreviewProps {
  name: string
  currentVersion: number
  draftStatus: 'unsaved' | 'draft_saved' | 'ready_to_save'
  preview: string
  template: TemplateType
  onTemplateChange: (template: TemplateType) => void
  accentColor?: string
  density?: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily?: 'sans' | 'serif' | 'mono'
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
  | { kind: 'entry-right'; primary: string; middle: string[]; right: string }
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
const PROJECTS_SECTION_RE = /^PROJECTS?$/i

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

function parseBlock(line: string, currentSectionHeading?: string): Block {
  if (/^[-•*–]\s*/.test(line)) {
    return { kind: 'bullet', text: line.replace(/^[-•*–]\s*/, '') }
  }

  if (line.includes('|')) {
    const parts = line
      .split('|')
      .map((p) => p.trim())
    if (parts[0]) {
      const isProjectsSection = !!currentSectionHeading && PROJECTS_SECTION_RE.test(currentSectionHeading)
      if (isProjectsSection && parts.length >= 3) {
        return {
          kind: 'entry-right',
          primary: parts[0],
          middle: parts.slice(1, -1).filter(Boolean),
          right: parts[parts.length - 1],
        }
      }
      const last = parts[parts.length - 1]
      const hasDate = DATE_RE.test(last) && parts.length > 1
      return {
        kind: 'entry',
        primary: parts[0],
        middle: hasDate ? parts.slice(1, -1).filter(Boolean) : parts.slice(1).filter(Boolean),
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
    lineCount: nonEmpty.reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 85)), 0),
    isEmpty: nonEmpty.length === 0,
  }

  let currentSection: ParsedSection | null = null
  let inHeaderZone = true

  for (const line of lines) {
    if (!line) continue

    if (isSectionHeading(line) && SECTION_WORDS_RE.test(line)) {
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
    const sectionBlock = currentSection ? parseBlock(line, currentSection.heading) : block
    if (currentSection) {
      currentSection.blocks.push(sectionBlock)
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
  sidebar?: string
}

export const ACCENT_COLORS = {
  blue: {
    text: 'text-blue-600',
    textDark: 'text-blue-800',
    textLight: 'text-blue-500',
    border: 'border-blue-600',
    borderLight: 'border-blue-200',
    bullet: 'text-blue-600',
    sidebar: 'bg-gradient-to-b from-blue-600 to-indigo-600',
  },
  indigo: {
    text: 'text-indigo-600',
    textDark: 'text-indigo-800',
    textLight: 'text-indigo-500',
    border: 'border-indigo-600',
    borderLight: 'border-indigo-200',
    bullet: 'text-indigo-600',
    sidebar: 'bg-gradient-to-b from-indigo-600 to-violet-600',
  },
  emerald: {
    text: 'text-emerald-600',
    textDark: 'text-emerald-800',
    textLight: 'text-emerald-500',
    border: 'border-emerald-600',
    borderLight: 'border-emerald-200',
    bullet: 'text-emerald-600',
    sidebar: 'bg-gradient-to-b from-emerald-500 to-teal-600',
  },
  amber: {
    text: 'text-amber-600',
    textDark: 'text-amber-800',
    textLight: 'text-amber-500',
    border: 'border-amber-600',
    borderLight: 'border-amber-200',
    bullet: 'text-amber-600',
    sidebar: 'bg-gradient-to-b from-amber-500 to-orange-500',
  },
  rose: {
    text: 'text-rose-600',
    textDark: 'text-rose-800',
    textLight: 'text-rose-500',
    border: 'border-rose-600',
    borderLight: 'border-rose-200',
    bullet: 'text-rose-600',
    sidebar: 'bg-gradient-to-b from-rose-500 to-pink-600',
  },
  violet: {
    text: 'text-violet-600',
    textDark: 'text-violet-800',
    textLight: 'text-violet-500',
    border: 'border-violet-600',
    borderLight: 'border-violet-200',
    bullet: 'text-violet-600',
    sidebar: 'bg-gradient-to-b from-violet-600 to-purple-600',
  },
  slate: {
    text: 'text-slate-700',
    textDark: 'text-slate-900',
    textLight: 'text-slate-600',
    border: 'border-slate-700',
    borderLight: 'border-slate-300',
    bullet: 'text-slate-700',
    sidebar: 'bg-gradient-to-b from-slate-700 to-slate-900',
  },
}

const TEMPLATE_STYLES: Record<TemplateType, TemplateStyle> = {
  modern: {
    page: 'font-sans text-gray-800',
    headerWrap: 'pb-3 border-b-2 border-blue-600',
    name: 'font-extrabold tracking-tight text-gray-900 leading-tight',
    role: 'font-semibold text-blue-600 mt-0.5',
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
    name: 'font-extrabold tracking-tight text-blue-600 leading-tight',
    role: 'font-medium text-gray-600 mt-0.5',
    contactWrap: 'text-gray-500 mt-2',
    contactSep: 'mx-1.5 text-blue-200',
    heading: 'font-extrabold uppercase tracking-[0.1em] text-blue-600',
    entryPrimary: 'font-bold text-gray-900',
    entryMiddle: 'text-gray-600',
    entryDate: 'font-medium text-blue-600',
    bulletMarker: 'text-blue-500',
    para: 'text-gray-700',
    label: 'font-semibold text-blue-600',
    sidebar: 'bg-gradient-to-b from-blue-600 to-indigo-600',
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
    sidebar: 'bg-gradient-to-b from-emerald-500 to-teal-600',
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
    case 'entry-right':
      return (
        <div className={`${body} space-y-0.5`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className={style.entryPrimary}>{block.primary}</span>
            </span>
            <span className={`shrink-0 whitespace-nowrap italic ${style.entryDate}`}>
              {block.right}
            </span>
          </div>
          {block.middle.length > 0 && (
            <div className={style.entryMiddle}>
              {block.middle.join(' · ')}
            </div>
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

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-100 text-center">
      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-2" />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview will appear here</p>
      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Start filling in your information on the left to see it beautifully rendered.</p>
    </div>
  )
}

function BlockWrapper({
  blockKey,
  spacerHeight,
  children
}: {
  blockKey: string
  spacerHeight?: number
  children: ReactNode
}) {
  return (
    <div data-page-block={blockKey} className="w-full">
      {spacerHeight && spacerHeight > 0 ? (
        <div 
          className="page-spacer select-none pointer-events-none" 
          style={{ height: spacerHeight, width: '100%' }} 
        />
      ) : null}
      {children}
    </div>
  )
}

function ResumeContent({
  parsed,
  template,
  accentColor = 'blue',
  density = 'auto',
  fontFamily = 'sans',
  spacers = {},
}: {
  parsed: ParsedResume
  template: TemplateType
  accentColor?: string
  density?: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily?: 'sans' | 'serif' | 'mono'
  spacers?: Record<string, number>
}) {
  const style = useMemo(() => {
    const defaultStyle = TEMPLATE_STYLES[template]
    const accent = ACCENT_COLORS[accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.blue
    const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'

    return {
      ...defaultStyle,
      page: `${fontClass} text-gray-800`,
      headerWrap: defaultStyle.headerWrap.replace(/border-blue-600|border-gray-700|border-amber-300|border-emerald-600|border-slate-300/g, accent.border),
      role: defaultStyle.role.replace(/text-blue-600|text-gray-700|text-amber-700|text-emerald-600|text-teal-600/g, accent.text),
      heading: defaultStyle.heading
        .replace(/text-blue-800|text-gray-900|text-gray-400|text-blue-600|text-gray-800|text-emerald-700|text-slate-700/g, accent.textDark)
        .replace(/border-blue-200|border-gray-400|border-amber-200|border-emerald-500|border-slate-200/g, accent.borderLight),
      entryDate: defaultStyle.entryDate.replace(/text-blue-600|italic text-amber-700|font-bold text-emerald-700|text-teal-600|text-gray-500/g, accent.text),
      bulletMarker: accent.bullet,
      label: defaultStyle.label.replace(/text-blue-600/g, accent.text),
      sidebar: defaultStyle.sidebar ? accent.sidebar : undefined,
    }
  }, [template, accentColor, fontFamily])

  const resolvedDensity: Density = useMemo(() => {
    if (density === 'auto') {
      return parsed.lineCount <= 20 ? 'airy' : parsed.lineCount <= 45 ? 'normal' : 'compact'
    }
    return density
  }, [density, parsed.lineCount])

  const d = DENSITY[resolvedDensity]

  return (
    <div
      className={`${d.padding} ${style.page} ${style.sidebar ? 'pl-10' : ''} bg-white transition-all`}
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
            {parsed.intro.map((block, i) => {
              const blockKey = `intro-${i}`
              return (
                <BlockWrapper key={blockKey} blockKey={blockKey} spacerHeight={spacers[blockKey]}>
                  <BlockView block={block} style={style} body={d.body} />
                </BlockWrapper>
              )
            })}
          </div>
        )}

        {/* Sections */}
        {parsed.sections.map((section, i) => {
          const sectionKey = `sec-heading-${section.heading}`
          return (
            <section key={i} className="break-inside-avoid">
              <BlockWrapper blockKey={sectionKey} spacerHeight={spacers[sectionKey]}>
                <h4 className={`${d.heading} ${style.heading} mb-2`}>
                  {style.headingPrefix}
                  {section.heading}
                </h4>
              </BlockWrapper>
              {section.blocks.length > 0 ? (
                <div className={d.blockGap}>
                  {section.blocks.map((block, j) => {
                    const blockKey = `sec-block-${section.heading}-${j}`
                    return (
                      <BlockWrapper key={blockKey} blockKey={blockKey} spacerHeight={spacers[blockKey]}>
                        <BlockView block={block} style={style} body={d.body} />
                      </BlockWrapper>
                    )
                  })}
                </div>
              ) : (
                <p className={`${d.body} italic text-gray-350 select-none`}>Nothing here yet</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function PageFrame({
  index,
  totalPages,
  scale,
  template,
  accentColor,
  usableHeight,
  paddingPx,
  children,
}: {
  index: number
  totalPages: number
  scale: number
  template: TemplateType
  accentColor?: string
  usableHeight: number
  paddingPx: number
  children: React.ReactNode
}) {
  const style = TEMPLATE_STYLES[template]
  const accent = ACCENT_COLORS[accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.blue

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)]"
      style={{ width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }}
    >
      <div className="absolute right-4 top-4 z-10 rounded-md border border-slate-200/60 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-xs select-none">
        Page {index + 1}/{totalPages}
      </div>
      <div
        className="absolute left-0 top-0 overflow-hidden bg-white"
        style={{
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {style.sidebar && (
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent.sidebar || style.sidebar}`} />
        )}
        <div
          style={{
            position: 'absolute',
            top: paddingPx,
            height: usableHeight,
            left: 0,
            right: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ marginTop: -index * usableHeight - paddingPx }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function PaginatedResume({
  parsed,
  template,
  accentColor,
  density,
  fontFamily,
  scaleOverride,
  onMetricsChange,
}: {
  parsed: ParsedResume
  template: TemplateType
  accentColor?: string
  density?: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily?: 'sans' | 'serif' | 'mono'
  scaleOverride: number | null
  onMetricsChange: (metrics: { pageCount: number; scale: number }) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [spacers, setSpacers] = useState<Record<string, number>>({})
  const runCountRef = useRef(0)

  const resolvedDensity = useMemo(() => {
    if (density === 'auto') {
      return parsed.lineCount <= 22 ? 'airy' : parsed.lineCount <= 38 ? 'normal' : 'compact'
    }
    return density
  }, [density, parsed.lineCount])

  const paddingPx = resolvedDensity === 'airy' ? 40 : resolvedDensity === 'compact' ? 32 : 36
  const usableHeight = A4_HEIGHT_PX - (paddingPx * 2)

  // Clear spacers first when structure changes to measure natural layout
  useLayoutEffect(() => {
    setSpacers({})
    runCountRef.current = 0
  }, [parsed, template, density, fontFamily])

  // Measurement effect to calculate page-pushed spacers
  useLayoutEffect(() => {
    if (!measureRef.current) return

    if (runCountRef.current > 30) {
      console.warn("PaginatedResume: Prevented infinite loop crash. Run count exceeded 30.")
      return
    }

    const container = measureRef.current
    const blocks = Array.from(container.querySelectorAll('[data-page-block]')) as HTMLElement[]
    if (blocks.length === 0) return

    const newSpacers = { ...spacers }
    let changed = false
    const pageHeight = usableHeight

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const key = block.getAttribute('data-page-block')
      if (!key) continue

      const rect = block.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const relativeTop = rect.top - containerRect.top
      const relativeBottom = rect.bottom - containerRect.top

      const currentSpacer = spacers[key] || 0
      const contentTop = relativeTop + currentSpacer
      const contentBottom = relativeBottom

      const pageNum = Math.floor(Math.max(0, contentTop - paddingPx) / pageHeight)
      const boundary = paddingPx + (pageNum + 1) * pageHeight

      // Detect widowed heading: heading is on Page N, but its first block is on Page N+1 (or later)
      if (key.startsWith('sec-heading-')) {
        const sectionHeadingName = key.replace('sec-heading-', '')
        const firstBlockKey = `sec-block-${sectionHeadingName}-0`
        const firstBlockElement = container.querySelector(`[data-page-block="${firstBlockKey}"]`) as HTMLElement
        if (firstBlockElement) {
          const firstBlockRect = firstBlockElement.getBoundingClientRect()
          const firstBlockRelativeTop = firstBlockRect.top - containerRect.top
          const firstBlockCurrentSpacer = spacers[firstBlockKey] || 0
          const firstBlockContentTop = firstBlockRelativeTop + firstBlockCurrentSpacer
          
          const firstBlockPage = Math.floor(Math.max(0, firstBlockContentTop - paddingPx) / pageHeight)
          
          if (firstBlockPage > pageNum) {
            // Heading is widowed! Push it to the first block's page
            const headingBoundary = paddingPx + (pageNum + 1) * pageHeight
            const additionalSpacer = headingBoundary - contentTop
            if (additionalSpacer <= 160) {
              const totalSpacer = Math.round(currentSpacer + additionalSpacer)
              if (Math.abs(totalSpacer - currentSpacer) > 2) {
                console.log(`PaginatedResume: Widowed heading detected for [${key}]. Pushing to page ${firstBlockPage}. Spacer from ${currentSpacer}px to ${totalSpacer}px.`)
                newSpacers[key] = totalSpacer
                changed = true
                runCountRef.current += 1
                break
              }
            }
          }
        }
      }

      // Check if block content crosses boundary
      if (contentBottom > boundary && contentTop < boundary) {
        let targetKey = key
        let targetContentTop = contentTop
        let targetCurrentSpacer = currentSpacer

        // If it's the first block of a section, push the heading instead to prevent widowed headings,
        // but ONLY if the heading's required push doesn't exceed the threshold.
        if (key.startsWith('sec-block-') && key.endsWith('-0')) {
          const sectionHeadingName = key.replace('sec-block-', '').replace(/-0$/, '')
          const headingKey = `sec-heading-${sectionHeadingName}`
          const headingElement = container.querySelector(`[data-page-block="${headingKey}"]`) as HTMLElement
          if (headingElement) {
            const headingRect = headingElement.getBoundingClientRect()
            const headingRelativeTop = headingRect.top - containerRect.top
            const headingCurrentSpacer = spacers[headingKey] || 0
            const headingContentTop = headingRelativeTop + headingCurrentSpacer
            const headingAdditionalSpacer = boundary - headingContentTop

            if (headingAdditionalSpacer <= 160) {
              targetKey = headingKey
              targetContentTop = headingContentTop
              targetCurrentSpacer = headingCurrentSpacer
            }
          }
        }

        const additionalSpacer = boundary - targetContentTop

        if (additionalSpacer <= 160) {
          const totalSpacer = Math.round(targetCurrentSpacer + additionalSpacer)
          // Accumulate and check threshold to prevent loops
          if (Math.abs(totalSpacer - targetCurrentSpacer) > 2) {
            console.log(`PaginatedResume: Adjusting spacer for [${targetKey}] from ${targetCurrentSpacer}px to ${totalSpacer}px (additional: ${additionalSpacer}px). Run count: ${runCountRef.current}`)
            newSpacers[targetKey] = totalSpacer
            changed = true
            runCountRef.current += 1
            break // break to batch update and allow DOM to reflow
          }
        } else if (targetCurrentSpacer > 0) {
          // Reset spacer if it is no longer reasonable to push
          console.log(`PaginatedResume: Resetting spacer for [${targetKey}] to 0 because push height (${additionalSpacer}px) exceeds threshold.`)
          newSpacers[targetKey] = 0
          changed = true
          runCountRef.current += 1
          break
        }
      }
    }

    if (changed) {
      setSpacers(newSpacers)
    }
  }, [parsed, template, density, fontFamily, spacers, usableHeight, paddingPx])

  useLayoutEffect(() => {
    const update = () => {
      if (scaleOverride !== null) {
        setScale(scaleOverride)
      } else if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth - 32
        setScale(Math.max(0.4, Math.min(1.5, parentWidth / A4_WIDTH_PX)))
      }
      if (measureRef.current) {
        setPageCount(Math.max(1, Math.ceil((measureRef.current.scrollHeight - paddingPx * 2) / usableHeight)))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    if (measureRef.current) ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [parsed, template, scaleOverride, density, spacers, usableHeight, paddingPx])

  useLayoutEffect(() => {
    onMetricsChange({ pageCount, scale })
  }, [onMetricsChange, pageCount, scale])

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center gap-6 py-6 px-4 overflow-y-auto max-h-full">
      {/* Off-screen absolute measurer */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: -9999,
          width: A4_WIDTH_PX,
          pointerEvents: 'none',
        }}
      >
        {!parsed.isEmpty && (
          <ResumeContent
            parsed={parsed}
            template={template}
            accentColor={accentColor}
            density={density}
            fontFamily={fontFamily}
            spacers={spacers}
          />
        )}
      </div>

      {parsed.isEmpty ? (
        <PageFrame index={0} totalPages={1} scale={scale} template={template} accentColor={accentColor} usableHeight={usableHeight} paddingPx={paddingPx}>
          <EmptyState />
        </PageFrame>
      ) : (
        Array.from({ length: pageCount }).map((_, i) => (
          <PageFrame
            key={i}
            index={i}
            totalPages={pageCount}
            scale={scale}
            template={template}
            accentColor={accentColor}
            usableHeight={usableHeight}
            paddingPx={paddingPx}
          >
            <ResumeContent
              parsed={parsed}
              template={template}
              accentColor={accentColor}
              density={density}
              fontFamily={fontFamily}
              spacers={spacers}
            />
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
  template,
  onTemplateChange,
  accentColor = 'blue',
  density = 'auto',
  fontFamily = 'sans',
}: ResumePreviewProps) {
  const parsed = useMemo(() => parseResume(preview), [preview])
  const [previewMetrics, setPreviewMetrics] = useState({ pageCount: 1, scale: 0.7 })
  const [zoomLevel, setZoomLevel] = useState<number | null>(null) // null means Auto-Fit

  const handleDownloadPDF = async () => {
    if (parsed.isEmpty) return

    const [{ pdf }, { ResumePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./resume-pdf'),
    ])

    const blob = await pdf(
      <ResumePDF
        parsed={parsed}
        template={template}
        accentColor={accentColor}
        density={density}
        fontFamily={fontFamily}
      />
    ).toBlob()
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${parsed.name || 'resume'}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDraftLabel = () => {
    switch (draftStatus) {
      case 'unsaved':
        return 'Unsaved Changes'
      case 'draft_saved':
        return 'Saved Locally'
      case 'ready_to_save':
        return 'Version Ready'
    }
  }

  const handleZoomIn = () => {
    const current = zoomLevel || previewMetrics.scale
    setZoomLevel(Math.min(1.5, parseFloat((current + 0.1).toFixed(1))))
  }

  const handleZoomOut = () => {
    const current = zoomLevel || previewMetrics.scale
    setZoomLevel(Math.max(0.4, parseFloat((current - 0.1).toFixed(1))))
  }

  const handleResetZoom = () => {
    setZoomLevel(null) // Restore Auto-Fit
  }

  const displayZoom = Math.round((zoomLevel || previewMetrics.scale) * 100)

  return (
    <div className="flex h-full flex-col bg-slate-100 overflow-hidden relative border-l border-slate-200/80 dark:border-slate-800 dark:bg-slate-950">
      <button
        id="download-pdf-btn"
        onClick={handleDownloadPDF}
        style={{ display: 'none' }}
      >
        Download
      </button>

      {/* Premium Preview Control Header - Light Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 z-10 shrink-0 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 dark:text-slate-100">
              Live Preview
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${draftStatus === 'unsaved' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            </h4>
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 dark:text-slate-400">
              <span>{getDraftLabel()}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>v{currentVersion}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{previewMetrics.pageCount} page{previewMetrics.pageCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Zoom and Fit Toolbar */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xxs self-end sm:self-auto dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-slate-50 rounded-md text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleResetZoom}
            title="Auto-Fit Screen"
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${
              zoomLevel === null 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
          >
            {displayZoom}% {zoomLevel === null && 'Auto'}
          </button>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-slate-50 rounded-md text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          
          {zoomLevel !== null && (
            <>
              <div className="w-px h-3 bg-slate-200 mx-1" />
              <button
                onClick={handleResetZoom}
                title="Fit to Width"
                className="p-1 hover:bg-slate-50 rounded-md text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Paginated Sheet Renderer inside viewport-locked container */}
      <div className="flex-1 min-h-0 overflow-y-hidden flex flex-col bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] bg-slate-100 dark:bg-[radial-gradient(rgba(148,163,184,0.10)_1px,transparent_1px)] dark:[background-size:20px_20px] dark:bg-slate-950">
        <PaginatedResume
          parsed={parsed}
          template={template}
          accentColor={accentColor}
          density={density}
          fontFamily={fontFamily}
          scaleOverride={zoomLevel}
          onMetricsChange={setPreviewMetrics}
        />
      </div>
    </div>
  )
}
