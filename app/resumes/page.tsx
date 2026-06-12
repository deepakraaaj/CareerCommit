'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, LogIn, Search, LayoutGrid, List, ArrowUpDown, History, FileText, Trash2, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ResumeCard } from '@/components/resume/resume-card'
import { DeleteModal } from '@/components/resume/delete-modal'
import { useAuth } from '@/components/auth/auth-provider'
import { loadResumes } from '@/lib/supabase-loaders'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'
import type { Resume } from '@/lib/types'

export default function Resumes() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [fetching, setFetching] = useState(true)
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'name'>('modified')
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid')
  
  // Deletion state for List View
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedResumeForDelete, setSelectedResumeForDelete] = useState<Resume | null>(null)

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

  // Filtering & Sorting
  const filteredAndSortedResumes = resumes
    .filter((resume) => resume.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'created') {
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      }
      // default: modified
      return new Date(b.modified).getTime() - new Date(a.modified).getTime()
    })

  const handleDeleteClick = (resume: Resume) => {
    setSelectedResumeForDelete(resume)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedResumeForDelete) return
    const success = await supabasePlaceholder.deleteResume(String(selectedResumeForDelete.id))
    if (success) {
      setResumes((current) => current.filter((item) => item.id !== selectedResumeForDelete.id))
      setDeleteModalOpen(false)
      setSelectedResumeForDelete(null)
    } else {
      alert('Failed to delete resume. Please try again.')
    }
  }

  return (
    <>
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden pb-16">
        {/* Dynamic Glowing Mesh Background */}
        <div className="absolute inset-0 -z-10 premium-grid opacity-30" />
        <div className="absolute left-[-10%] top-[10%] -z-10 h-[40rem] w-[40rem] rounded-full bg-indigo-500/10 blur-[128px] dark:bg-indigo-600/5" />
        <div className="absolute right-[-10%] top-[30%] -z-10 h-[40rem] w-[40rem] rounded-full bg-pink-500/10 blur-[128px] dark:bg-pink-600/5" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <span>Resume Workspace</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                My Resumes
              </h1>
              <p className="text-muted-foreground text-base max-w-xl">
                Design, optimize, and organize your resumes. Every change is preserved.
              </p>
            </div>
            {user && (
              <div className="shrink-0">
                <Link href="/editor?new=1">
                  <Button className="h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {!user && !loading ? (
            /* Not Logged In View */
            <div className="max-w-md mx-auto my-12 text-center p-10 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xl">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Workspace Locked</h3>
              <p className="text-muted-foreground mb-8 text-sm">
                Your saved resumes stay safely versioned under your profile. Sign in to view and manage them.
              </p>
              <Link href="/login?next=/resumes">
                <Button className="w-full h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (!user && loading) || fetching ? (
            /* Skeleton Loading State */
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-secondary/50 border border-border/30" />
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-secondary/50 border border-border/30" />
                ))}
              </div>
            </div>
          ) : resumes.length > 0 ? (
            /* Logged In & Has Resumes Workspace */
            <div className="space-y-10">
              {/* Controls (Search, Sort, Layout Switch) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-sm p-3 border border-border/40 rounded-2xl shadow-sm">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2 border border-border/50 rounded-xl px-2.5 py-1.5 bg-background/50">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs font-semibold bg-transparent text-foreground focus:outline-none border-none cursor-pointer pr-1"
                    >
                      <option value="modified">Last Edited</option>
                      <option value="created">Created Date</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </div>

                  {/* View layout switch */}
                  <div className="flex items-center border border-border/50 rounded-xl p-1 bg-background/50">
                    <button
                      onClick={() => setViewLayout('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewLayout === 'grid'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewLayout('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewLayout === 'list'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="List View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resume Collections */}
              {filteredAndSortedResumes.length > 0 ? (
                viewLayout === 'grid' ? (
                  /* Grid Layout */
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <Link href="/editor?new=1" className="group relative flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/20 hover:bg-card/40 transition-all duration-300 hover:border-primary/50 text-center p-6 cursor-pointer">
                      <span className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-pink-500/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 -z-10" />
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Plus className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                      <h4 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        Create New Resume
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Start fresh with a clean builder template.
                      </p>
                    </Link>

                    {filteredAndSortedResumes.map((resume) => (
                      <ResumeCard key={resume.id} {...resume} />
                    ))}
                  </div>
                ) : (
                  /* List/Table Layout */
                  <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/40 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Versions</th>
                            <th className="px-6 py-4">Last Modified</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {filteredAndSortedResumes.map((resume) => (
                            <tr
                              key={resume.id}
                              className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                              onClick={() => router.push(`/resumes/${resume.id}/versions`)}
                            >
                              <td className="px-6 py-4.5 font-bold text-foreground flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <span className="truncate group-hover:text-primary transition-colors">
                                  {resume.name}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-semibold text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <History className="h-3.5 w-3.5 text-primary" />
                                  {resume.versions} versions
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-sm text-muted-foreground">
                                {resume.lastModified}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  resume.status === 'Ready'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  <span className={`h-1 w-1 rounded-full ${resume.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  {resume.status || 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Link href={`/resumes/${resume.id}/versions`}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                      title="Open Workspace"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteClick(resume)}
                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    title="Delete Resume"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                /* No search results found */
                <div className="text-center py-20 rounded-2xl border border-border/40 bg-card/20">
                  <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No resumes match your search</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Try checking your spelling or search for a different name.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="rounded-xl border-border/60 hover:bg-secondary font-semibold"
                  >
                    Clear Search Query
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Logged In, But No Resumes Exist Yet */
            <div className="max-w-xl mx-auto my-8 text-center p-12 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 shadow-sm">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Build Your First Resume</h3>
              <p className="text-muted-foreground mb-8 text-sm max-w-sm mx-auto">
                Create a professional resume in minutes. Every save automatically generates a version snapshot you can restore anytime.
              </p>
              <Link href="/editor?new=1">
                <Button className="h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-md hover:shadow-lg transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Start From Template
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        resumeName={selectedResumeForDelete?.name ?? ''}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedResumeForDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
