'use client'

import { useEffect, useState } from 'react'
import { GitCompare } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { MatcherResults } from '@/components/jd/matcher-results'
import { loadResumes } from '@/lib/supabase-loaders'
import type { MatchResult, Resume } from '@/lib/types'

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'your',
  'you',
  'our',
  'from',
  'that',
  'this',
  'are',
  'was',
  'were',
  'have',
  'has',
  'will',
  'can',
  'able',
  'into',
  'work',
  'role',
  'team',
  'using',
  'use',
  'must',
  'years',
  'year',
  'experience',
])

function extractKeywords(text: string) {
  const tokens = text
    .toLowerCase()
    .match(/[a-z][a-z0-9+.-]{3,}/g)
    ?.filter((word) => !STOP_WORDS.has(word)) ?? []

  return Array.from(new Set(tokens)).slice(0, 12)
}

function analyzeMatch(jdText: string, resumeText: string): MatchResult {
  const keywords = extractKeywords(jdText)
  const resumeLower = resumeText.toLowerCase()

  const matched = keywords.filter((keyword) => resumeLower.includes(keyword))
  const missing = keywords.filter((keyword) => !resumeLower.includes(keyword))

  return {
    matched,
    missing,
    keywords,
  }
}

export default function JDMatcher() {
  const [jdText, setJdText] = useState('')
  const [matched, setMatched] = useState(false)
  const [results, setResults] = useState<MatchResult>({
    matched: [],
    missing: [],
    keywords: [],
  })
  const [resumeText, setResumeText] = useState('')

  useEffect(() => {
    let active = true

    loadResumes().then((rows: Resume[]) => {
      if (!active) return
      setResumeText(rows[0]?.contentText ?? '')
    })

    return () => {
      active = false
    }
  }, [])

  const handleAnalyze = () => {
    if (jdText.trim()) {
      setResults(analyzeMatch(jdText, resumeText))
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
            <MatcherResults results={results} onAnalyzeAnother={() => setMatched(false)} />
          )}
        </div>
      </div>
    </>
  )
}
