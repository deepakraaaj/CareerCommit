'use client'

import { useRouter } from 'next/navigation'
import { Eye, Download, RotateCcw, Copy, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerDownload } from '@/lib/browser'
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
    console.log('[VersionCard] Opening:', title, 'contentSnapshot:', contentSnapshot)
    if (contentSnapshot && Object.keys(contentSnapshot).length > 0) {
      // Pass version ID via URL instead of localStorage
      router.push(`/editor?versionId=${id}`)
    } else {
      console.log('[VersionCard] ⚠️ No content snapshot available for this version')
      alert('This version does not have content snapshot saved. Create a new version to test.')
      router.push('/editor')
    }
  }

  const handleDownload = () => {
    triggerDownload(
      `${title.replace(/\s+/g, '_').toLowerCase()}.json`,
      JSON.stringify({ id, name, title, date, time, changes, savedBy, template, fitStatus }, null, 2),
      'application/json'
    )
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-start gap-4">
        {/* Timeline Dot */}
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${isLatest ? 'bg-primary' : 'bg-border'} mt-2`} />
          {index < total - 1 && <div className="w-0.5 h-24 bg-border" />}
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                {isLatest && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {date} at {time}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
              {savedBy}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
              {template}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
              Fit: {fitStatus}%
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{changes}</p>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleOpen}>
              <Eye className="w-4 h-4" />
              Open
            </Button>

            {!isLatest && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onRestore(id, title)}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onDuplicate(id, title)}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onCompare(name, 'Current')}
                >
                  <GitCompare className="w-4 h-4" />
                  Compare
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
