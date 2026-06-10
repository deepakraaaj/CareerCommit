'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, FileText, Clock3, Download, LogIn } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ResumeTable } from '@/components/resume/resume-table'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'
import type { Resume } from '@/lib/types'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])

  useEffect(() => {
    let active = true

    if (!user) {
      setResumes([])
      return () => {
        active = false
      }
    }

    loadResumes(user.id).then((rows) => {
      if (active) setResumes(rows)
    })

    return () => {
      active = false
    }
  }, [user])

  const totalVersions = resumes.reduce((sum, r) => sum + (r.versions || 0), 0)
  const readyCount = resumes.filter((r) => r.status === 'Ready').length

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader
            title="Dashboard"
            description="Manage and track your saved resume history."
            action={
              user ? (
                <Link href="/upload">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Resume
                  </Button>
                </Link>
              ) : (
                <Link href="/login?next=/dashboard">
                  <Button variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to manage history
                  </Button>
                </Link>
              )
            }
          />

          {!user && !loading ? (
            <div className="card-premium p-10 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">History requires a login</h3>
              <p className="text-muted-foreground mb-6">
                You can still use the editor and upload flow without signing in. Sign in when you want
                the dashboard, versions, and saved history tied to your account.
              </p>
              <Link href="/login?next=/dashboard">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <StatCard label="Total Resumes" value={resumes.length} icon={<FileText className="w-8 h-8" />} />
                <StatCard label="Total Versions" value={totalVersions} icon={<Clock3 className="w-8 h-8" />} />
                <StatCard label="Ready to Export" value={readyCount} icon={<Download className="w-8 h-8" />} />
              </div>

              {resumes.length > 0 ? (
                <ResumeTable resumes={resumes} />
              ) : (
                <div className="card-premium p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your first resume to start saving history.
                  </p>
                  <Link href="/upload">
                    <Button>Upload Resume</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
