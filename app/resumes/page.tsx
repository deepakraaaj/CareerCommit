'use client'

import Link from 'next/link'
import { Plus, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { ResumeCard } from '@/components/resume/resume-card'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'
import type { Resume } from '@/lib/types'

export default function Resumes() {
  const { user, loading } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let active = true

    if (!user) {
      setResumes([])
      setFetching(false)
      return () => {
        active = false
      }
    }

    setFetching(true)
    loadResumes(user.id, { light: true }).then((rows) => {
      if (active) {
        setResumes(rows)
        setFetching(false)
      }
    })

    return () => {
      active = false
    }
  }, [user])

  return (
    <>
      <div className="relative min-h-screen bg-background">
        <div className="absolute inset-0 -z-10 premium-grid opacity-30" />
        <div className="absolute left-[-8rem] top-32 -z-10 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
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
          ) : (!user && loading) || fetching ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-premium p-5 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-secondary" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-3/4 rounded bg-secondary" />
                      <div className="h-3 w-1/2 rounded bg-secondary" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <div className="h-3 w-20 rounded bg-secondary" />
                    <div className="h-4 w-24 rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : resumes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} {...resume} />
              ))}
            </div>
          ) : (
            <div className="card-premium p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No resumes yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first resume and every save will be versioned here.
              </p>
              <Link href="/editor?new=1">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
