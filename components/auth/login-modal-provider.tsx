'use client'

import { createContext, useContext, useState } from 'react'
import { LoginModal } from './login-modal'

interface LoginModalContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined)

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <LoginModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </LoginModalContext.Provider>
  )
}

export function useLoginModal() {
  const context = useContext(LoginModalContext)
  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider')
  }
  return context
}
