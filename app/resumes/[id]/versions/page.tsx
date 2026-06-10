'use client'

import { useState } from 'react'
import Link from 'next/link'
import { History } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { VersionCard } from '@/components/versions/version-card'
import { RestoreModal } from '@/components/versions/restore-modal'
import { CompareModal } from '@/components/versions/compare-modal'
import { mockVersions } from '@/lib/mock-data'
import type { VersionChange } from '@/lib/types'

export default function Versions() {
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

  const handleRestore = (id: number, title: string) => {
    setRestoreModal({ isOpen: true, versionTitle: title })
  }

  const handleConfirmRestore = () => {
    setRestoreModal({ isOpen: false, versionTitle: '' })
  }

  const handleCompare = (versionA: string, versionB: string) => {
    setCompareModal({
      isOpen: true,
      versionA,
      versionB,
      changes: [],
    })
  }

  const handleDuplicate = (id: number, title: string) => {
    console.log('Duplicating version:', id, title)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/resumes" className="text-primary hover:underline mb-6 inline-flex items-center gap-1">
            Back to Resumes
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Version History</h1>
            <p className="text-muted-foreground">Senior Developer Resume</p>
          </div>

          <div className="space-y-6">
            {mockVersions.map((version, idx) => (
              <VersionCard
                key={version.id}
                {...version}
                isLatest={idx === 0}
                index={idx}
                total={mockVersions.length}
                onRestore={handleRestore}
                onCompare={handleCompare}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>

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
