import { X, ArrowRight, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VersionChange } from '@/lib/types'

interface CompareModalProps {
  isOpen: boolean
  versionA: string
  versionB: string
  changes: VersionChange[]
  onClose: () => void
}

export function CompareModal({ isOpen, versionA, versionB, changes, onClose }: CompareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-6 sm:p-8 text-card-foreground shadow-2xl shadow-black/30 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <GitCompare className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-0">Compare Versions</h2>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground transition-all hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-border/50 bg-secondary/40 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">From (Older)</p>
              <p className="font-extrabold text-sm text-foreground truncate">{versionB}</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border/60 text-muted-foreground shadow-sm">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-primary mb-1">To (Newer)</p>
              <p className="font-extrabold text-sm text-foreground truncate">{versionA}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Detected Changes</p>
          {changes && changes.length > 0 ? (
            changes.map((change, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/35 transition-colors">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    change.type === 'added'
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                      : change.type === 'removed'
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/20'
                        : 'bg-indigo-500 shadow-sm shadow-indigo-500/20'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground mb-0">{change.section}</p>
                </div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                  change.type === 'added' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                    : change.type === 'removed' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                }`}>
                  {change.type === 'added' ? 'Added' : change.type === 'removed' ? 'Removed' : 'Updated'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-border/40 rounded-2xl bg-secondary/10 text-muted-foreground text-xs leading-relaxed">
              No structural differences detected between these two versions.
            </div>
          )}
        </div>

        <div className="bg-secondary/40 border border-border/30 rounded-2xl p-4 mb-6 text-xs text-muted-foreground/80 leading-relaxed">
          <span className="font-semibold text-foreground">Note:</span> This list shows section-level modifications only. To perform detailed, line-by-line comparison, we recommend opening both versions in separate windows.
        </div>

        <Button 
          onClick={onClose} 
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg transition-all active:scale-95"
        >
          Close Comparison
        </Button>
      </div>
    </div>
  )
}
