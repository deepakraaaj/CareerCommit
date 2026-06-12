'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, type DbProfile } from '@/lib/supabase-placeholder'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  profile: DbProfile | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function resolveProfileName(user: User) {
  return (
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    'User'
  )
}

function isPlaceholderName(name: string | null | undefined) {
  const trimmed = name?.trim().toLowerCase()
  return !trimmed || trimmed === 'user' || trimmed === 'account'
}

async function upsertProfile(user: User) {
  try {
    const response = await fetch('/api/profile/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email ?? '',
        name: resolveProfileName(user),
      }),
    })

    if (!response.ok) {
      const { error } = await response.json()
      console.warn('[Supabase] Profile sync failed:', error)
      return null
    }

    const { data } = await response.json()
    return data ?? null
  } catch (error) {
    console.warn('[Supabase] Profile sync failed:', error)
    return null
  }
}

async function loadProfile(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (error) {
    console.warn('[Supabase] Profile load failed:', error.message)
    return null
  }

  return data ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const syncCurrentProfile = async (user: User | null) => {
    if (!user) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)

    const existingProfile = await loadProfile(user.id)
    if (existingProfile) {
      const resolvedName = resolveProfileName(user)
      if (isPlaceholderName(existingProfile.name) && !isPlaceholderName(resolvedName)) {
        const repairedProfile = await upsertProfile(user)
        setProfile(repairedProfile ?? existingProfile)
        setProfileLoading(false)
        return
      }

      setProfile(existingProfile)
      setProfileLoading(false)
      return
    }

    const syncedProfile = await upsertProfile(user)
    setProfile(syncedProfile)
    setProfileLoading(false)
  }

  useEffect(() => {
    const supabase = getSupabaseClient()
    let active = true

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return
        setSession(data.session)
        setLoading(false)
        await syncCurrentProfile(data.session?.user ?? null)
      })
      .catch((error) => {
        console.warn('[Supabase] Failed to read session:', error)
        if (active) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)
      await syncCurrentProfile(nextSession?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading: loading || profileLoading,
      profile,
      refreshProfile: async () => {
        await syncCurrentProfile(session?.user ?? null)
      },
      signOut: async () => {
        const supabase = getSupabaseClient()
        setSession(null)
        setProfile(null)
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (error) {
          console.warn('[Supabase] Sign out failed:', error)
        }
      },
    }),
    [loading, profile, profileLoading, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
