'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, LogIn, UserPlus } from 'lucide-react'
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.95))] p-10 text-white lg:flex">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
              <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight">
                Sign in to keep your resume history, versions, and uploads in one place.
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/70">
                Use the editor without logging in, or sign in when you want your work saved to your account.
              </p>
            </div>
            <div className="relative grid gap-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                Save version history without relying on local-only browser state.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                Keep uploads, resume history, and achievements tied to one user.
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back home
                </Link>
                <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in when you want your resume history saved to your account.
                </p>
              </div>

              <div className="mb-6 flex rounded-full border border-border bg-secondary p-1">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    mode === 'signin' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    mode === 'signup' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {message && (
                  <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    {message}
                  </div>
                )}

                <Button type="submit" className="w-full gap-2" disabled={submitting}>
                  {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {submitting ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Public usage stays available without login. Sign in only when you want saved history,
                resume versions, and synced uploads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
