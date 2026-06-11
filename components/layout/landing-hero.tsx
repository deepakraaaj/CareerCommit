'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'

export function LandingHero() {
  const router = useRouter()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/editor')
    }
  }

  const handleUploadResume = () => {
    router.push('/upload')
  }

  return (
    <>
      <div className="bg-gradient-to-b from-secondary to-background py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Maintain Your Resume,
              <br />
              <span className="text-primary">Maintain Your Edge</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Create, edit, and version your resume with complete control. Export clean ATS-friendly
              resumes—all without losing your original work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Start Editing Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleUploadResume}>
                Upload Existing Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
