'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, LogIn, UserPlus, Mail, Lock, User, Zap, Clock, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-placeholder'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath)
    }
  }, [loading, nextPath, router, user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const supabase = getSupabaseClient()

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMessage(error.message)
          return
        }

        router.replace(nextPath)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (data.session) {
        router.replace(nextPath)
        return
      }

      setMessage('Account created. Check your email to confirm your sign-in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Section - Desktop only */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-10 text-white lg:flex">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="absolute top-0 right-0 h-96 w-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-blue-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
              <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Your resume, your way
              </h1>
              <p className="mt-4 max-w-md text-base text-blue-100/80">
                Sign in to save your progress, keep version history, and access your uploads anywhere.
              </p>
            </div>

            <div className="relative space-y-3 text-sm">
              <div className="group rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-100">Version History</p>
                    <p className="text-xs text-blue-100/70">Track every change to your resume</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-100">Smart Uploads</p>
                    <p className="text-xs text-blue-100/70">Parse & sync your resume in seconds</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                <div className="flex gap-3">
                  <BookOpen className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-100">Multi-Resume</p>
                    <p className="text-xs text-blue-100/70">Manage multiple resumes for any role</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile Header */}
              <div className="mb-8 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
                <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to access your resumes and progress.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="mb-8 flex gap-2 rounded-xl border border-border p-1 bg-secondary/50">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Full name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`rounded-lg px-4 py-3 text-sm border flex items-start gap-2.5 ${
                    message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
                      ? 'bg-red-50/50 border-red-200 text-red-700'
                      : 'bg-blue-50/50 border-blue-200 text-blue-700'
                  }`}>
                    {message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') ? (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2 py-2.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                  disabled={submitting || !email || !password || (mode === 'signup' && !fullName)}
                >
                  {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {submitting ? 'Just a moment...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              {/* Info Text */}
              <div className="mt-8 p-3 rounded-lg bg-blue-50/30 border border-blue-200/50">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>No login required to use the editor. Sign in only to save your work to your account.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
