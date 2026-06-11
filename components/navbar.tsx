'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, LogOut, Shield, Zap, FileText } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/editor', label: 'Editor', icon: FileText },
    { href: '/export', label: 'Export', icon: Zap },
    { href: '/jd-matcher', label: 'Job Matcher', icon: Shield },
  ]

  const dashboardItems = user ? [{ href: '/dashboard', label: 'My Resumes' }] : []

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    setIsOpen(false)
    router.push('/')
  }

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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {dashboardItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:bg-secondary transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-4 h-4 group-hover:text-foreground" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-border/50 bg-card shadow-xl p-2 z-50">
                      <div className="px-3 py-2 text-xs text-foreground/60 border-b border-border/30 mb-2">
                        {user.email}
                      </div>
                      <Link href="/dashboard">
                        <button className="w-full px-3 py-2 rounded-lg text-sm text-left text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
                          📊 My Resumes
                        </button>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 rounded-lg text-sm text-left text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors mt-1"
                      >
                        ↗ Sign out
                      </button>
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
            {dashboardItems.map((item) => (
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
            {navItems.map((item) => (
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
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2.5 text-sm text-left text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg"
                >
                  ↗ Sign out
                </button>
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
