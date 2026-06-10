'use client'

import { Download, FileText, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportFormats } from '@/lib/mock-data'

interface ExportOptionsProps {
  selectedFormat: 'pdf' | 'docx' | null
  onExport: (format: 'pdf' | 'docx') => void
}

export function ExportOptions({ selectedFormat, onExport }: ExportOptionsProps) {
  const iconMap = {
    pdf: FileText,
    docx: FileDown,
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {exportFormats.map((option) => {
        const Icon = iconMap[option.type]
        return (
          <div
            key={option.format}
            role="button"
            tabIndex={0}
            onClick={() => onExport(option.type)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onExport(option.type)
              }
            }}
            className={`card-premium p-8 text-center transition-all cursor-pointer ${
              selectedFormat === option.type ? 'ring-2 ring-primary' : ''
            }`}
          >
            <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{option.format}</h3>
            <p className="text-muted-foreground text-sm mb-6">{option.desc}</p>
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download {option.format}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
