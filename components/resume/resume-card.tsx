'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, History, ArrowRight } from 'lucide-react'
import { DeleteModal } from '@/components/resume/delete-modal'
import { formatDate } from '@/lib/utils'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { Resume } from '@/lib/types'

interface ResumeCardProps extends Resume {}

export function ResumeCard({ id, name, created, lastModified, versions }: ResumeCardProps) {
  const router = useRouter()
  const [isDeleted, setIsDeleted] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (isDeleted) return null

  const versionCount = versions ?? 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/resumes/${id}/versions`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(`/resumes/${id}/versions`)
      }}
      className="group card-premium relative p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-snug">{name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground mb-0">
            Edited {lastModified?.toLowerCase() ?? 'recently'} · Created {formatDate(created)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteModalOpen(true)
          }}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          {versionCount} {versionCount === 1 ? 'version' : 'versions'}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
          View history
          <ArrowRight className="h-4 w-4" />
        </span>
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
