import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <div className="bg-gradient-to-b from-secondary to-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Maintain Your Resume,
            <br />
            <span className="text-primary">Maintain Your Edge</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            CareerCommit is a resume maintenance system designed for professionals who want
            complete control. Upload, edit, version, and export clean ATS-friendly resumes—all
            without losing your original work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Upload Resume
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
