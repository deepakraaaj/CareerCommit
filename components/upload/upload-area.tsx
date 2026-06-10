'use client'

import { UploadCloud } from 'lucide-react'
import { supportedFormats } from '@/lib/mock-data'

interface UploadAreaProps {
  onFileUpload: (fileName: string) => void
}

export function UploadArea({ onFileUpload }: UploadAreaProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      onFileUpload(files[0].name)
    }
  }

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upload Your Resume</h1>
        <p className="text-lg text-muted-foreground">
          Import your existing resume to get started. We support PDF, DOCX, and TXT formats.
        </p>
      </div>

      <div className="card-premium p-8 mb-12">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.docx,.txt,.doc"
          />
          <div className="text-center">
            <UploadCloud className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Drag and drop your resume here</h3>
            <p className="text-muted-foreground mb-4">or click to browse your files</p>
            <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Max 10MB</p>
          </div>
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {supportedFormats.map((item) => (
          <div key={item.format} className="card-premium p-6 text-center">
            <div className="w-8 h-8 text-primary mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-1">{item.format}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
