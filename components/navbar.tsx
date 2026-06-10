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
    { href: '/resumes', label: 'My Resumes' },
    { href: '/editor', label: 'Editor' },
    { href: '/achievements', label: 'Achievements' },
    { href: '/jd-matcher', label: 'Job Matcher' },
    { href: '/export', label: 'Export' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <FileText className="w-6 h-6 text-primary" />
            <span>CareerCommit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
                >
                  {item.label}
                </Link>
              ))}
            {user ? (
              <div className="ml-2 flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-40 truncate text-sm">{user.email}</span>
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
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:bg-secondary rounded-md"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2">
                {user ? (
                  <div className="flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Signed in</div>
                      <div className="truncate text-sm">{user.email}</div>
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
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
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
