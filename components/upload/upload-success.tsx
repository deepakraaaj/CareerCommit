'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadSuccessProps {
  fileName: string
}

export function UploadSuccess({ fileName }: UploadSuccessProps) {
  return (
    <>
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Resume Uploaded Successfully!</h1>
          <p className="text-muted-foreground">{fileName}</p>
        </div>
      </div>

      <div className="card-premium p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">What&apos;s next?</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Review and Edit</h3>
              <p className="text-sm text-muted-foreground">
                Go to the visual editor to review your resume and make any changes you need.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Save a Version</h3>
              <p className="text-sm text-muted-foreground">
                Save your changes to create a version. You can always restore previous versions later.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Export When Ready</h3>
              <p className="text-sm text-muted-foreground">
                Export your resume as PDF or DOCX whenever you need to apply to a job.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/editor" className="flex-1">
          <Button className="w-full">Go to Editor</Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    </>
  )
}
