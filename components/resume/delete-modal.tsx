'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteModalProps {
  isOpen: boolean
  resumeName: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteModal({ isOpen, resumeName, onClose, onConfirm }: DeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-xl font-bold">Delete Resume</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-foreground">
            Delete <span className="font-semibold">{resumeName}</span>?
          </p>
          <div className="bg-destructive/5 rounded-lg p-4 text-sm text-destructive ring-1 ring-destructive/20">
            This will permanently delete the resume and all its versions. This action cannot be undone.
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Resume'}
          </Button>
        </div>
      </div>
    </div>
  )
}
