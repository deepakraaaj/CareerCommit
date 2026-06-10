'use client'

import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MonthYearValue {
  /** 1-12 */
  month: number
  year: number
}

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatMonthYear(value: MonthYearValue | null): string {
  if (!value) return ''
  return `${MONTH_LABELS[value.month - 1]} ${value.year}`
}

export function parseMonthYear(text: string): MonthYearValue | null {
  const trimmed = text.trim()
  const match = trimmed.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})$/)
  if (!match) return null

  const monthIndex = MONTH_LABELS.findIndex(
    (label) => label.toLowerCase() === match[1].slice(0, 3).toLowerCase()
  )
  if (monthIndex === -1) return null

  return { month: monthIndex + 1, year: Number(match[2]) }
}

interface MonthYearPickerProps {
  value: MonthYearValue | null
  onChange: (value: MonthYearValue) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  disabled,
}: MonthYearPickerProps) {
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const [viewYear, setViewYear] = useState(value?.year ?? thisYear)

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) setViewYear(value?.year ?? thisYear)
      }}
    >
      <Popover.Trigger
        disabled={disabled}
        className={cn(
          'group flex w-full items-center gap-2 rounded border border-border bg-background px-3 py-2 text-sm transition-colors',
          'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary',
          'aria-expanded:border-primary aria-expanded:ring-2 aria-expanded:ring-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-aria-expanded:text-primary" />
        <span className={cn('flex-1 truncate text-left', !value && 'text-muted-foreground')}>
          {value ? formatMonthYear(value) : placeholder}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup
            className={cn(
              'w-60 origin-[var(--transform-origin)] transform rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl',
              'transition-[transform,opacity] duration-150 ease-out',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0'
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold tabular-nums">{viewYear}</span>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTH_LABELS.map((label, idx) => {
                const month = idx + 1
                const isSelected = value?.year === viewYear && value?.month === month
                const isCurrent = !isSelected && viewYear === thisYear && month === thisMonth

                return (
                  <Popover.Close
                    key={label}
                    onClick={() => onChange({ month, year: viewYear })}
                    className={cn(
                      'rounded-lg py-1.5 text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted',
                      isCurrent && 'ring-1 ring-inset ring-primary/40'
                    )}
                  >
                    {label}
                  </Popover.Close>
                )
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
