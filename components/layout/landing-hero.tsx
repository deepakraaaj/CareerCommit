'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileText,
  History,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/components/auth/auth-provider'

const trustPoints = [
  {
    title: 'Version-safe',
    copy: 'Every change can be rolled back without losing your original draft.',
  },
  {
    title: 'ATS-first',
    copy: 'Export clean, recruiter-friendly files without layout drift.',
  },
  {
    title: 'Built for speed',
    copy: 'Resume edits feel fast, focused, and calm instead of brittle.',
  },
]

const versionStream = [
  { label: 'Base import', detail: 'Uploaded PDF locked in as source' },
  { label: 'Visual polish', detail: 'Summary and bullets refreshed' },
  { label: 'Job match pass', detail: 'Keyword gaps highlighted' },
]

const previewStats = [
  { value: '98', label: 'ATS score' },
  { value: '12', label: 'Version saves' },
  { value: '2', label: 'Export formats' },
]

export function LandingHero() {
  const router = useRouter()
  const { user } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleStartEditing = () => {
    router.push('/editor')
  }

  const handleUploadResume = () => {
    router.push('/upload')
  }

  const handleSyncAccess = () => {
    if (user) {
      router.push('/dashboard')
      return
    }

    setLoginModalOpen(true)
  }

  return (
    <>
      <section className="relative isolate overflow-hidden pb-20 pt-14 md:pb-32 md:pt-24">
        <div className="absolute inset-0 -z-10 premium-grid opacity-20" />
        <div className="absolute left-[-10rem] top-0 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 -z-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">
            <div className="max-w-2xl">
              <div className="mb-6 flex flex-wrap gap-3">
                <span className="premium-chip">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Premium resume workspace
                </span>
                <span className="premium-chip">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Version-safe by design
                </span>
              </div>

              <h1 className="font-display text-6xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
                Keep <span className="gradient-text">every version</span>.
                <span className="mt-3 block">Edit with</span>
                <span className="mt-2 block gradient-text">precision.</span>
              </h1>

              <p className="mt-8 max-w-xl text-xl leading-8 text-muted-foreground">
                Never overwrite a resume again. CareerCommit keeps every iteration safe while you refine and export.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" onClick={handleStartEditing} className="btn-primary">
                  Start editing
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleUploadResume}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-6 font-semibold text-primary hover:bg-primary/20 hover:border-primary/50 transition-all"
                >
                  Upload resume
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={handleSyncAccess}
                  className="inline-flex items-center gap-2 font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {user ? 'Open dashboard' : 'Sign in to sync'}
                </button>
                <span className="text-muted-foreground">
                  No lock-in. No overwrites. ATS-safe exports.
                </span>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-[1.35rem] border border-border/70 bg-card/80 p-4 shadow-[0_16px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur"
                  >
                    <p className="text-sm font-semibold tracking-tight">{point.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[-1.75rem] top-10 h-28 w-28 rounded-full bg-accent/15 blur-3xl" />
              <div className="premium-shell p-4 md:p-6">
                <div className="flex items-center justify-between border-b border-border/70 px-2 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Resume cockpit
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">Live working draft</p>
                  </div>
                  <span className="premium-chip">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                    Autosaved
                  </span>
                </div>

                <div className="grid gap-4 pt-4 lg:grid-cols-[0.82fr_1.18fr]">
                  <div className="rounded-[1.5rem] border border-border/70 bg-muted/35 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold tracking-tight">Version history</p>
                      <History className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {versionStream.map((version, index) => (
                        <div
                          key={version.label}
                          className={`rounded-2xl border p-3 transition-colors ${
                            index === 0
                              ? 'border-primary/20 bg-background/90'
                              : 'border-border/70 bg-background/60'
                          }`}
                        >
                          <p className="text-sm font-medium">{version.label}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {version.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-background/85 p-5 shadow-inner shadow-white/10">
                    <div className="flex items-center justify-between">
                      <span className="premium-chip">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        ATS score 98
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Live preview
                      </span>
                    </div>

                    <div className="mt-5 space-y-5">
                      <div>
                        <div className="h-3 w-32 rounded-full bg-primary/15" />
                        <div className="mt-3 h-2 w-4/5 rounded-full bg-foreground/10" />
                        <div className="mt-2 h-2 w-3/5 rounded-full bg-foreground/10" />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Summary
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="h-2 w-full rounded-full bg-foreground/10" />
                            <div className="h-2 w-5/6 rounded-full bg-foreground/10" />
                            <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Match signals
                          </p>
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Keywords matched</span>
                              <span className="font-semibold">32</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Missing terms</span>
                              <span className="font-semibold">4</span>
                            </div>
                            <div className="h-2 rounded-full bg-foreground/10">
                              <div className="h-2 w-4/5 rounded-full bg-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {previewStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4 text-center"
                    >
                      <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
    </>
  )
}
