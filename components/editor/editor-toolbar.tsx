'use client'

import { Eye, Wand2, Copy, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditorToolbarProps {
  resumeName: string
  wordCount: number
  isSaved: boolean
  onSave: () => void
}

export function EditorToolbar({ resumeName, wordCount, isSaved, onSave }: EditorToolbarProps) {
  return (
    <>
      <div className="bg-card border-b border-border sticky top-16 z-30">
        <div className="px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{resumeName}</h2>
            <p className="text-xs text-muted-foreground">{wordCount} words</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Wand2 className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Version
            </Button>
          </div>
        </div>
        {isSaved && (
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 text-sm text-green-700 dark:text-green-400">
            Version saved successfully
          </div>
        )}
      </div>
    </>
  )
}
