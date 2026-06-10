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

function BlockPdf({ block, t, size }: { block: Block; t: Theme; size: number }) {
  const base = { fontSize: size, color: t.text, lineHeight: 1.45 }
  switch (block.kind) {
    case 'bullet':
      return (
        <View style={{ flexDirection: 'row', gap: 4, paddingLeft: 2 }}>
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
    case 'labeled':
      return (
        <Text style={base}>
          <Text style={{ fontFamily: t.bold }}>{block.label}: </Text>
          {block.text}
        </Text>
      )
    case 'para':
      return <Text style={base}>{block.text}</Text>
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

export function ResumePDF({ parsed, template }: { parsed: ParsedResume; template: TemplateType }) {
  const t = THEMES[template]
  const bodySize = parsed.lineCount <= 20 ? 10.5 : parsed.lineCount <= 45 ? 10 : 9
  const sectionGap = parsed.lineCount <= 20 ? 16 : parsed.lineCount <= 45 ? 13 : 10
  const blockGap = parsed.lineCount <= 20 ? 5 : 4

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
