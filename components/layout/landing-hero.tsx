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
      <section className="relative isolate overflow-hidden pb-24 pt-16 md:pb-40 md:pt-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="space-y-12">
            {/* Hero Headline */}
            <div>
              <h1 className="text-foreground font-bold">
                Your resume,<br />
                perfected.
              </h1>

              {/* Description */}
              <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mt-6">
                Never overwrite, never lose track. Edit freely, save everything, export perfectly. Keep your entire resume history safe while you refine every detail.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" onClick={handleStartEditing} className="btn-primary">
                Start editing
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleUploadResume}
                className="rounded-lg border border-border/50 px-6 font-semibold text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
              >
                Upload resume
              </Button>
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
