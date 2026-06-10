import { Edit2, Wand2, Minimize2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulletEditorProps {
  bullet: {
    id: string
    text: string
  }
  onEdit: (id: string, text: string) => void
  onImprove: (id: string, text: string) => void
  onShorten: (id: string, text: string) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  isEditing: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

export function BulletEditor({
  bullet,
  onEdit,
  onImprove,
  onShorten,
  onDelete,
  onMoveUp,
  onMoveDown,
  isEditing,
  canMoveUp,
  canMoveDown,
}: BulletEditorProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg group hover:bg-secondary/80 transition-colors">
      <span className="text-xs font-semibold text-muted-foreground pt-1">•</span>

      {isEditing ? (
        <input
          type="text"
          defaultValue={bullet.text}
          onBlur={(e) => {
            onEdit(bullet.id, e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEdit(bullet.id, e.currentTarget.value)
            }
          }}
          autoFocus
          className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <p className="flex-1 text-sm leading-relaxed">{bullet.text}</p>
      )}

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          title="Edit"
          onClick={() => onEdit(bullet.id, bullet.text)}
          className="p-1.5 hover:bg-background rounded transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <button
          title="Improve"
          onClick={() => onImprove(bullet.id, bullet.text)}
          className="p-1.5 hover:bg-background rounded transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <button
          title="Shorten"
          onClick={() => onShorten(bullet.id, bullet.text)}
          className="p-1.5 hover:bg-background rounded transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <button
          title="Delete"
          onClick={() => onDelete(bullet.id)}
          className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>

        {canMoveUp && (
          <button
            title="Move up"
            onClick={() => onMoveUp(bullet.id)}
            className="p-1.5 hover:bg-background rounded transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {canMoveDown && (
          <button
            title="Move down"
            onClick={() => onMoveDown(bullet.id)}
            className="p-1.5 hover:bg-background rounded transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
