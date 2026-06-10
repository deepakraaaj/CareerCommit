'use client'

import { useState } from 'react'
import { GitCompare } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { MatcherResults } from '@/components/jd/matcher-results'
import { mockMatchResults } from '@/lib/mock-data'

export default function JDMatcher() {
  const [jdText, setJdText] = useState('')
  const [matched, setMatched] = useState(false)

  const handleAnalyze = () => {
    if (jdText.trim()) {
      setMatched(true)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Job Description Matcher</h1>
            <p className="text-muted-foreground">
              Paste a job description and we&apos;ll show you how your resume matches it.
            </p>
          </div>

          {!matched ? (
            <div className="card-premium p-8">
              <h2 className="text-lg font-semibold mb-4">Paste Job Description</h2>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-64 p-4 rounded-lg border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleAnalyze} disabled={!jdText.trim()}>
                  <GitCompare className="w-4 h-4 mr-2" />
                  Analyze Match
                </Button>
                <Button variant="outline" onClick={() => setJdText('')}>
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <MatcherResults results={mockMatchResults} onAnalyzeAnother={() => setMatched(false)} />
          )}
        </div>
      </div>
    </>
  )
}
