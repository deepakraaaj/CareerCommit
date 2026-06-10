interface FitCheckerProps {
  wordCount: number
  readability: number
}

export function FitChecker({ wordCount, readability }: FitCheckerProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="flex gap-4 items-center p-3 bg-secondary/30 rounded-lg border border-border">
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Readability</div>
        <div className={`text-lg font-bold ${getScoreColor(readability)}`}>{readability}%</div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Words</div>
        <div className="text-lg font-bold text-foreground">{wordCount}</div>
      </div>
    </div>
  )
}
