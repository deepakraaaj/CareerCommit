'use client'

import { AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactSupportModalProps {
  open: boolean
  onClose: () => void
}

export function ContactSupportModal({ open, onClose }: ContactSupportModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-3">Access Required</h2>
        <p className="text-muted-foreground text-center mb-6">
          Your account needs approval to use AI features. Please contact support to enable this capability.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-1">Contact Support</p>
              <a href="mailto:support@raceum.com" className="text-blue-600 hover:underline text-sm">
                support@raceum.com
              </a>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  )
}
