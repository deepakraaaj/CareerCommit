import { landingFeatures } from '@/lib/content'
import { FeatureCard } from '@/components/shared/feature-card'

export function LandingFeatures() {
  return (
    <div className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">Designed for Your Workflow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every feature is built around one principle: you own your resume. AI assists, but never
            overwrites. Every save creates a version. Nothing is ever lost.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {landingFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  )
}
