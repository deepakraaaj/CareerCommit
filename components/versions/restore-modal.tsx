'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RestoreModalProps {
  isOpen: boolean
  versionTitle: string
  onClose: () => void
  onConfirm: () => void
}

export function RestoreModal({ isOpen, versionTitle, onClose, onConfirm }: RestoreModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Restore Version</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-foreground">
            Restore <span className="font-semibold">{versionTitle}</span>?
          </p>
          <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
            This will create a new version from the selected version. Your current version will not be deleted.
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Restore as New Version
          </Button>
        </div>
      </div>
    </div>
  )
}
