'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { History } from 'lucide-react'
import { Navbar } from '@/components/navbar'
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
  const [selectedVersionForRestore, setSelectedVersionForRestore] = useState<ResumeVersion | null>(null)

  useEffect(() => {
    let active = true

    if (!user) {
      setVersions([])
      return () => {
        active = false
      }
    }

    loadVersions(resumeId, user.id).then((rows) => {
      if (active) setVersions(rows)
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
      void supabasePlaceholder.saveVersion({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        user_id: user.id,
        title: `Copy of ${title}`,
        version_number: versions.length + 1,
        saved_by: 'Manual',
        fit_score: 0,
        created_at: new Date().toISOString(),
      })
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

          <Link href="/resumes" className="text-primary hover:underline mb-6 inline-flex items-center gap-1">
            Back to Resumes
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Version History</h1>
            <p className="text-muted-foreground">Senior Developer Resume</p>
          </div>

          {statusMessage && (
            <div className="card-premium p-4 mb-6 bg-secondary">
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          )}

          {!user ? null : versions.length > 0 ? (
            <div className="space-y-6">
              {versions.map((version, idx) => (
                <VersionCard
                  key={version.id}
                  {...version}
                  isLatest={idx === 0}
                  index={idx}
                  total={versions.length}
                  onRestore={handleRestore}
                  onCompare={handleCompare}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : (
            <div className="card-premium p-8 text-center">
              <p className="text-muted-foreground">No versions found in Supabase for this resume.</p>
            </div>
          )}

          <div className="card-premium p-6 mt-8 bg-secondary">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              About Version History
            </h3>
            <p className="text-sm text-muted-foreground">
              Every save creates a new version of your resume. You can restore any previous version
              without losing the current one—restoring creates a new version from the selected state.
            </p>
          </div>
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
