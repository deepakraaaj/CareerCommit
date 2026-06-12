'use client'

import { useEffect, useState } from 'react'
import { supabasePlaceholder, type DbProfile } from '@/lib/supabase-placeholder'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function AdminPanel() {
  const [users, setUsers] = useState<DbProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved: !currentStatus }),
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, approved: !currentStatus } : u))
      }
    } catch (error) {
      console.error('Failed to update approval:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel - User Approvals</h1>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-card/80"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{user.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <Button
                    onClick={() => toggleApproval(user.id, user.approved)}
                    disabled={updating === user.id}
                    variant={user.approved ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    {updating === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.approved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Pending
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
