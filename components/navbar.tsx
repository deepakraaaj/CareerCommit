'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, FileText, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useTheme } from '@/components/theme/theme-provider'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const isActive = (href: string) => pathname === href

  const navTabs = [
    { href: '/resumes', label: 'Resumes' },
    { href: '/editor', label: 'Editor' },
  ]

  const rawDisplayName = profile?.name?.trim()
  const displayName =
    rawDisplayName && !['user', 'account'].includes(rawDisplayName.toLowerCase())
      ? rawDisplayName
      : user?.email?.split('@')[0] || 'Account'
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Tagline */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg group-hover:text-primary transition-colors">CareerCommit</div>
              <div className="text-xs text-foreground/50 -mt-1">Resume. Perfected.</div>
            </div>
          </Link>

          {/* Desktop Navigation - Only show for logged in users */}
          {user && (
            <div className="hidden lg:flex items-center rounded-full border border-border/70 bg-muted/40 p-1 shadow-sm backdrop-blur">
              {navTabs.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                          : 'text-foreground/60 hover:bg-background/70 hover:text-foreground'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active ? 'bg-primary' : 'bg-foreground/20'
                        }`}
                      />
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:bg-secondary transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {displayInitial}
                    </div>
                    <span className="hidden lg:inline">{displayName}</span>
                    <ChevronDown className="w-4 h-4 group-hover:text-foreground" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-border/50 bg-card shadow-xl p-2 z-50">
                      <div className="px-3 py-2 text-xs text-foreground/60 border-b border-border/30 mb-2">
                        <div className="font-medium text-foreground">{displayName}</div>
                        <div>{user.email}</div>
                      </div>
                      <Link href="/resumes">
                        <button className="w-full px-3 py-2 rounded-lg text-sm text-left text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
                          Resumes
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/editor')}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Start Free
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-foreground/70 hover:text-foreground transition-colors p-2"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border/50 py-4 space-y-2">
            {navTabs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-secondary'
                }`}
                >
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="pt-3 border-t border-border/50 mt-3 space-y-2">
                <Link
                  href="/resumes"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
                >
                  Resumes
                </Link>
              </div>
            )}
            {!user && (
              <div className="pt-3 border-t border-border/50 mt-3 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push('/login')
                    setIsOpen(false)
                  }}
                >
                  Sign in
                </Button>
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() => {
                    router.push('/editor')
                    setIsOpen(false)
                  }}
                >
                  Start Free
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
