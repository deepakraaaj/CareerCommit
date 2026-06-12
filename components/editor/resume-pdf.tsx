import { Document, Link, Page, Text, View } from '@react-pdf/renderer'
import type { ParsedResume, Block, TemplateType } from './resume-preview'

interface Theme {
  body: string
  bold: string
  italic: string
  text: string
  muted: string
  nameColor: string
  roleColor: string
  headingColor: string
  bulletColor: string
  dateColor: string
  centered: boolean
  headerRule: { width: number; color: string } | null
  headingRule: string | null
  sidebar: string | null
  roleStyle: 'plain' | 'italic' | 'caps'
  headingSpacing: number
  headingPrefix?: string
}

const THEMES: Record<TemplateType, Theme> = {
  modern: {
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    text: '#1f2937',
    muted: '#6b7280',
    nameColor: '#111827',
    roleColor: '#1d4ed8',
    headingColor: '#1e40af',
    bulletColor: '#2563eb',
    dateColor: '#6b7280',
    centered: false,
    headerRule: { width: 2, color: '#1d4ed8' },
    headingRule: '#bfdbfe',
    sidebar: null,
    roleStyle: 'plain',
    headingSpacing: 1.6,
  },
  classic: {
    body: 'Times-Roman',
    bold: 'Times-Bold',
    italic: 'Times-Italic',
    text: '#1f2937',
    muted: '#4b5563',
    nameColor: '#111827',
    roleColor: '#374151',
    headingColor: '#111827',
    bulletColor: '#1f2937',
    dateColor: '#4b5563',
    centered: true,
    headerRule: { width: 1, color: '#374151' },
    headingRule: '#9ca3af',
    sidebar: null,
    roleStyle: 'italic',
    headingSpacing: 1.2,
  },
  minimalist: {
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    text: '#374151',
    muted: '#9ca3af',
    nameColor: '#111827',
    roleColor: '#9ca3af',
    headingColor: '#9ca3af',
    bulletColor: '#d1d5db',
    dateColor: '#9ca3af',
    centered: false,
    headerRule: null,
    headingRule: null,
    sidebar: null,
    roleStyle: 'caps',
    headingSpacing: 2.2,
  },
  creative: {
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    text: '#1f2937',
    muted: '#6b7280',
    nameColor: '#1d4ed8',
    roleColor: '#4b5563',
    headingColor: '#2563eb',
    bulletColor: '#3b82f6',
    dateColor: '#2563eb',
    centered: false,
    headerRule: null,
    headingRule: null,
    sidebar: '#2563eb',
    roleStyle: 'plain',
    headingSpacing: 1,
  },
  elegant: {
    body: 'Times-Roman',
    bold: 'Times-Bold',
    italic: 'Times-Italic',
    text: '#374151',
    muted: '#6b7280',
    nameColor: '#111827',
    roleColor: '#b45309',
    headingColor: '#1f2937',
    bulletColor: '#d97706',
    dateColor: '#b45309',
    centered: true,
    headerRule: { width: 1, color: '#fcd34d' },
    headingRule: '#fde68a',
    sidebar: null,
    roleStyle: 'italic',
    headingSpacing: 2.4,
  },
  bold: {
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    text: '#1f2937',
    muted: '#6b7280',
    nameColor: '#111827',
    roleColor: '#059669',
    headingColor: '#047857',
    bulletColor: '#10b981',
    dateColor: '#047857',
    centered: false,
    headerRule: { width: 3, color: '#10b981' },
    headingRule: '#6ee7b7',
    sidebar: '#10b981',
    roleStyle: 'caps',
    headingSpacing: 1.4,
  },
  technical: {
    body: 'Courier',
    bold: 'Courier-Bold',
    italic: 'Courier-Oblique',
    text: '#334155',
    muted: '#64748b',
    nameColor: '#0f172a',
    roleColor: '#0d9488',
    headingColor: '#334155',
    bulletColor: '#14b8a6',
    dateColor: '#0d9488',
    centered: false,
    headerRule: { width: 1, color: '#cbd5e1' },
    headingRule: '#e2e8f0',
    sidebar: null,
    roleStyle: 'plain',
    headingSpacing: 1.2,
    headingPrefix: '// ',
  },
}

const ACCENT_COLORS_PDF = {
  blue: {
    text: '#2563eb', // blue-600
    textDark: '#1e40af', // blue-800
    textLight: '#3b82f6', // blue-500
    border: '#2563eb',
    borderLight: '#bfdbfe',
    bullet: '#2563eb',
    sidebar: '#2563eb',
  },
  indigo: {
    text: '#4f46e5', // indigo-600
    textDark: '#3730a3', // indigo-800
    textLight: '#6366f1', // indigo-500
    border: '#4f46e5',
    borderLight: '#c7d2fe',
    bullet: '#4f46e5',
    sidebar: '#4f46e5',
  },
  emerald: {
    text: '#059669', // emerald-600
    textDark: '#065f46', // emerald-800
    textLight: '#10b981', // emerald-500
    border: '#059669',
    borderLight: '#a7f3d0',
    bullet: '#059669',
    sidebar: '#059669',
  },
  amber: {
    text: '#d97706', // amber-600
    textDark: '#92400e', // amber-800
    textLight: '#f59e0b', // amber-500
    border: '#d97706',
    borderLight: '#fde68a',
    bullet: '#d97706',
    sidebar: '#d97706',
  },
  rose: {
    text: '#e11d48', // rose-600
    textDark: '#9f1239', // rose-800
    textLight: '#f43f5e', // rose-500
    border: '#e11d48',
    borderLight: '#fecdd3',
    bullet: '#e11d48',
    sidebar: '#e11d48',
  },
  violet: {
    text: '#7c3aed', // violet-600
    textDark: '#5b21b6', // violet-800
    textLight: '#8b5cf6', // violet-500
    border: '#7c3aed',
    borderLight: '#ddd6fe',
    bullet: '#7c3aed',
    sidebar: '#7c3aed',
  },
  slate: {
    text: '#475569', // slate-600
    textDark: '#1e293b', // slate-800
    textLight: '#64748b', // slate-500
    border: '#475569',
    borderLight: '#cbd5e1',
    bullet: '#475569',
    sidebar: '#475569',
  },
}

function BlockPdf({ block, t, size }: { block: Block; t: Theme; size: number }) {
  const base = { fontSize: size, color: t.text, lineHeight: 1.45 }
  switch (block.kind) {
    case 'bullet':
      return (
        <View style={{ flexDirection: 'row', gap: 4, paddingLeft: 2 }} wrap={false}>
          <Text style={{ ...base, color: t.bulletColor }}>•</Text>
          <Text style={{ ...base, flex: 1, maxWidth: '95%' }}>{block.text}</Text>
        </View>
      )
    case 'entry':
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }} wrap={false}>
          <Text style={{ ...base, maxWidth: block.date ? '74%' : '100%' }}>
            <Text style={{ fontFamily: t.bold }}>{block.primary}</Text>
            {block.middle.length > 0 && (
              <Text style={{ color: t.muted }}>{'  ·  ' + block.middle.join(' · ')}</Text>
            )}
          </Text>
          {block.date ? (
            <Text style={{ ...base, color: t.dateColor, flexShrink: 0, textAlign: 'right' }}>
              {block.date}
            </Text>
          ) : null}
        </View>
      )
    case 'entry-right':
      return (
        <View style={{ gap: 2 }} wrap={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ ...base, maxWidth: '70%' }}>
              <Text style={{ fontFamily: t.bold }}>{block.primary}</Text>
            </Text>
            <Text style={{ ...base, color: t.dateColor, fontFamily: t.italic, flexShrink: 0, textAlign: 'right' }}>
              {block.right}
            </Text>
          </View>
          {block.middle.length > 0 ? (
            <Text style={{ ...base, color: t.muted }}>
              {block.middle.join(' · ')}
            </Text>
          ) : null}
        </View>
      )
    case 'labeled':
      return (
        <Text style={base}>
          <Text style={{ fontFamily: t.bold }}>{block.label}: </Text>
          {block.text}
        </Text>
      )
    case 'para': {
      const sentences = block.text.match(/[^.!?]+[.!?]+(\s|$)/g) || [block.text]
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {sentences.map((s, idx) => (
            <Text key={idx} style={base}>{s}</Text>
          ))}
        </View>
      )
    }
  }
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function formatContactLabel(value: string) {
  if (/linkedin/i.test(value)) return 'LinkedIn'
  if (/github/i.test(value)) return 'GitHub'
  return value
}

export function ResumePDF({
  parsed,
  template,
  accentColor = 'blue',
  density = 'auto',
  fontFamily = 'sans',
}: {
  parsed: ParsedResume
  template: TemplateType
  accentColor?: string
  density?: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily?: 'sans' | 'serif' | 'mono'
}) {
  const defaultTheme = THEMES[template]
  const accent = ACCENT_COLORS_PDF[accentColor as keyof typeof ACCENT_COLORS_PDF] || ACCENT_COLORS_PDF.blue

  const bodyFont = fontFamily === 'serif' ? 'Times-Roman' : fontFamily === 'mono' ? 'Courier' : 'Helvetica'
  const boldFont = fontFamily === 'serif' ? 'Times-Bold' : fontFamily === 'mono' ? 'Courier-Bold' : 'Helvetica-Bold'
  const italicFont = fontFamily === 'serif' ? 'Times-Italic' : fontFamily === 'mono' ? 'Courier-Oblique' : 'Helvetica-Oblique'

  const t = {
    ...defaultTheme,
    body: bodyFont,
    bold: boldFont,
    italic: italicFont,
    roleColor: accent.text,
    headingColor: accent.textDark,
    bulletColor: accent.bullet,
    dateColor: accent.text,
    headerRule: defaultTheme.headerRule ? { ...defaultTheme.headerRule, color: accent.border } : null,
    headingRule: defaultTheme.headingRule ? accent.borderLight : null,
    sidebar: defaultTheme.sidebar ? accent.sidebar : null,
  }

  const resolvedDensity = density === 'auto'
    ? (parsed.lineCount <= 22 ? 'airy' : parsed.lineCount <= 38 ? 'normal' : 'compact')
    : density

  const bodySize = resolvedDensity === 'airy' ? 10.5 : resolvedDensity === 'normal' ? 10 : 9
  const sectionGap = resolvedDensity === 'airy' ? 16 : resolvedDensity === 'normal' ? 13 : 10
  const blockGap = resolvedDensity === 'airy' ? 5 : 4

  return (
    <Document title={parsed.name || 'Resume'} author={parsed.name || undefined}>
      <Page
        size="A4"
        style={{
          fontFamily: t.body,
          color: t.text,
          paddingTop: 48,
          paddingBottom: 48,
          paddingRight: 48,
          paddingLeft: t.sidebar ? 58 : 48,
        }}
      >
        {t.sidebar && (
          <View
            fixed
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, backgroundColor: t.sidebar }}
          />
        )}

        {(parsed.name || parsed.role || parsed.contacts.length > 0) && (
          <View
            wrap={false}
            style={{
              marginBottom: sectionGap,
              paddingBottom: t.headerRule ? 8 : 2,
              ...(t.headerRule
                ? { borderBottomWidth: t.headerRule.width, borderBottomColor: t.headerRule.color }
                : {}),
              ...(t.centered ? { alignItems: 'center' as const } : {}),
            }}
          >
            {parsed.name && (
              <Text style={{ fontSize: 22, fontFamily: t.bold, color: t.nameColor }}>{parsed.name}</Text>
            )}
            {parsed.role && (
              <Text
                style={{
                  fontSize: t.roleStyle === 'caps' ? 9 : 11,
                  color: t.roleColor,
                  marginTop: 3,
                  ...(t.roleStyle === 'italic' ? { fontFamily: t.italic } : {}),
                  ...(t.roleStyle === 'caps'
                    ? { textTransform: 'uppercase' as const, letterSpacing: 2.5 }
                    : {}),
                }}
              >
                {parsed.role}
              </Text>
            )}
            {parsed.contacts.length > 0 && (
              <Text style={{ fontSize: 9, color: t.muted, marginTop: 5 }}>
                {parsed.contacts.map((contact, index) => (
                  <Text key={index}>
                    {index > 0 ? '   ·   ' : ''}
                    {isUrl(contact) ? (
                      <Link src={contact} style={{ color: t.roleColor, textDecoration: 'underline' }}>
                        {formatContactLabel(contact)}
                      </Link>
                    ) : (
                      contact
                    )}
                  </Text>
                ))}
              </Text>
            )}
          </View>
        )}

        {parsed.intro.length > 0 && (
          <View style={{ marginBottom: sectionGap, gap: blockGap }}>
            {parsed.intro.map((b, i) => (
              <BlockPdf key={i} block={b} t={t} size={bodySize} />
            ))}
          </View>
        )}

        {parsed.sections.map((s, i) => (
          <View key={i} style={{ marginBottom: sectionGap }} minPresenceAhead={40}>
            <Text
              style={{
                fontSize: 9.5,
                fontFamily: t.bold,
                color: t.headingColor,
                textTransform: 'uppercase',
                letterSpacing: t.headingSpacing,
                marginBottom: 6,
                paddingBottom: t.headingRule ? 3 : 0,
                ...(t.headingRule ? { borderBottomWidth: 0.75, borderBottomColor: t.headingRule } : {}),
              }}
            >
              {t.headingPrefix}
              {s.heading}
            </Text>
            <View style={{ gap: blockGap }}>
              {s.blocks.map((b, j) => (
                <BlockPdf key={j} block={b} t={t} size={bodySize} />
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}
