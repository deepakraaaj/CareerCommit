'use client'

import Link from 'next/link'
import { Plus, FileText, Clock3, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ResumeTable } from '@/components/resume/resume-table'
import { mockResumes } from '@/lib/mock-data'

export default function Dashboard() {
  const totalVersions = mockResumes.reduce((sum, r) => sum + (r.versions || 0), 0)
  const readyCount = mockResumes.filter((r) => r.status === 'Ready').length

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader
            title="Dashboard"
            description="Manage and track all your resumes in one place."
            action={
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </Link>
            }
          />

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Total Resumes" value={mockResumes.length} icon={<FileText className="w-8 h-8" />} />
            <StatCard label="Total Versions" value={totalVersions} icon={<Clock3 className="w-8 h-8" />} />
            <StatCard label="Ready to Export" value={readyCount} icon={<Download className="w-8 h-8" />} />
          </div>

          {mockResumes.length > 0 ? (
            <ResumeTable resumes={mockResumes} />
          ) : (
            <div className="card-premium p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first resume to get started.</p>
              <Link href="/upload">
                <Button>Upload Resume</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
