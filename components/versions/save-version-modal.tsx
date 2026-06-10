'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SaveVersionModalProps {
  isOpen: boolean
  currentVersion: number
  onClose: () => void
  onSave: (data: { title: string; changeNote: string; source: string }) => void
}

export function SaveVersionModal({
  isOpen,
  currentVersion,
  onClose,
  onSave,
}: SaveVersionModalProps) {
  const [title, setTitle] = useState(`Version ${currentVersion + 1}`)
  const [changeNote, setChangeNote] = useState('')
  const [source, setSource] = useState('Manual')

  if (!isOpen) return null

  const handleSave = () => {
    onSave({ title, changeNote, source })
    setTitle(`Version ${currentVersion + 1}`)
    setChangeNote('')
    setSource('Manual')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Save New Version</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Version Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Added AWS Certifications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Change Note</label>
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe what you changed..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Manual</option>
              <option>AI Assist</option>
              <option>JD Matcher</option>
              <option>Upload Parser</option>
            </select>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-4 mb-6 text-sm text-muted-foreground">
          Saving creates a new version. Your previous versions will not be changed.
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Version
          </Button>
        </div>
      </div>
    </div>
  )
}
