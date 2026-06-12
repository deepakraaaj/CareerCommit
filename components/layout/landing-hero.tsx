'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  X,
  FileText,
  GitBranch,
  Shield,
  ArrowUpRight,
  Layers,
  Upload,
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
      <div className="relative min-h-screen bg-[#fafbfc] text-slate-900 dark:bg-[#070b16] dark:text-slate-100 overflow-x-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-pink-500/5 to-cyan-500/10 dark:from-pink-500/10 dark:to-cyan-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[90px]" />
        </div>

        {/* Hero Area */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: CTA & Headline */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-950/30 w-fit backdrop-blur-md">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Version control for job applications
                </span>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                  Stop managing <br />
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    resume versions.
                  </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
                  Tailor your resume for Amazon, Google, or any startup in seconds. One central workspace, perfect version control, and complete ATS optimization.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={handleStartEditing}
                  className="relative group h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 dark:shadow-indigo-950/50 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    Start Editing Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleUploadResume}
                  className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  Import Resume
                </Button>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 max-w-md">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">100%</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">ATS Safe Layouts</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">1-Click</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Version Cloning</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">Free</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">No Credit Card</div>
                </div>
              </div>
            </div>

            {/* Right Column: Branching Interactive Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative p-6 rounded-3xl border border-white/20 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md shadow-2xl">
                {/* Decorative mesh inside mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 rounded-3xl" />
                
                <div className="relative space-y-6">
                  {/* Master Card */}
                  <div className="p-4 rounded-2xl border border-indigo-200 bg-white dark:border-indigo-500/30 dark:bg-slate-900/90 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Master Resume</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Main Professional Profile</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Base
                      </span>
                    </div>
                  </div>

                  {/* Connectors (CSS) */}
                  <div className="relative h-12 flex justify-center items-center">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
                    <div className="absolute left-1/4 right-1/4 h-0.5 bg-purple-500/40" />
                  </div>

                  {/* Variants Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Variant 1 */}
                    <div className="relative p-3 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 hover:border-emerald-500/40 transition-colors shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Amazon
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500">92%</span>
                        </div>
                        <h5 className="text-xs font-bold truncate text-slate-900 dark:text-white">Cloud Engineer</h5>
                        <p className="text-[10px] text-slate-400">ATS Optimized</p>
                      </div>
                    </div>

                    {/* Variant 2 */}
                    <div className="relative p-3 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 hover:border-indigo-500/40 transition-colors shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            Google
                          </span>
                          <span className="text-[10px] font-bold text-indigo-500">96%</span>
                        </div>
                        <h5 className="text-xs font-bold truncate text-slate-900 dark:text-white">AI Engineer</h5>
                        <p className="text-[10px] text-slate-400">Cerebras Tailored</p>
                      </div>
                    </div>

                    {/* Variant 3 */}
                    <div className="relative p-3 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 hover:border-pink-500/40 transition-colors shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400">
                            Stripe
                          </span>
                          <span className="text-[10px] font-bold text-pink-500">89%</span>
                        </div>
                        <h5 className="text-xs font-bold truncate text-slate-900 dark:text-white">Fullstack Dev</h5>
                        <p className="text-[10px] text-slate-400">Custom Variant</p>
                      </div>
                    </div>
                  </div>

                  {/* Branching icon label */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2">
                    <GitBranch className="w-3.5 h-3.5 text-purple-500" />
                    All variants sync instantly with the Master Profile
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Comparison Section */}
        <section className="relative py-24 bg-white/40 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-900/30">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Built for Multi-Version Application
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Why use generic word processors or design platforms for tailored job hunting?
              </p>
            </div>

            {/* Redesigned Premium Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              
              {/* Header column (Desktop) */}
              <div className="hidden md:flex flex-col justify-between py-6 pr-4 space-y-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Features</div>
                <div className="space-y-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <div className="h-6 flex items-center">Name each version</div>
                  <div className="h-6 flex items-center">Edit copies separately</div>
                  <div className="h-6 flex items-center">One dashboard overview</div>
                  <div className="h-6 flex items-center">Prevent version mix-ups</div>
                  <div className="h-6 flex items-center">Pricing model</div>
                </div>
              </div>

              {/* Raceum (Featured column) */}
              <div className="relative p-6 rounded-2xl border-2 border-indigo-500 bg-white dark:bg-slate-900/90 shadow-xl md:-translate-y-2 flex flex-col justify-between">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Recommended
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">raceum</span>
                  </div>
                  <div className="space-y-8 text-center md:text-left">
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="md:hidden text-sm font-medium">Name each version</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="md:hidden text-sm font-medium">Edit copies separately</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="md:hidden text-sm font-medium">One dashboard overview</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="md:hidden text-sm font-medium">Prevent version mix-ups</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Free / No ads</span>
                      <span className="md:hidden text-sm font-medium">Pricing model</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Docs */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col justify-between opacity-80">
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="font-bold text-lg text-slate-500">Google Docs</span>
                  </div>
                  <div className="space-y-8 text-center md:text-left">
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="md:hidden text-sm font-medium text-slate-400">Name each version</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-amber-500 text-sm font-bold">Manual copies</span>
                      <span className="md:hidden text-sm font-medium text-slate-400">Edit copies separately</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="md:hidden text-sm font-medium text-slate-400">One dashboard overview</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-amber-500 text-sm font-bold">Prone to errors</span>
                      <span className="md:hidden text-sm font-medium text-slate-400">Prevent version mix-ups</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-sm font-semibold text-slate-500">Free</span>
                      <span className="md:hidden text-sm font-medium text-slate-400">Pricing model</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canva */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col justify-between opacity-80">
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="font-bold text-lg text-slate-500">Canva</span>
                  </div>
                  <div className="space-y-8 text-center md:text-left">
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="md:hidden text-sm font-medium text-slate-400">Name each version</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="md:hidden text-sm font-medium text-slate-400">Edit copies separately</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="md:hidden text-sm font-medium text-slate-400">One dashboard overview</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-amber-500 text-sm font-bold">Unorganized grid</span>
                      <span className="md:hidden text-sm font-medium text-slate-400">Prevent version mix-ups</span>
                    </div>
                    <div className="h-6 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-sm font-semibold text-slate-500">$5/mo premium</span>
                      <span className="md:hidden text-sm font-medium text-slate-400">Pricing model</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Workflow Cards */}
        <section className="relative py-20 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="relative group p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-tr-2xl blur-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  Create variants instantly
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Base resume &rarr; Amazon variant &rarr; Startup variant. One click cloning keeps your original resume templates protected while tailoring new ones.
                </p>
              </div>

              {/* Card 2 */}
              <div className="relative group p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-tr-2xl blur-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  Everything organized
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Maintain your tailored versions in a single unified workspace. Easily track where you applied and which version was submitted.
                </p>
              </div>

              {/* Card 3 */}
              <div className="relative group p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-tr-2xl blur-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6">
                  <Shield className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  Tweak independently
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Modify copy or tech stacks for a specific role without affecting other versions. Your updates stay completely independent.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
    </>
  )
}
