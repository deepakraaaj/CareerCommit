'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VersionCard } from '@/components/versions/version-card'
import { RestoreModal } from '@/components/versions/restore-modal'
import { CompareModal } from '@/components/versions/compare-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadVersions } from '@/lib/supabase-loaders'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { ResumeVersion, VersionChange } from '@/lib/types'

export default function Versions() {
  const params = useParams<{ id: string }>()
  const resumeId = params?.id
  const { user, loading } = useAuth()
  const [restoreModal, setRestoreModal] = useState<{ isOpen: boolean; versionTitle: string }>({
    isOpen: false,
    versionTitle: '',
  })
  const [compareModal, setCompareModal] = useState<{
    isOpen: boolean
    versionA: string
    versionB: string
    changes: VersionChange[]
  }>({
    isOpen: false,
    versionA: '',
    versionB: '',
    changes: [],
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [resumeName, setResumeName] = useState('')
  const [fetching, setFetching] = useState(true)
  const [selectedVersionForRestore, setSelectedVersionForRestore] = useState<ResumeVersion | null>(null)

  useEffect(() => {
    let active = true

    if (!user) {
      setVersions([])
      setFetching(false)
      return () => {
        active = false
      }
    }

    setFetching(true)
    Promise.all([
      loadVersions(resumeId, user.id),
      supabasePlaceholder.getResumes(user.id, { light: true }),
    ]).then(([rows, resumes]) => {
      if (!active) return
      setVersions(rows)
      setResumeName(resumes.find((r) => String(r.id) === String(resumeId))?.name ?? '')
      setFetching(false)
    })

    return () => {
      active = false
    }
  }, [resumeId, user])

  const handleRestore = (id: string | number, title: string) => {
    const version = versions.find(v => v.id === id)
    setSelectedVersionForRestore(version || null)
    setRestoreModal({ isOpen: true, versionTitle: title })
  }

  const handleConfirmRestore = () => {
    if (selectedVersionForRestore?.contentSnapshot) {
      // Save the version content to localStorage
      localStorage.setItem('career-commit-editor-state', JSON.stringify(selectedVersionForRestore.contentSnapshot))
      setStatusMessage('✅ Version restored! Redirecting to editor...')

      // Redirect to editor
      setTimeout(() => {
        window.location.href = '/editor'
      }, 1000)
    } else {
      setStatusMessage('❌ Could not restore version - no content snapshot found')
    }

    setRestoreModal({ isOpen: false, versionTitle: '' })
    setSelectedVersionForRestore(null)
  }

  const handleCompare = (versionA: string, versionB: string) => {
    setCompareModal({
      isOpen: true,
      versionA,
      versionB,
      changes: [],
    })
  }

  const handleDuplicate = (id: string | number, title: string) => {
    setStatusMessage(`Duplicated ${title} locally.`)
    if (resumeId && user) {
      const nextVersionNumber = versions.reduce((max, version) => Math.max(max, version.versionNumber), 0) + 1
      void supabasePlaceholder.saveVersion({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        user_id: user.id,
        title: `Copy of ${title}`,
        version_number: nextVersionNumber,
        saved_by: 'Manual',
        fit_score: 0,
        created_at: new Date().toISOString(),
      })
    }
  }

  const orderedVersions = [...versions].sort((a, b) => a.versionNumber - b.versionNumber)

  return (
    <>
      <div className="relative min-h-screen bg-background">
        <div className="absolute inset-0 -z-10 premium-grid opacity-30" />
        <div className="absolute left-[-8rem] top-32 -z-10 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!user && !loading ? (
            <div className="card-premium p-10 text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Version History</h1>
              <p className="text-muted-foreground mb-6">
                Sign in to view and manage saved resume versions.
              </p>
              <Link href={`/login?next=/resumes/${resumeId}/versions`}>
                <Button>Sign in</Button>
              </Link>
            </div>
          ) : null}

          <Link
            href="/resumes"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All resumes
          </Link>

          <div className="mb-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Version History</h1>
              <p className="text-muted-foreground mb-0">
                {resumeName || 'Resume'}
                {versions.length > 0 &&
                  ` · ${versions.length} ${versions.length === 1 ? 'version' : 'versions'}`}
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className="card-premium mb-6 border-primary/30 bg-primary/5 p-4">
              <p className="text-sm mb-0">{statusMessage}</p>
            </div>
          )}

          {!user ? null : fetching ? (
            <div>
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                    {i === 0 && <div className="my-2 w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="card-premium animate-pulse space-y-3 p-5">
                      <div className="h-4 w-1/3 rounded bg-secondary" />
                      <div className="h-3 w-1/2 rounded bg-secondary" />
                      <div className="h-8 w-2/3 rounded bg-secondary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orderedVersions.length > 0 ? (
            <div>
              {orderedVersions.map((version, idx) => (
                <VersionCard
                  key={version.id}
                  {...version}
                  isLatest={idx === orderedVersions.length - 1}
                  index={idx}
                  total={orderedVersions.length}
                  onRestore={handleRestore}
                  onCompare={handleCompare}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : (
            <div className="card-premium p-12 text-center">
              <h3 className="text-lg font-semibold mb-1">No versions yet</h3>
              <p className="text-muted-foreground mb-0">
                Save this resume in the editor and each save will show up here.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            v1 is the initial draft. Every save after that creates a new version, and the newest
            save is marked Current. Restoring an older version never deletes anything — it simply
            becomes the new current version.
          </p>
        </div>
      </div>

      <RestoreModal
        isOpen={restoreModal.isOpen}
        versionTitle={restoreModal.versionTitle}
        onClose={() => setRestoreModal({ isOpen: false, versionTitle: '' })}
        onConfirm={handleConfirmRestore}
      />

      <CompareModal
        isOpen={compareModal.isOpen}
        versionA={compareModal.versionA}
        versionB={compareModal.versionB}
        changes={compareModal.changes}
        onClose={() =>
          setCompareModal({
            isOpen: false,
            versionA: '',
            versionB: '',
            changes: [],
          })
        }
      />
    </>
  )
}
