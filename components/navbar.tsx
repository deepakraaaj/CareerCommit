'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LogOut, Menu, UserCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/editor', label: 'Editor' },
    { href: '/export', label: 'Export' },
    { href: '/jd-matcher', label: 'Job Matcher' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_40px_-20px_rgba(15,23,42,0.5)]">
              <FileText className="h-5 w-5" />
            </span>
            <span className="tracking-tight">CareerCommit</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/80 hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
              ))}
            {user ? (
              <div className="ml-2 flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 shadow-sm backdrop-blur">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-40 truncate text-sm text-foreground/80">{user.email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void signOut()}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full border border-border/70 bg-card/80 p-2 text-foreground shadow-sm backdrop-blur md:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-2 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="p-2 pt-3">
                {user ? (
                  <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Signed in</div>
                      <div className="truncate text-sm text-foreground/80">{user.email}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void signOut()}
                      title="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" size="sm" className="w-full rounded-full">
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
