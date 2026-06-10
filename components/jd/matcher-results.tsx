'use client'

import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MatchResult } from '@/lib/types'

interface MatcherResultsProps {
  results: MatchResult
  onAnalyzeAnother: () => void
}

export function MatcherResults({ results, onAnalyzeAnother }: MatcherResultsProps) {
  return (
    <>
      <div className="space-y-8">
        <div className="card-premium p-8">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">72%</div>
            <p className="text-muted-foreground">Overall Match</p>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div className="bg-primary h-3 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Skills You Have ({results.matched.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.matched.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Skills to Highlight ({results.keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.keywords.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4">Missing from Resume ({results.missing.length})</h3>
          <div className="space-y-2">
            {results.missing.map((skill) => (
              <div key={skill} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <span className="text-sm">{skill}</span>
                <span className="text-xs text-muted-foreground">Not mentioned</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Consider adding these skills to your resume if you have experience with them, or
            focus on the skills you do have that match the job requirements.
          </p>
        </div>

        <div className="card-premium p-6 bg-secondary">
          <h3 className="font-semibold mb-3">Recommendations</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Emphasize your relevant experience in the skills you matched</li>
            <li>Use keywords from the job description naturally in your resume</li>
            <li>Highlight achievements that demonstrate the required skills</li>
            <li>Consider tailoring your resume for this specific position</li>
          </ul>
        </div>

        <Button onClick={onAnalyzeAnother} variant="outline">
          Analyze Another Job
        </Button>
      </div>
    </>
  )
}
