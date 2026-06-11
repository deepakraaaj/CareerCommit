'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  X,
  Lock,
  Zap,
  BarChart3,
  FileText,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/components/auth/auth-provider'

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

  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-slate-50/40 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 h-[calc(100vh-4rem)] flex flex-col justify-between py-8">

          {/* Top: Hero + CTA */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left: Content */}
            <div className="flex-1 space-y-6 pt-4">
              {/* Real Problem Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300/40 bg-slate-100/60 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <span className="text-xs font-semibold text-slate-700">One resume. Infinite jobs.</span>
              </div>

              {/* Headline - Multi-Role Focus */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
                  Stop managing resume versions.
                </h1>
                <p className="text-base md:text-lg text-foreground/60 mt-4 max-w-lg">
                  Apply to Amazon, Google, and 5 startups with tailored resumes. One dashboard, perfect version control, zero chaos.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleStartEditing}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 font-semibold gap-2 h-11"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleUploadResume}
                  className="px-6 font-semibold h-11"
                >
                  Import Resume
                </Button>
              </div>

              {/* Social Proof - Multi-Role Reality */}
              <div className="flex gap-8 pt-4 text-xs border-t border-border/30">
                <div>
                  <div className="font-bold text-sm text-slate-900">10+ versions</div>
                  <div className="text-foreground/60">Organized, not chaos</div>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Edit separately</div>
                  <div className="text-foreground/60">No mix-ups</div>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">See all at once</div>
                  <div className="text-foreground/60">One place</div>
                </div>
              </div>
            </div>

            {/* Right: Comparison Grid */}
            <div className="flex-1 lg:pt-4">
              <div className="bg-white/70 backdrop-blur border border-border/30 rounded-xl p-5 h-fit shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wide">For managing multiple versions</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-700 font-medium">Name each version clearly</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-emerald-500/15 rounded flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="w-6 h-6 bg-gray-200/40 rounded flex items-center justify-center"><X className="w-3.5 h-3.5 text-gray-400" /></div>
                      <div className="w-6 h-6 bg-gray-200/40 rounded flex items-center justify-center"><X className="w-3.5 h-3.5 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-700 font-medium">Edit each one separately</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-emerald-500/15 rounded flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="w-6 h-6 bg-orange-200/40 rounded flex items-center justify-center text-xs">⚠</div>
                      <div className="w-6 h-6 bg-gray-200/40 rounded flex items-center justify-center"><X className="w-3.5 h-3.5 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-700 font-medium">See all versions at once</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-emerald-500/15 rounded flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="w-6 h-6 bg-gray-200/40 rounded flex items-center justify-center"><X className="w-3.5 h-3.5 text-gray-400" /></div>
                      <div className="w-6 h-6 bg-gray-200/40 rounded flex items-center justify-center"><X className="w-3.5 h-3.5 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-700 font-medium">Never lose or mix up versions</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-emerald-500/15 rounded flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="w-6 h-6 bg-orange-200/40 rounded flex items-center justify-center text-xs">⚠</div>
                      <div className="w-6 h-6 bg-orange-200/40 rounded flex items-center justify-center text-xs">⚠</div>
                    </div>
                  </div>
                  <div className="border-t border-border/30 pt-3 mt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-slate-900">Price</span>
                      <div className="flex gap-2 text-xs font-bold">
                        <div className="text-emerald-700">Free</div>
                        <div className="text-foreground/40">Free</div>
                        <div className="text-foreground/40">$5/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-foreground/50 mt-4 flex gap-2 justify-center">
                  <span className="text-slate-700 font-medium">Us</span>
                  <span className="text-foreground/30">•</span>
                  <span>Google Docs</span>
                  <span className="text-foreground/30">•</span>
                  <span>Canva</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Multi-Version Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            {/* Card 1 */}
            <div className="bg-white/50 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <div className="w-4 h-4 border-l-2 border-t-2 border-slate-600"></div>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Create variants instantly</h3>
              </div>
              <p className="text-xs text-slate-700">
                Base resume → Amazon version → Google version → Startup version. One click each. No copy-paste chaos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/50 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <div className="space-y-0.5">
                    <div className="w-3 h-0.5 bg-slate-600"></div>
                    <div className="w-3 h-0.5 bg-slate-600"></div>
                    <div className="w-3 h-0.5 bg-slate-600"></div>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Everything organized</h3>
              </div>
              <p className="text-xs text-slate-700">
                All your versions in one dashboard. See which is for which job. Never send the wrong resume.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/50 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-slate-600 rounded-full"></div>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Tweak each independently</h3>
              </div>
              <p className="text-xs text-slate-700">
                Update Amazon resume without touching Google version. All changes stay separate and safe.
              </p>
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
