'use client'

import { Copy, Trash2, Target } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Achievement } from '@/lib/types'

interface AchievementCardProps extends Achievement {}

export function AchievementCard({ id, title, description, date }: AchievementCardProps) {
  return (
    <div className="card-premium p-6">
      <div className="flex items-start gap-4">
        <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
