import { Edit2, Wand2, Minimize2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

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
    <div className="flex items-start gap-3 p-3 bg-white border border-slate-200/80 rounded-lg group hover:border-slate-300 hover:bg-slate-50/30 transition-all shadow-xxs">
      <span className="text-xs font-semibold text-slate-400 pt-1 select-none">•</span>

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
          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800"
        />
      ) : (
        <p className="flex-1 text-sm leading-relaxed text-slate-700">{bullet.text || <span className="italic text-slate-400">Empty achievement - Click edit to write...</span>}</p>
      )}

      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          title="Edit"
          onClick={() => onEdit(bullet.id, bullet.text)}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          title="Improve with AI"
          onClick={() => onImprove(bullet.id, bullet.text)}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5" />
        </button>

        <button
          title="Shorten"
          onClick={() => onShorten(bullet.id, bullet.text)}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>

        <button
          title="Delete"
          onClick={() => onDelete(bullet.id)}
          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {canMoveUp && (
          <button
            title="Move up"
            onClick={() => onMoveUp(bullet.id)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}

        {canMoveDown && (
          <button
            title="Move down"
            onClick={() => onMoveDown(bullet.id)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
