'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, User } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { supabasePlaceholder } from '@/lib/supabase-placeholder'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [savedChanges, setSavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      setFullName('')
      return
    }

    setFullName(profile?.name || user.user_metadata?.full_name || user.email || '')
  }, [profile, user])

  const handleSave = async () => {
    if (!user) {
      router.push('/login?next=/settings')
      return
    }

    setSaving(true)
    setSavedChanges(false)

    const result = await supabasePlaceholder.saveProfile({
      id: user.id,
      email: user.email ?? '',
      name: fullName.trim() || user.email || 'User',
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    })

    if (result) {
      setFullName(result.name)
      await refreshProfile()
      setSavedChanges(true)
      window.setTimeout(() => setSavedChanges(false), 2000)
    }

    setSaving(false)
  }

  const handleCancel = () => {
    setFullName(profile?.name || user?.user_metadata?.full_name || user?.email || '')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Only the account fields you need.</p>
          </div>

          {!user && !loading ? (
            <div className="card-premium p-10 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to edit settings</h2>
              <p className="text-muted-foreground mb-6">
                Your settings are tied to your account.
              </p>
              <Link href="/login?next=/settings">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {savedChanges && (
                <div className="card-premium p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    Settings saved successfully
                  </p>
                </div>
              )}

              <div className="card-premium p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <div className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm">
                      {user?.email || 'Not signed in'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving || !user}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
