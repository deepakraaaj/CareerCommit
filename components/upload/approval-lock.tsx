'use client'

import { Lock } from 'lucide-react'

export function ApprovalLock() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="absolute inset-0 -z-10 premium-grid opacity-25" />
      <div className="absolute left-[-8rem] top-20 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-[-6rem] top-40 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="max-w-md w-full mx-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-yellow-100">
            <Lock size={40} className="text-yellow-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Access Pending</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Your account is awaiting approval to use Raceum. Please check back soon or contact support for more information.
        </p>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-900">
            📧 If you believe this is an error, please reach out to{' '}
            <a href="mailto:support@raceum.com" className="font-semibold hover:underline">
              support@raceum.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
