import { Navbar } from '@/components/navbar'
import { LandingHero } from '@/components/layout/landing-hero'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <LandingHero />
      </div>
    </>
  )
}
