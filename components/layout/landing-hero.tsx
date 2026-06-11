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
      <section className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-blue-50/30 overflow-hidden">
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
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 w-fit">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Bank-grade encrypted • No credit card</span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
                  Your resume deserves better than Google Docs.
                </h1>
                <p className="text-base md:text-lg text-foreground/60 mt-4 max-w-lg">
                  Stop losing versions. Stop watching formatting break. Stop guessing if you'll pass ATS. CareerCommit handles it all.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleStartEditing}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 font-semibold gap-2 h-11"
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

              {/* Social Proof - Inline */}
              <div className="flex gap-6 pt-2 text-xs">
                <div>
                  <div className="font-bold text-sm text-foreground">15K+</div>
                  <div className="text-foreground/60">job seekers</div>
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">98%</div>
                  <div className="text-foreground/60">ATS score ↑</div>
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">4.9★</div>
                  <div className="text-foreground/60">rated</div>
                </div>
              </div>
            </div>

            {/* Right: Comparison Grid */}
            <div className="flex-1 lg:pt-4">
              <div className="bg-white/60 backdrop-blur border border-border/30 rounded-xl p-5 h-fit">
                <h3 className="text-xs font-semibold text-foreground/70 mb-4 uppercase tracking-wide">Why CareerCommit?</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/80">Version Control</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-green-500/10 rounded flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/80">ATS Score</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-green-500/10 rounded flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/80">Job Matcher</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-green-500/10 rounded flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                      <div className="w-6 h-6 bg-gray-200/50 rounded flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/80">Safe Exports</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-green-500/10 rounded flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
                      <div className="w-6 h-6 bg-orange-200/50 rounded flex items-center justify-center text-xs">⚠</div>
                      <div className="w-6 h-6 bg-orange-200/50 rounded flex items-center justify-center text-xs">⚠</div>
                    </div>
                  </div>
                  <div className="border-t border-border/30 pt-3 mt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-foreground">Price</span>
                      <div className="flex gap-2 text-xs font-bold">
                        <div className="text-green-600">Free</div>
                        <div className="text-foreground/40">Free</div>
                        <div className="text-foreground/40">$5/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-foreground/50 mt-4 flex gap-2 justify-center">
                  <span>Ours</span>
                  <span className="text-foreground/30">•</span>
                  <span>Google Docs</span>
                  <span className="text-foreground/30">•</span>
                  <span>Canva</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Trust + Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            {/* Trust Card */}
            <div className="bg-white/40 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm">Your data, protected</h3>
              </div>
              <ul className="space-y-2 text-xs text-foreground/70">
                <li>✓ 256-bit encryption</li>
                <li>✓ GDPR & SOC 2 compliant</li>
                <li>✓ Never shared or sold</li>
              </ul>
            </div>

            {/* Benefit 1 */}
            <div className="bg-white/40 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm">Real ATS Score</h3>
              </div>
              <p className="text-xs text-foreground/70">
                Know exactly how recruiters will see your resume + get fixes.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white/40 backdrop-blur border border-border/30 rounded-lg p-4 h-fit">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm">Match Jobs Fast</h3>
              </div>
              <p className="text-xs text-foreground/70">
                Paste a job description, see keyword gaps, fill them in seconds.
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
