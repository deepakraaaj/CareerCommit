import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingCTA() {
  return (
    <div className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-semibold mb-6">Ready to Commit to Your Career?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Start managing your resume with confidence. Upload, edit, and export whenever you need.
        </p>
        <Link href="/dashboard">
          <Button size="lg">Launch Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
