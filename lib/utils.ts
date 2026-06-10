import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date and time
export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} at ${timeString}`
}

// Calculate word count
export function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

// Badge color utilities
export function getStatusColor(status: 'Ready' | 'Draft' | 'Active' | 'Draft' | 'Converted' | 'Added to Resume'): string {
  switch (status) {
    case 'Ready':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'Draft':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'Converted':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Added to Resume':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
  }
}

export function getConfidenceBadge(confidence: 'high' | 'medium' | 'needs_review' | 'missing'): string {
  switch (confidence) {
    case 'high':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'needs_review':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'missing':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
  }
}

export function getConfidenceLabel(confidence: 'high' | 'medium' | 'needs_review' | 'missing'): string {
  switch (confidence) {
    case 'high':
      return 'High confidence'
    case 'medium':
      return 'Medium confidence'
    case 'needs_review':
      return 'Needs review'
    case 'missing':
      return 'Missing'
    default:
      return 'Unknown'
  }
}
