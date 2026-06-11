import { landingFeatures } from '@/lib/content'
import { FeatureCard } from '@/components/shared/feature-card'

export function LandingFeatures() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="premium-chip">Designed around control</span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A workflow that feels calm, sharp, and expensive
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Every step is built so you can move quickly without losing confidence in the final
            result. AI helps, but you stay in charge.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {landingFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
