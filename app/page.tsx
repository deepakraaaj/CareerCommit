import { Navbar } from '@/components/navbar'
import { LandingHero } from '@/components/layout/landing-hero'
import { LandingFeatures } from '@/components/layout/landing-features'
import { LandingPrinciples } from '@/components/layout/landing-principles'
import { LandingCTA } from '@/components/layout/landing-cta'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <LandingHero />
        <LandingFeatures />
        <LandingPrinciples />
        <LandingCTA />
      </div>
    </>
  )
}
