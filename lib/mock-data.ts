import type { Resume, Achievement, ResumeVersion, MatchResult, Feature, Principle, AchievementNote, UploadedFile, ExtractedResume } from './types'
import {
  UploadCloud,
  PencilLine,
  History,
  GitCompare,
  Download,
  CheckCircle2,
} from 'lucide-react'

// Mock Resumes
export const mockResumes: Resume[] = [
  {
    id: 1,
    name: 'Senior Developer Resume',
    created: '2024-06-08',
    modified: '2024-06-10',
    wordCount: 450,
    lastModified: '2 hours ago',
    versions: 5,
    status: 'Ready',
  },
  {
    id: 2,
    name: 'Product Manager Resume',
    created: '2024-05-20',
    modified: '2024-06-09',
    wordCount: 380,
    lastModified: '1 day ago',
    versions: 3,
    status: 'Draft',
  },
  {
    id: 3,
    name: 'Startup Founder Resume',
    created: '2024-05-01',
    modified: '2024-06-05',
    wordCount: 520,
    lastModified: '3 days ago',
    versions: 2,
    status: 'Ready',
  },
  {
    id: 4,
    name: 'Consulting Resume',
    created: '2024-04-15',
    modified: '2024-04-20',
    wordCount: 420,
  },
]

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Led microservices migration project',
    description:
      'Successfully migrated legacy monolithic application to microservices architecture, serving 100K+ users',
    date: '2024-06-10',
  },
  {
    id: 2,
    title: 'Implemented automated testing pipeline',
    description:
      'Reduced production bugs by 45% through comprehensive test automation and CI/CD improvements',
    date: '2024-05-15',
  },
  {
    id: 3,
    title: 'Mentored junior development team',
    description:
      'Guided 5 junior developers through complex projects, improving code quality and team productivity',
    date: '2024-04-20',
  },
  {
    id: 4,
    title: 'Optimized database performance',
    description:
      'Reduced database query load time by 60% through indexing and query optimization',
    date: '2024-03-30',
  },
]

// Mock Version History
export const mockVersions: ResumeVersion[] = [
  {
    id: 5,
    name: 'Version 5',
    title: 'Added AWS Certifications',
    date: '2024-06-10',
    time: '2:30 PM',
    changes: 'Updated skills section, added new certifications',
    savedBy: 'Manual',
    template: 'Modern',
    fitStatus: 88,
    isActive: true,
  },
  {
    id: 4,
    name: 'Version 4',
    title: 'Metrics Update',
    date: '2024-06-09',
    time: '10:15 AM',
    changes: 'Revised professional summary and added metrics to achievements',
    savedBy: 'AI Assist',
    template: 'Modern',
    fitStatus: 85,
  },
  {
    id: 3,
    name: 'Version 3',
    title: 'Experience Reformat',
    date: '2024-06-08',
    time: '4:45 PM',
    changes: 'Reformatted experience section for clarity',
    savedBy: 'Manual',
    template: 'Modern',
    fitStatus: 82,
  },
  {
    id: 2,
    name: 'Version 2',
    title: 'Initial Edits',
    date: '2024-06-07',
    time: '11:20 AM',
    changes: 'Initial edits and formatting adjustments',
    savedBy: 'Manual',
    template: 'Modern',
    fitStatus: 78,
  },
  {
    id: 1,
    name: 'Original',
    title: 'Original Upload',
    date: '2024-06-05',
    time: '9:00 AM',
    changes: 'Uploaded resume',
    savedBy: 'Upload Parser',
    template: 'Modern',
    fitStatus: 72,
  },
]

// Mock JD Matcher Results
export const mockMatchResults: MatchResult = {
  matched: [
    'Full Stack Developer',
    'React & Node.js experience',
    'AWS deployment',
    'PostgreSQL',
    'Git version control',
    'Agile methodologies',
  ],
  missing: [
    'Kubernetes',
    'Python',
    'Docker expertise',
    'Microservices architecture',
  ],
  keywords: [
    'leadership',
    'mentoring',
    'API design',
    'performance optimization',
  ],
}

// Landing Page Features
export const features: Feature[] = [
  {
    icon: UploadCloud,
    title: 'Upload Your Resume',
    description: 'Import your existing resume in any format and get started immediately.',
  },
  {
    icon: PencilLine,
    title: 'Visual Editing',
    description: 'Edit your resume with a powerful visual editor that maintains ATS-safe formatting.',
  },
  {
    icon: History,
    title: 'Version History',
    description: 'Save multiple versions of your resume without losing any previous iterations.',
  },
  {
    icon: GitCompare,
    title: 'Job Matching',
    description: 'Match your resume against job descriptions and get optimization suggestions.',
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Export your resume as clean PDF or DOCX files optimized for ATS systems.',
  },
  {
    icon: CheckCircle2,
    title: 'Achievement Tracking',
    description: 'Keep notes on your achievements and easily add them to your resume.',
  },
]

// Landing Page Principles
export const principles: Principle[] = [
  { title: 'You Own It', desc: 'Your resume belongs to you. Complete control, always.' },
  { title: 'AI Assists', desc: 'AI suggestions never auto-replace. You decide what stays.' },
  { title: 'Versions Matter', desc: 'Every save creates a new version. Never lose anything.' },
  { title: 'ATS-Safe', desc: 'All exports maintain clean, ATS-friendly formatting.' },
]

// Default Editor Content
export const defaultEditorContent = `John Doe
Senior Full Stack Developer
john.doe@example.com | (555) 123-4567 | LinkedIn | GitHub

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 8 years of expertise in building scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and agile methodologies.

EXPERIENCE
Senior Developer | TechCorp Inc. | 2022 - Present
- Led development of microservices architecture serving 100K+ users
- Implemented automated testing pipeline reducing bugs by 45%
- Mentored team of 5 junior developers

Full Stack Developer | StartupXYZ | 2019 - 2022
- Built responsive web applications using React and Node.js
- Optimized database queries reducing load time by 60%
- Deployed and maintained AWS infrastructure

EDUCATION
Bachelor of Science in Computer Science
State University | 2019

SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Next.js, Node.js, Express
Tools: AWS, Docker, PostgreSQL, Git`

// Export Format Comparison
export const formatComparison = [
  { feature: 'ATS Compatible', pdf: '✓', docx: '✓' },
  { feature: 'Formatting Preserved', pdf: '✓', docx: '✓' },
  { feature: 'Editable', pdf: '✗', docx: '✓' },
  { feature: 'Email Friendly', pdf: '✓', docx: '✓' },
  { feature: 'File Size', pdf: 'Small', docx: 'Small' },
]

// Supported File Formats
export const supportedFormats = [
  { format: 'PDF', desc: 'Portable Document Format' },
  { format: 'DOCX', desc: 'Microsoft Word Document' },
  { format: 'TXT', desc: 'Plain Text' },
]

// Export Format Options
export const exportFormats = [
  {
    format: 'PDF',
    desc: 'Best for email and web submissions',
    type: 'pdf' as const,
  },
  {
    format: 'DOCX',
    desc: 'Editable Word document for recruiters',
    type: 'docx' as const,
  },
]

// Achievement Notes (for Achievement Tracking page)
export const mockAchievementNotes: AchievementNote[] = [
  {
    id: '1',
    rawNote: 'Fixed critical RFID scan bug affecting warehouse operations. Updated issue/return workflow for better UX. Demo\'d changes to Kote users.',
    resumeBullet: 'Fixed critical RFID scan issue affecting warehouse operations, improving transaction processing by 30%',
    project: 'Warehouse Management System',
    date: '2024-06-09',
    tags: ['bug-fix', 'performance', 'workflow'],
    status: 'Added to Resume',
    createdAt: '2024-06-09T14:30:00Z',
  },
  {
    id: '2',
    rawNote: 'Led architecture review for microservices migration. Identified 12 potential scaling issues and documented solutions.',
    resumeBullet: 'Led microservices architecture review, identifying and documenting solutions for 12 scaling issues',
    project: 'Platform Modernization',
    date: '2024-06-05',
    tags: ['architecture', 'leadership', 'review'],
    status: 'Converted',
    createdAt: '2024-06-05T10:15:00Z',
  },
  {
    id: '3',
    rawNote: 'Mentored 3 junior devs on React patterns. Did code reviews and pair programming sessions.',
    resumeBullet: null,
    project: 'Team Development',
    date: '2024-06-01',
    tags: ['mentoring', 'react'],
    status: 'Draft',
    createdAt: '2024-06-01T09:00:00Z',
  },
  {
    id: '4',
    rawNote: 'Optimized database queries for reporting dashboard. Used proper indexing and query analysis.',
    resumeBullet: 'Optimized database queries for reporting dashboard using strategic indexing',
    project: 'Analytics Dashboard',
    date: '2024-05-28',
    tags: ['performance', 'database'],
    status: 'Added to Resume',
    createdAt: '2024-05-28T16:45:00Z',
  },
  {
    id: '5',
    rawNote: 'Created comprehensive testing guide for API endpoints. Covered edge cases and error scenarios.',
    resumeBullet: null,
    project: 'Backend API',
    date: '2024-05-20',
    tags: ['testing', 'documentation'],
    status: 'Draft',
    createdAt: '2024-05-20T11:30:00Z',
  },
]

// Uploaded Files (for Upload page)
export const mockUploadedFiles: UploadedFile[] = [
  {
    id: 'upload-1',
    name: 'John_Doe_Resume_2024.pdf',
    type: 'PDF',
    size: 245000,
    uploadedAt: '2024-06-05T09:00:00Z',
    status: 'completed',
  },
  {
    id: 'upload-2',
    name: 'Resume_Draft_v2.docx',
    type: 'DOCX',
    size: 156000,
    uploadedAt: '2024-05-28T14:30:00Z',
    status: 'completed',
  },
]

// Extracted Resume Data
export const mockExtractedResume: ExtractedResume = {
  name: 'John David Doe',
  role: 'Senior Full Stack Developer',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'AWS',
    'Docker',
    'Git',
  ],
  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Full Stack Developer',
      duration: 'Jan 2022 - Present',
      description: 'Led microservices architecture and mentored junior developers',
      confidence: 'high',
    },
    {
      company: 'StartupXYZ Inc.',
      position: 'Full Stack Developer',
      duration: 'Jun 2019 - Dec 2021',
      description: 'Built React and Node.js applications with AWS deployment',
      confidence: 'high',
    },
  ],
  projects: [
    {
      name: 'Microservices Migration',
      description: 'Architected and led migration from monolith to microservices',
      confidence: 'high',
    },
  ],
  education: [
    {
      school: 'State University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduation: '2019',
      confidence: 'high',
    },
  ],
  confidence: 'high',
}

// Project list for achievements
export const projectList = [
  'Warehouse Management System',
  'Platform Modernization',
  'Team Development',
  'Analytics Dashboard',
  'Backend API',
  'Mobile App',
  'Cloud Migration',
  'Data Pipeline',
]

// Tags for achievements
export const tagList = [
  'bug-fix',
  'feature',
  'performance',
  'workflow',
  'architecture',
  'leadership',
  'review',
  'mentoring',
  'react',
  'database',
  'testing',
  'documentation',
]
