'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SaveVersionData {
  title: string
  description: string
  source: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
}

interface SaveVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SaveVersionData) => void
  isSaving?: boolean
}

export function SaveVersionModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: SaveVersionModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState<'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'>('Manual')

  if (!isOpen) return null

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a version title')
      return
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      source,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSource('Manual')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Save New Version</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Version Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Version Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="e.g., Added AWS Certifications"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">What Changed? (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="Describe your changes... (leave blank if just title is enough)"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium mb-2">Source</label>
            <div className="relative">
              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value as 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser')
                }
                disabled={isSaving}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 appearance-none"
              >
                <option value="Manual">Manual Edit</option>
                <option value="AI Assist">AI Assist</option>
                <option value="JD Matcher">JD Matcher</option>
                <option value="Upload Parser">Upload Parser</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-3 mb-6 text-xs text-muted-foreground">
          <p>Each version saves your resume as it is right now. You can always restore older versions later.</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Version'}
          </Button>
        </div>
      </div>
    </div>
  )
}
