'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { Resume } from '@/lib/types'

interface ResumeCardProps extends Resume {}

export function ResumeCard({ id, name, created, modified, wordCount }: ResumeCardProps) {
  const router = useRouter()
  const [isDeleted, setIsDeleted] = useState(false)

  if (isDeleted) return null

  return (
    <div className="card-premium p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <FileText className="w-8 h-8 text-primary" />
        <button
          type="button"
          onClick={() => {
            void supabasePlaceholder.deleteResume(String(id))
            setIsDeleted(true)
          }}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-semibold text-lg mb-2">{name}</h3>

      <div className="space-y-2 mb-4 flex-1">
        <p className="text-sm text-muted-foreground">Created: {formatDate(created)}</p>
        <p className="text-sm text-muted-foreground">Modified: {formatDate(modified)}</p>
        <p className="text-sm text-muted-foreground">{wordCount} words</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => router.push(`/resumes/${id}/versions`)}
      >
        <Eye className="w-4 h-4 mr-2" />
        View Versions
      </Button>
    </div>
  )
}
