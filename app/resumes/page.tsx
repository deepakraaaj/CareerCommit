'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { ResumeCard } from '@/components/resume/resume-card'
import { mockResumes } from '@/lib/mock-data'

export default function Resumes() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader
            title="My Resumes"
            description="Browse and manage all your saved resumes."
            action={
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Resume
                </Button>
              </Link>
            }
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResumes.map((resume) => (
              <ResumeCard key={resume.id} {...resume} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
