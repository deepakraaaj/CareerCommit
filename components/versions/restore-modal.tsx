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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-6 sm:p-8 text-card-foreground shadow-2xl shadow-black/30 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Restore Version</h2>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground transition-all hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-foreground text-base leading-relaxed">
            Are you sure you want to restore <span className="font-extrabold text-primary">{versionTitle}</span>?
          </p>
          <div className="bg-secondary/50 border border-border/40 rounded-2xl p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            This will create a new current snapshot in the editor from the selected version. Your current version will not be overwritten or lost.
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-11 rounded-xl border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg transition-all active:scale-95"
          >
            Confirm Restore
          </Button>
        </div>
      </div>
    </div>
  )
}
