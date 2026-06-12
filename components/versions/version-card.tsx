'use client'

import { useRouter } from 'next/navigation'
import { Eye, Download, RotateCcw, Copy, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerDownload } from '@/lib/browser'
import { cn } from '@/lib/utils'
import type { ResumeVersion } from '@/lib/types'

interface VersionCardProps extends ResumeVersion {
  isLatest: boolean
  index: number
  total: number
  onRestore: (id: string | number, title: string) => void
  onCompare: (versionA: string, versionB: string) => void
  onDuplicate: (id: string | number, title: string) => void
}

export function VersionCard({
  id,
  versionNumber,
  name,
  title,
  date,
  time,
  changes,
  savedBy,
  template,
  fitStatus,
  isLatest,
  index,
  total,
  contentSnapshot,
  onRestore,
  onCompare,
  onDuplicate,
}: VersionCardProps) {
  const router = useRouter()

  const handleOpen = () => {
    if (contentSnapshot && Object.keys(contentSnapshot).length > 0) {
      // Pass version ID via URL instead of localStorage
      router.push(`/editor?versionId=${id}`)
    } else {
      alert('This version does not have content snapshot saved. Create a new version to test.')
      router.push('/editor')
    }
  }

  const handleDownload = () => {
    triggerDownload(
      `${title.replace(/\s+/g, '_').toLowerCase()}.json`,
      JSON.stringify({ id, versionNumber, name, title, date, time, changes, savedBy, template, fitStatus }, null, 2),
      'application/json'
    )
  }

  return (
    <div className="flex gap-4 sm:gap-5">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1',
            isLatest
              ? 'bg-primary text-primary-foreground ring-primary shadow-sm shadow-primary/30'
              : 'bg-card text-muted-foreground ring-border'
          )}
        >
          v{versionNumber}
        </div>
        {index < total - 1 && <div className="my-2 w-px flex-1 bg-border" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-6">
        <div
          className={cn(
            'card-premium p-5 transition-colors',
            isLatest && 'border-primary/40'
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              {isLatest && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-0">
              {date} · {time}
            </p>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{savedBy}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{template} template</span>
            {fitStatus > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="font-medium text-primary">{fitStatus}% fit</span>
              </>
            )}
          </div>

          {changes && <p className="mt-3 text-sm text-muted-foreground mb-0">{changes}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            <Button size="sm" className="gap-1.5" onClick={handleOpen}>
              <Eye className="h-3.5 w-3.5" />
              Open
            </Button>

            {!isLatest && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => onRestore(id, title)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => onDuplicate(id, title)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => onCompare(name, 'Current')}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
