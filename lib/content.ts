import {
  UploadCloud,
  PencilLine,
  History,
  GitCompare,
  Download,
  CheckCircle2,
} from 'lucide-react'
import type { Feature, Principle } from './types'

export const landingFeatures: Feature[] = [
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

export const landingPrinciples: Principle[] = [
  { title: 'You Own It', desc: 'Your resume belongs to you. Complete control, always.' },
  { title: 'AI Assists', desc: 'AI suggestions never auto-replace. You decide what stays.' },
  { title: 'Versions Matter', desc: 'Every save creates a new version. Never lose anything.' },
  { title: 'ATS-Safe', desc: 'All exports maintain clean, ATS-friendly formatting.' },
]

export const exportFormatComparison = [
  { feature: 'ATS Compatible', pdf: '✓', docx: '✓' },
  { feature: 'Formatting Preserved', pdf: '✓', docx: '✓' },
  { feature: 'Editable', pdf: '✗', docx: '✓' },
  { feature: 'Email Friendly', pdf: '✓', docx: '✓' },
  { feature: 'File Size', pdf: 'Small', docx: 'Small' },
]

export const supportedFileFormats = [
  { format: 'PDF', desc: 'Portable Document Format' },
  { format: 'DOCX', desc: 'Microsoft Word Document' },
  { format: 'TXT', desc: 'Plain Text' },
]

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
