// SUPABASE PLACEHOLDER - Future Integration
// This file prepares types for Supabase integration without adding real packages or logic
// Do not import real @supabase/supabase-js yet

// TODO: Install @supabase/supabase-js when ready
// TODO: Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY env vars
// TODO: Implement real Supabase client initialization

// Types for future Supabase tables
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

// Future Supabase tables schema (for reference):
/*
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE resumes (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  title text,
  template text DEFAULT 'Modern',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE resume_versions (
  id uuid PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES resumes(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  version_number integer NOT NULL,
  saved_by text NOT NULL,
  fit_score integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE achievements (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  raw_note text NOT NULL,
  resume_bullet text,
  project text,
  status text DEFAULT 'Draft',
  date date,
  tags text[],
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE exports (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  resume_id uuid NOT NULL REFERENCES resumes(id),
  format text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE uploaded_files (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamp DEFAULT now()
);

CREATE TABLE parse_jobs (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  file_id uuid NOT NULL REFERENCES uploaded_files(id),
  status text NOT NULL,
  extracted_name text,
  extracted_role text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE jd_analyses (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  resume_id uuid NOT NULL REFERENCES resumes(id),
  jd_text text NOT NULL,
  fit_score integer DEFAULT 0,
  matched_skills text[],
  missing_skills text[],
  created_at timestamp DEFAULT now()
);
*/

// Placeholder functions (no real implementation yet)
// TODO: Implement these with real Supabase calls

export const supabasePlaceholder = {
  // Profile operations
  getProfile: async (userId: string) => {
    console.log('[TODO] Fetch profile from Supabase:', userId)
    return null
  },

  // Resume operations
  getResumes: async (userId: string) => {
    console.log('[TODO] Fetch resumes from Supabase:', userId)
    return []
  },

  saveResume: async (userId: string, resume: DbResume) => {
    console.log('[TODO] Save resume to Supabase:', resume)
    return null
  },

  // Version operations
  getVersions: async (resumeId: string) => {
    console.log('[TODO] Fetch versions from Supabase:', resumeId)
    return []
  },

  saveVersion: async (version: DbResumeVersion) => {
    console.log('[TODO] Save version to Supabase:', version)
    return null
  },

  // Achievement operations
  getAchievements: async (userId: string) => {
    console.log('[TODO] Fetch achievements from Supabase:', userId)
    return []
  },

  saveAchievement: async (achievement: DbAchievement) => {
    console.log('[TODO] Save achievement to Supabase:', achievement)
    return null
  },

  // Export operations
  logExport: async (exportData: DbExport) => {
    console.log('[TODO] Log export to Supabase:', exportData)
    return null
  },

  // File upload operations
  uploadFile: async (file: DbUploadedFile) => {
    console.log('[TODO] Upload file metadata to Supabase:', file)
    return null
  },

  // Parse job operations
  createParseJob: async (job: DbParseJob) => {
    console.log('[TODO] Create parse job in Supabase:', job)
    return null
  },

  // JD analysis operations
  analyzeJD: async (analysis: DbJDAnalysis) => {
    console.log('[TODO] Save JD analysis to Supabase:', analysis)
    return null
  },
}
