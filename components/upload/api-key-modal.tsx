'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cerebras-api-key') || ''
    }
    return ''
  })
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('cerebras-api-key', apiKey)
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        onClose()
      }, 1000)
    }
  }

  const handleClear = () => {
    setApiKey('')
    localStorage.removeItem('cerebras-api-key')
    setIsSaved(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Cerebras API Key</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Enter your Cerebras API key to enable resume parsing. Get one at{' '}
            <a href="https://console.cerebras.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              console.cerebras.ai
            </a>
          </p>

          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1"
            >
              {isSaved ? '✓ Saved' : 'Save Key'}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1"
            >
              Clear
            </Button>
          </div>

          {apiKey && (
            <p className="text-xs text-green-600">
              ✓ API key stored locally in your browser
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
