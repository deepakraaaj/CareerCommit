import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AISuggestionModalProps {
  isOpen: boolean
  originalText: string
  suggestedText: string
  actionType: 'improve' | 'shorten' | 'fix_grammar'
  onApply: (text: string) => void
  onClose: () => void
}

export function AISuggestionModal({
  isOpen,
  originalText,
  suggestedText,
  actionType,
  onApply,
  onClose,
}: AISuggestionModalProps) {
  if (!isOpen) return null

  const getTitle = () => {
    switch (actionType) {
      case 'improve':
        return 'Improve with AI'
      case 'shorten':
        return 'Shorten with AI'
      case 'fix_grammar':
        return 'Fix Grammar'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Original
            </label>
            <div className="p-4 bg-secondary rounded-lg border border-border text-sm">
              {originalText}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Suggested
            </label>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-balance">
              {suggestedText}
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg text-sm text-muted-foreground">
            Review the suggestion above. Click "Use this" to accept or close to discard.
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border justify-end">
          <Button variant="outline" onClick={onClose}>
            Discard
          </Button>
          <Button
            onClick={() => {
              onApply(suggestedText)
              onClose()
            }}
          >
            Use this
          </Button>
        </div>
      </div>
    </div>
  )
}
