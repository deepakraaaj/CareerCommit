'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VersionChange } from '@/lib/types'

interface CompareModalProps {
  isOpen: boolean
  versionA: string
  versionB: string
  changes: VersionChange[]
  onClose: () => void
}

const mockChanges: VersionChange[] = [
  { section: 'Summary', type: 'updated' },
  { section: 'Skills', type: 'updated' },
  { section: 'Experience bullets', type: 'added' },
  { section: 'Template', type: 'updated' },
  { section: 'Fit status', type: 'updated' },
]

export function CompareModal({ isOpen, versionA, versionB, onClose }: CompareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Compare Versions</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="font-semibold text-sm">{versionB}</p>
            </div>
            <p className="text-muted-foreground">→</p>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <p className="font-semibold text-sm">{versionA}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {mockChanges.map((change, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  change.type === 'added'
                    ? 'bg-green-500'
                    : change.type === 'removed'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{change.section}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-background text-muted-foreground">
                {change.type === 'added' ? 'Added' : change.type === 'removed' ? 'Removed' : 'Changed'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-secondary rounded-lg p-4 mb-6 text-sm text-muted-foreground">
          This shows section-level changes only. For detailed line-by-line comparison, open both versions side by side.
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  )
}
