// Resume types
export interface Resume {
  id: string | number
  name: string
  created: string
  modified: string
  wordCount: number
  lastModified?: string
  versions?: number
  status?: 'Ready' | 'Draft'
  contentText?: string | null
}

// Achievement types
export interface Achievement {
  id: number
  title: string
  description: string
  date: string
}

// Version types
export interface ResumeVersion {
  id: string | number
  versionNumber: number
  name: string
  date: string
  time: string
  changes: string
  savedBy: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
  title: string
  template: string
  fitStatus: number
  isActive?: boolean
  contentSnapshot?: Record<string, unknown>
}

export interface VersionChange {
  section: string
  type: 'added' | 'updated' | 'removed'
}

// JD Matcher types
export interface MatchResult {
  matched: string[]
  missing: string[]
  keywords: string[]
}

// Feature types
export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

// Principle types
export interface Principle {
  title: string
  desc: string
}

// Resume Editor types
export interface ResumeBullet {
  id: string
  text: string
}

export interface ResumeExperience {
  id: string
  company: string
  position: string
  duration: string
  bullets: ResumeBullet[]
}

export interface ResumeSection {
  summary: string
  experience: ResumeExperience[]
  education: string
  skills: string
}

export type DraftStatus = 'unsaved' | 'draft_saved' | 'ready_to_save'

// Upload and extraction types
export type UploadStatus = 'ready' | 'uploading' | 'extracting' | 'completed' | 'review_needed' | 'failed'

export interface ExtractedResume {
  name: string | null
  role: string | null
  email: string | null
  phone: string | null
  location: string | null
  skills: string[]
  experience: ExtractedExperience[]
  projects: ExtractedProject[]
  education: ExtractedEducation[]
  confidence: 'high' | 'medium' | 'needs_review' | 'missing'
}

export interface ExtractedExperience {
  company: string | null
  position: string | null
  duration: string | null
  description: string | null
  confidence: 'high' | 'medium' | 'needs_review'
}

export interface ExtractedProject {
  name: string | null
  description: string | null
  confidence: 'high' | 'medium' | 'needs_review'
}

export interface ExtractedEducation {
  school: string | null
  degree: string | null
  field: string | null
  graduation: string | null
  confidence: 'high' | 'medium' | 'needs_review'
}

export interface UploadedFile {
  id: string
  name: string
  type: 'PDF' | 'DOCX'
  size: number
  uploadedAt: string
  status: UploadStatus
}

// Achievement types (extended)
export interface AchievementNote {
  id: string
  rawNote: string
  resumeBullet: string | null
  project: string
  date: string
  tags: string[]
  status: 'Draft' | 'Converted' | 'Added to Resume'
  createdAt: string
}

export interface TimelineGroup {
  period: 'This Week' | 'This Month' | 'Older'
  achievements: AchievementNote[]
}
