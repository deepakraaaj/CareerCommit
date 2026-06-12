'use client'

import { useRouter } from 'next/navigation'
import { Eye, Download, RotateCcw, Copy, GitCompare, Clock, Sparkles, Cpu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerDownload } from '@/lib/browser'
import { cn } from '@/lib/utils'
import type { ResumeVersion } from '@/lib/types'

interface VersionCardProps extends ResumeVersion {
  isLatest: boolean
  index: number
  total: number
  onRestore: (id: string | number, title: string) => void
  onCompare: (versionA: string, versionB: string) => void
  onDuplicate: (id: string | number, title: string) => void
}

export function VersionCard({
  id,
  versionNumber,
  name,
  title,
  date,
  time,
  changes,
  savedBy,
  template,
  fitStatus,
  isLatest,
  index,
  total,
  contentSnapshot,
  onRestore,
  onCompare,
  onDuplicate,
}: VersionCardProps) {
  const router = useRouter()

  const handleOpen = () => {
    if (contentSnapshot && Object.keys(contentSnapshot).length > 0) {
      router.push(`/editor?versionId=${id}`)
    } else {
      alert('This version does not have content snapshot saved. Create a new version to test.')
      router.push('/editor')
    }
  }

  const handleDownload = () => {
    triggerDownload(
      `${title.replace(/\s+/g, '_').toLowerCase()}.json`,
      JSON.stringify({ id, versionNumber, name, title, date, time, changes, savedBy, template, fitStatus }, null, 2),
      'application/json'
    )
  }

  const isAI = savedBy === 'AI Assist' || savedBy === 'JD Matcher'

  return (
    <div className="flex gap-4 sm:gap-6 group">
      {/* Timeline Node */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border transition-all duration-300 hover:scale-115 z-10',
            isLatest
              ? 'bg-primary text-primary-foreground border-primary/30 shadow-lg shadow-primary/20'
              : 'bg-card border-border/80 text-muted-foreground hover:border-primary/40 hover:text-foreground shadow-sm'
          )}
        >
          v{versionNumber}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div
          className={cn(
            'rounded-2xl border bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-card/70',
            isLatest
              ? 'border-primary/30 hover:border-primary/50 shadow-primary/2'
              : 'border-border/40 hover:border-border/80'
          )}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-foreground mb-0">{title}</h3>
              {versionNumber === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-500/10">
                  Initial draft
                </span>
              )}
              {isLatest && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 shadow-sm shadow-primary/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Current
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-secondary/35 px-2.5 py-1 rounded-lg border border-border/30 w-fit">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{date} · {time}</span>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
            <span className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium border",
              isAI 
                ? "bg-violet-500/10 text-violet-500 border-violet-500/20" 
                : "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20"
            )}>
              {isAI ? <Cpu className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {savedBy}
            </span>
            
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/40 px-2.5 py-1 text-[11px] font-medium border border-border/30">
              {template} template
            </span>

            {fitStatus > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <Sparkles className="h-3 w-3 animate-pulse" />
                {fitStatus}% match
              </span>
            )}
          </div>

          {/* Changes Description */}
          {changes && (
            <div className="border-l-2 border-primary/30 pl-3 py-0.5 mb-5">
              <p className="text-sm text-muted-foreground/90 italic mb-0 leading-relaxed">
                &ldquo;{changes}&rdquo;
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
            <Button 
              size="sm" 
              className="h-9 rounded-xl px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-sm shadow-primary/10 hover:shadow transition-all active:scale-95 gap-1.5" 
              onClick={handleOpen}
            >
              <Eye className="h-3.5 w-3.5" />
              Open
            </Button>

            {!isLatest && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl px-4 border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-semibold transition-all gap-1.5"
                  onClick={() => onRestore(id, title)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl px-4 border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-semibold transition-all gap-1.5"
                  onClick={() => onDuplicate(id, title)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl px-4 border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-semibold transition-all gap-1.5"
                  onClick={() => onCompare(name, 'Current')}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl px-4 border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-semibold transition-all gap-1.5 ml-auto"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
