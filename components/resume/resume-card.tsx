'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, History, ArrowRight, Calendar, Clock } from 'lucide-react'
import { DeleteModal } from '@/components/resume/delete-modal'
import { formatDate } from '@/lib/utils'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { Resume } from '@/lib/types'

interface ResumeCardProps extends Resume {}

export function ResumeCard({ id, name, created, lastModified, versions, status }: ResumeCardProps) {
  const router = useRouter()
  const [isDeleted, setIsDeleted] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (isDeleted) return null

  const versionCount = versions ?? 0
  const isReady = status === 'Ready'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/resumes/${id}/versions`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(`/resumes/${id}/versions`)
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
    >
      {/* Decorative Glow on Hover */}
      <span className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 -z-10" />

      {/* Mini Mockup Resume Preview */}
      <div className="relative h-28 w-full bg-muted/40 border-b border-border/40 overflow-hidden flex flex-col p-4 gap-2 transition-colors duration-300 group-hover:bg-muted/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <div className="h-2 w-12 rounded bg-foreground/15" />
          </div>
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            isReady 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            <span className={`h-1 w-1 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {status || 'Draft'}
          </span>
        </div>
        
        {/* Mock content lines */}
        <div className="space-y-1.5 mt-2">
          <div className="h-1.5 w-full rounded bg-foreground/10" />
          <div className="h-1.5 w-5/6 rounded bg-foreground/10" />
          <div className="h-1.5 w-4/6 rounded bg-foreground/10" />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {name}
            </h3>
            
            {/* Metadata lines with icons */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>Edited {lastModified?.toLowerCase() ?? 'recently'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>Created {formatDate(created)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteModalOpen(true)
            }}
            className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Card Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/20">
            <History className="h-3.5 w-3.5 text-primary" />
            {versionCount} {versionCount === 1 ? 'version' : 'versions'}
          </span>
          
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition-all group-hover:gap-1.5">
            Open workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        resumeName={name}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          setDeleting(true)
          try {
            const success = await supabasePlaceholder.deleteResume(String(id))
            if (success) {
              setIsDeleted(true)
              setDeleteModalOpen(false)
            } else {
              alert('Failed to delete resume. Please try again.')
              setDeleting(false)
            }
          } catch (error) {
            console.error('Delete error:', error)
            alert('Error deleting resume. Please try again.')
            setDeleting(false)
          }
        }}
      />
    </div>
  )
}
