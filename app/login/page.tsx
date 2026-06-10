import { Suspense } from 'react'
import LoginClient from './login-client'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
          Loading sign in...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
