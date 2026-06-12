'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, History, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VersionCard } from '@/components/versions/version-card'
import { RestoreModal } from '@/components/versions/restore-modal'
import { CompareModal } from '@/components/versions/compare-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadVersions } from '@/lib/supabase-loaders'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { ResumeVersion, VersionChange } from '@/lib/types'

function getVersionChanges(
  olderVersion?: ResumeVersion,
  newerVersion?: ResumeVersion
): VersionChange[] {
  const changesList: VersionChange[] = []
  
  if (!olderVersion || !newerVersion) {
    return []
  }

  // 1. If sectionChanges exists (directly from database record), use it first
  if (olderVersion.sectionChanges) {
    Object.entries(olderVersion.sectionChanges).forEach(([section, type]) => {
      if (type !== 'unchanged') {
        changesList.push({
          section: section.charAt(0).toUpperCase() + section.slice(1),
          type: type === 'modified' ? 'updated' : (type as 'added' | 'removed'),
        })
      }
    })
    if (changesList.length > 0) return changesList
  }

  // 2. Otherwise, dynamically compare content snapshots
  const oldSnap = olderVersion.contentSnapshot
  const newSnap = newerVersion.contentSnapshot

  if (!oldSnap || !newSnap) {
    return [
      { section: 'Content Details', type: 'updated' }
    ]
  }

  const checkStringField = (field: string, label: string) => {
    const valOld = (oldSnap[field] as string) || ''
    const valNew = (newSnap[field] as string) || ''
    if (valOld !== valNew) {
      if (!valOld && valNew) changesList.push({ section: label, type: 'added' })
      else if (valOld && !valNew) changesList.push({ section: label, type: 'removed' })
      else changesList.push({ section: label, type: 'updated' })
    }
  }

  checkStringField('summary', 'Professional Summary')
  checkStringField('education', 'Education Section')
  checkStringField('skills', 'Skills Section')

  const expOld = (oldSnap.experience || oldSnap.workExperience) as any[] | undefined
  const expNew = (newSnap.experience || newSnap.workExperience) as any[] | undefined
  if (JSON.stringify(expOld) !== JSON.stringify(expNew)) {
    if (Array.isArray(expOld) && Array.isArray(expNew)) {
      if (expOld.length < expNew.length) changesList.push({ section: 'Work Experience', type: 'added' })
      else if (expOld.length > expNew.length) changesList.push({ section: 'Work Experience', type: 'removed' })
      else changesList.push({ section: 'Work Experience', type: 'updated' })
    } else {
      changesList.push({ section: 'Work Experience', type: 'updated' })
    }
  }

  const projOld = (oldSnap.projects || oldSnap.achievements) as any[] | undefined
  const projNew = (newSnap.projects || newSnap.achievements) as any[] | undefined
  if (JSON.stringify(projOld) !== JSON.stringify(projNew)) {
    if (Array.isArray(projOld) && Array.isArray(projNew)) {
      if (projOld.length < projNew.length) changesList.push({ section: 'Projects & Achievements', type: 'added' })
      else if (projOld.length > projNew.length) changesList.push({ section: 'Projects & Achievements', type: 'removed' })
      else changesList.push({ section: 'Projects & Achievements', type: 'updated' })
    } else {
      changesList.push({ section: 'Projects & Achievements', type: 'updated' })
    }
  }

  if (changesList.length === 0 && JSON.stringify(oldSnap) !== JSON.stringify(newSnap)) {
    changesList.push({ section: 'Resume Settings or Styling', type: 'updated' })
  }

  return changesList
}

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
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleCompare = (name: string, otherName: string) => {
    const versionAObj = versions.find(v => v.name === name || v.title === name)
    const latestVersion = versions.find((v) => v.versionNumber === Math.max(...versions.map((x) => x.versionNumber)))

    const computedChanges = getVersionChanges(versionAObj, latestVersion)

    setCompareModal({
      isOpen: true,
      versionA: latestVersion?.title || 'Current',
      versionB: versionAObj?.title || name,
      changes: computedChanges,
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

  const orderedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  const filteredVersions = orderedVersions.filter((version) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return (
      version.title.toLowerCase().includes(query) ||
      version.changes.toLowerCase().includes(query) ||
      `v${version.versionNumber}`.includes(query) ||
      version.savedBy.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden pb-16">
        {/* Dynamic Glowing Mesh Background */}
        <div className="absolute inset-0 -z-10 premium-grid opacity-30" />
        <div className="absolute left-[-10%] top-[10%] -z-10 h-[35rem] w-[35rem] rounded-full bg-indigo-500/10 blur-[128px] dark:bg-indigo-600/5" />
        <div className="absolute right-[-10%] top-[30%] -z-10 h-[35rem] w-[35rem] rounded-full bg-pink-500/10 blur-[128px] dark:bg-pink-600/5" />

        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
          {!user && !loading ? (
            <div className="max-w-md mx-auto my-12 text-center p-10 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xl">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                Version History
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Your resume versions are stored safely under your profile. Sign in to view and restore older drafts.
              </p>
              <Link href={`/login?next=/resumes/${resumeId}/versions`}>
                <Button className="w-full h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                  Sign in
                </Button>
              </Link>
            </div>
          ) : null}

          <Link
            href="/resumes"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm group-hover:border-primary/30 group-hover:text-primary transition-all">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back to Dashboard
          </Link>

          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <span>Resume Timeline</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                Version History
              </h1>
              <p className="text-muted-foreground text-sm font-medium mb-0">
                {resumeName || 'Resume'}
                {versions.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-border/50">
                    {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-0 flex items-center gap-2">
                {statusMessage}
              </p>
            </div>
          )}

          {versions.length > 0 && (
            <div className="mb-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <input
                type="text"
                placeholder="Search versions by title, changes, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {!user ? null : fetching ? (
            <div className="space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-secondary/80 border border-border/40" />
                    {i === 0 && <div className="my-2 w-px flex-1 bg-border/40 border-dashed" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md animate-pulse space-y-4 p-5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-1/3 rounded-lg bg-secondary/80" />
                        <div className="h-4 w-1/4 rounded-lg bg-secondary/80" />
                      </div>
                      <div className="h-3.5 w-1/2 rounded-lg bg-secondary/80" />
                      <div className="h-9 w-2/3 rounded-xl bg-secondary/80 pt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVersions.length > 0 ? (
            <div className="relative">
              {/* Timeline Connector Line */}
              <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/40 via-border/50 to-border/10 -z-10" />
              
              <div className="space-y-0">
                {filteredVersions.map((version, idx) => (
                  <VersionCard
                    key={version.id}
                    {...version}
                    isLatest={version.id === orderedVersions[0]?.id}
                    index={idx}
                    total={filteredVersions.length}
                    onRestore={handleRestore}
                    onCompare={handleCompare}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          ) : versions.length > 0 ? (
            <div className="text-center py-12 rounded-3xl border border-border/40 bg-card/20 backdrop-blur-sm shadow-sm">
              <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-foreground mb-1">No matching versions</h3>
              <p className="text-xs text-muted-foreground mb-4">Try checking your spelling or search for a different keyword.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="rounded-xl border-border/60 hover:bg-secondary font-semibold"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md p-12 text-center shadow-xl">
              <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-1 text-foreground">No versions yet</h3>
              <p className="text-sm text-muted-foreground mb-0 max-w-sm mx-auto">
                Save your changes in the resume editor and each snapshot will be recorded here automatically.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm p-4 text-xs text-muted-foreground/80 leading-relaxed">
            <span className="font-semibold text-foreground">Tip:</span> The newest save is marked <span className="font-bold text-primary">Current</span> at the top. v1 is the initial draft further down. Restoring an older version never deletes anything — it simply clones that state and creates a brand-new current version.
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
