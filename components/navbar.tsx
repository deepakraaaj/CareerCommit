'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LogOut, Menu, UserCircle2, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/editor', label: 'Editor' },
    { href: '/export', label: 'Export' },
    { href: '/jd-matcher', label: 'Job Matcher' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg hover:text-primary transition-colors duration-150">
            CareerCommit
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:block text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  {user.email}
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 rounded-lg border border-border/50 bg-card shadow-lg p-1 z-50">
                    <button
                      onClick={() => {
                        void signOut()
                        setUserMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 rounded-md text-sm text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors text-left"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button size="sm" className="btn-primary">
                  Sign in
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle navigation"
            >
              {isOpen ? '✕' : '≡'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border/50 mt-2">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-foreground/70">{user.email}</span>
                  <button
                    onClick={() => {
                      void signOut()
                      setIsOpen(false)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                  <Button size="sm" className="w-full btn-primary">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
