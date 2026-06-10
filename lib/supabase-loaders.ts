import type {
  AchievementNote,
  Resume,
  ResumeVersion,
  UploadedFile,
} from './types'
import {
  supabasePlaceholder,
  type DbAchievement,
  type DbResume,
  type DbResumeVersion,
  type DbUploadedFile,
} from './supabase-placeholder'

function formatRelativeLabel(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`
}

function mapResume(
  row: Partial<DbResume> & { word_count?: number; versions?: number; status?: string }
): Resume {
  const created = row.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0]
  const modified = row.updated_at?.split('T')[0] ?? created
  return {
    id: row.id ?? 0,
    name: row.name ?? 'Untitled Resume',
    created,
    modified,
    wordCount: Number(row.word_count ?? 0),
    lastModified: formatRelativeLabel(row.updated_at ?? row.created_at ?? created),
    versions: Number(row.versions ?? 0),
    status: row.status === 'Ready' ? 'Ready' : 'Draft',
    contentText: row.content_text ?? null,
  }
}

function mapVersion(row: Partial<DbResumeVersion>): ResumeVersion {
  const created = row.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0]
  return {
    id: row.id ?? 0,
    name: `Version ${row.version_number ?? 1}`,
    title: row.title ?? `Version ${row.version_number ?? 1}`,
    date: created,
    time: '12:00 PM',
    changes: row.title ? `Saved version: ${row.title}` : 'Saved version',
    savedBy: row.saved_by ?? 'Manual',
    template: 'Modern',
    fitStatus: Number(row.fit_score ?? 0),
    isActive: Number(row.version_number ?? 0) === 1,
  }
}

function mapAchievement(row: Partial<DbAchievement>): AchievementNote {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    rawNote: row.raw_note ?? '',
    resumeBullet: row.resume_bullet ?? null,
    project: row.project ?? 'Uncategorized',
    date: row.date ?? new Date().toISOString().split('T')[0],
    tags: row.tags ?? [],
    status: row.status ?? 'Draft',
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

function mapUploadedFile(row: Partial<DbUploadedFile>): UploadedFile {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: row.filename ?? 'Untitled File',
    type: row.file_type ?? 'PDF',
    size: Number(row.file_size ?? 0),
    uploadedAt: row.uploaded_at ?? new Date().toISOString(),
    status: 'completed',
  }
}

export async function loadResumes(userId?: string): Promise<Resume[]> {
  const rows = await supabasePlaceholder.getResumes(userId)
  if (!rows.length) return []

  const versions = await supabasePlaceholder.getVersions(undefined, userId)
  const versionCounts = versions.reduce<Record<string, number>>((acc, version) => {
    const key = String((version as { resume_id?: string }).resume_id ?? '')
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return rows.map((row) =>
    mapResume({
      ...row,
      versions: versionCounts[String(row.id)] ?? 0,
      word_count: (row as { word_count?: number }).word_count ?? 0,
    })
  )
}

export async function loadVersions(resumeId?: string, userId?: string): Promise<ResumeVersion[]> {
  const rows = await supabasePlaceholder.getVersions(resumeId, userId)
  return rows.map(mapVersion)
}

export async function loadAchievements(userId?: string): Promise<AchievementNote[]> {
  const rows = await supabasePlaceholder.getAchievements(userId)
  return rows.map(mapAchievement)
}

export async function loadUploadedFiles(userId?: string): Promise<UploadedFile[]> {
  const rows = await supabasePlaceholder.getUploadedFiles(userId)
  return rows.map(mapUploadedFile)
}

export async function loadResumeText(resumeId?: string): Promise<string> {
  const rows = await supabasePlaceholder.getResumes()
  if (!rows.length) return ''

  if (resumeId) {
    const match = rows.find((row) => row.id === resumeId)
    return match?.content_text ?? ''
  }

  return rows[0]?.content_text ?? ''
}
