import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Centralized Supabase access for the app.
// The UI still falls back to local demo data when the corresponding tables are empty
// or when a request fails, but the client itself is real and uses the provided env vars.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

let cachedClient: SupabaseClient | null = null

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
    )
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey)
  }

  return cachedClient
}

function getSupabaseOrNull() {
  if (!isSupabaseConfigured) return null

  try {
    return getSupabaseClient()
  } catch (error) {
    console.error('[Supabase] Client initialization failed:', error)
    return null
  }
}

async function getCurrentUserId(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.warn('[Supabase] Unable to read current user:', error.message)
    return null
  }
  return data.user?.id ?? null
}

// Types for Supabase tables
export interface DbProfile {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface DbResume {
  id: string
  user_id: string
  name: string
  title: string
  template: string
  content_text: string | null
  created_at: string
  updated_at: string
}

export interface DbResumeVersion {
  id: string
  resume_id: string
  user_id: string
  title: string
  version_number: number
  saved_by: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
  fit_score: number
  content_snapshot?: Record<string, unknown>
  change_notes?: string
  section_changes?: Record<string, 'added' | 'modified' | 'removed' | 'unchanged'>
  created_at: string
}

export interface DbAchievement {
  id: string
  user_id: string
  raw_note: string
  resume_bullet: string | null
  project: string
  status: 'Draft' | 'Converted' | 'Added to Resume'
  date: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DbExport {
  id: string
  user_id: string
  resume_id: string
  format: 'PDF' | 'DOCX'
  created_at: string
}

export interface DbUploadedFile {
  id: string
  user_id: string
  filename: string
  file_type: 'PDF' | 'DOCX'
  file_size: number
  uploaded_at: string
}

export interface DbParseJob {
  id: string
  user_id: string
  file_id: string
  status: 'Pending' | 'Extracting' | 'Review' | 'Completed' | 'Failed'
  extracted_name: string | null
  extracted_role: string | null
  created_at: string
}

export interface DbJDAnalysis {
  id: string
  user_id: string
  resume_id: string
  jd_text: string
  fit_score: number
  matched_skills: string[]
  missing_skills: string[]
  created_at: string
}

async function safeSelect<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await query
  if (error) {
    console.error('[Supabase] Query failed:', error.message)
    return null
  }
  return data
}

export const supabasePlaceholder = {
  getProfile: async (userId: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    return safeSelect<DbProfile>(
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    )
  },

  saveProfile: async (profile: DbProfile) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !profile.id) {
      console.warn('[Supabase] Skipping profile save because no authenticated user is available.')
      return null
    }

    const payload = {
      ...profile,
      id: profile.id || currentUserId,
      updated_at: new Date().toISOString(),
    }

    return safeSelect<DbProfile>(
      supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single()
    )
  },

  getResumes: async (userId?: string, options?: { light?: boolean }) => {
    if (!userId) return []

    try {
      const light = options?.light ? '&light=1' : ''
      const response = await fetch(`/api/resumes/list?userId=${userId}${light}`)

      if (!response.ok) return []

      const result = await response.json()
      return result.data as DbResume[]
    } catch (error) {
      console.error('[API] getResumes error:', error)
      return []
    }
  },

  getVersionCounts: async (userId?: string) => {
    if (!userId) return {}

    try {
      const response = await fetch(`/api/resumes/versions?userId=${userId}&fields=resume_id`)

      if (!response.ok) return {}

      const result = await response.json()
      const rows = (result.data ?? []) as { resume_id?: string }[]
      return rows.reduce<Record<string, number>>((acc, row) => {
        const key = String(row.resume_id ?? '')
        acc[key] = (acc[key] ?? 0) + 1
        return acc
      }, {})
    } catch (error) {
      console.error('[API] getVersionCounts error:', error)
      return {}
    }
  },

  saveResume: async (userId: string, resume: DbResume) => {
    if (!userId) {
      throw new Error('No userId provided')
    }

    const payload = {
      id: resume.id,
      user_id: userId,
      name: resume.name,
      title: resume.title,
      template: resume.template,
      content_text: resume.content_text,
      created_at: resume.created_at,
      updated_at: new Date().toISOString()
    }

    try {
      console.log('[API] Saving resume...')

      const response = await fetch('/api/resumes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Save failed')
      }

      console.log('[API] ✅ Save successful')
      return resume
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[API] Error:', message)
      throw error
    }
  },

  deleteResume: async (resumeId: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return false

    const { error } = await supabase.from('resumes').delete().eq('id', resumeId)
    if (error) {
      console.error('[Supabase] Delete resume failed:', error.message)
      return false
    }
    return true
  },

  getVersions: async (resumeId?: string, userId?: string) => {
    if (!userId) return []

    try {
      let url = `/api/resumes/versions?userId=${userId}`
      if (resumeId) {
        url += `&resumeId=${resumeId}`
      }

      const response = await fetch(url)

      if (!response.ok) return []

      const result = await response.json()
      return result.data as DbResumeVersion[]
    } catch (error) {
      console.error('[API] getVersions error:', error)
      return []
    }
  },

  saveVersion: async (version: DbResumeVersion) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !version.user_id) {
      console.warn('[Supabase] Skipping version save because no authenticated user is available.')
      return null
    }

    const payload = { ...version, user_id: version.user_id || currentUserId }

    return safeSelect<DbResumeVersion>(
      supabase.from('resume_versions').insert(payload).select('*').single()
    )
  },

  getAchievements: async (userId?: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return []

    const resolvedUserId = userId || (await getCurrentUserId(supabase))
    if (!resolvedUserId) return []

    const query = supabase
      .from('achievements')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('date', { ascending: false })
    const data = await safeSelect<DbAchievement[]>(query)
    return data ?? []
  },

  saveAchievement: async (achievement: DbAchievement) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !achievement.user_id) {
      console.warn('[Supabase] Skipping achievement save because no authenticated user is available.')
      return null
    }

    const payload = { ...achievement, user_id: achievement.user_id || currentUserId }

    return safeSelect<DbAchievement>(
      supabase.from('achievements').upsert(payload, { onConflict: 'id' }).select('*').single()
    )
  },

  deleteAchievement: async (achievementId: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return false

    const { error } = await supabase.from('achievements').delete().eq('id', achievementId)
    if (error) {
      console.error('[Supabase] Delete achievement failed:', error.message)
      return false
    }
    return true
  },

  logExport: async (exportData: DbExport) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !exportData.user_id) {
      console.warn('[Supabase] Skipping export log because no authenticated user is available.')
      return null
    }

    const payload = { ...exportData, user_id: exportData.user_id || currentUserId }

    return safeSelect<DbExport>(
      supabase.from('exports').insert(payload).select('*').single()
    )
  },

  uploadFile: async (file: DbUploadedFile) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !file.user_id) {
      console.warn('[Supabase] Skipping file upload record because no authenticated user is available.')
      return null
    }

    const payload = { ...file, user_id: file.user_id || currentUserId }

    return safeSelect<DbUploadedFile>(
      supabase.from('uploaded_files').upsert(payload, { onConflict: 'id' }).select('*').single()
    )
  },

  deleteUploadedFile: async (fileId: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return false

    const { error } = await supabase.from('uploaded_files').delete().eq('id', fileId)
    if (error) {
      console.error('[Supabase] Delete uploaded file failed:', error.message)
      return false
    }
    return true
  },

  getUploadedFiles: async (userId?: string) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return []

    const resolvedUserId = userId || (await getCurrentUserId(supabase))
    if (!resolvedUserId) return []

    const query = supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('uploaded_at', { ascending: false })
    const data = await safeSelect<DbUploadedFile[]>(query)
    return data ?? []
  },

  createParseJob: async (job: DbParseJob) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !job.user_id) {
      console.warn('[Supabase] Skipping parse job because no authenticated user is available.')
      return null
    }

    const payload = { ...job, user_id: job.user_id || currentUserId }

    return safeSelect<DbParseJob>(supabase.from('parse_jobs').insert(payload).select('*').single())
  },

  analyzeJD: async (analysis: DbJDAnalysis) => {
    const supabase = getSupabaseOrNull()
    if (!supabase) return null

    const currentUserId = await getCurrentUserId(supabase)
    if (!currentUserId && !analysis.user_id) {
      console.warn('[Supabase] Skipping JD analysis because no authenticated user is available.')
      return null
    }

    const payload = { ...analysis, user_id: analysis.user_id || currentUserId }

    return safeSelect<DbJDAnalysis>(
      supabase.from('jd_analyses').insert(payload).select('*').single()
    )
  },
}
