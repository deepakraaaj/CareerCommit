'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  formatMonthYear,
  parseMonthYear,
  MonthYearPicker,
  type MonthYearValue,
} from './month-year-picker'

interface DateRange {
  start: MonthYearValue | null
  end: MonthYearValue | null
  isPresent: boolean
}

export function parseDateRange(value: string): DateRange {
  const trimmed = value.trim()
  if (!trimmed) return { start: null, end: null, isPresent: false }

  const [startRaw, endRaw = ''] = trimmed.split(/\s*[–—-]\s*/)
  const isPresent = /^present$/i.test(endRaw.trim())

  return {
    start: parseMonthYear(startRaw ?? ''),
    end: isPresent ? null : parseMonthYear(endRaw),
    isPresent,
  }
}

export function formatDateRange({ start, end, isPresent }: DateRange): string {
  const startLabel = formatMonthYear(start)
  const endLabel = isPresent ? 'Present' : formatMonthYear(end)

  if (!startLabel) return endLabel
  if (!endLabel) return startLabel
  return `${startLabel} – ${endLabel}`
}

interface DateRangePickerProps {
  value: string
  onChange: (value: string) => void
  presentLabel?: string
  startPlaceholder?: string
  endPlaceholder?: string
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  presentLabel = 'Currently here',
  startPlaceholder = 'Start date',
  endPlaceholder = 'End date',
  className,
}: DateRangePickerProps) {
  const { start, end, isPresent } = useMemo(() => parseDateRange(value), [value])

  const emit = (next: DateRange) => onChange(formatDateRange(next))

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-2 gap-2">
        <MonthYearPicker
          value={start}
          onChange={(month) => emit({ start: month, end, isPresent })}
          placeholder={startPlaceholder}
        />
        {isPresent ? (
          <div className="flex items-center justify-center gap-1.5 rounded border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Present
          </div>
        ) : (
          <MonthYearPicker
            value={end}
            onChange={(month) => emit({ start, end: month, isPresent })}
            placeholder={endPlaceholder}
          />
        )}
      </div>
      <label className="flex w-fit cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <input
          type="checkbox"
          checked={isPresent}
          onChange={(e) =>
            emit({ start, end: e.target.checked ? null : end, isPresent: e.target.checked })
          }
          className="h-3.5 w-3.5 rounded border-border accent-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {presentLabel}
      </label>
    </div>
  )
}
