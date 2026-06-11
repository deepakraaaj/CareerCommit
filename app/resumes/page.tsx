'use client'

import Link from 'next/link'
import { Plus, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { ResumeCard } from '@/components/resume/resume-card'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'
import type { Resume } from '@/lib/types'

export default function Resumes() {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader
            title="My Resumes"
            description="Browse and manage your saved resume history."
            action={
              user ? (
                <Link href="/editor?new=1">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </Link>
              ) : (
                <Link href="/login?next=/resumes">
                  <Button variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to view history
                  </Button>
                </Link>
              )
            }
          />

          {!user && !loading ? (
            <div className="card-premium p-10 text-center">
              <h3 className="text-lg font-semibold mb-2">History requires a login</h3>
              <p className="text-muted-foreground mb-6">
                Your saved resumes stay tied to your account. Sign in to see them here.
              </p>
              <Link href="/login?next=/resumes">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.length > 0 ? (
                resumes.map((resume) => <ResumeCard key={resume.id} {...resume} />)
              ) : (
                <div className="card-premium p-10 text-center md:col-span-2 lg:col-span-3">
                  <p className="text-muted-foreground">No resumes found for this account.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
