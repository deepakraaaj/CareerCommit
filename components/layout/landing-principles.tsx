import { landingPrinciples } from '@/lib/content'

export function LandingPrinciples() {
  return (
    <div className="bg-secondary py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">Our Core Principles</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingPrinciples.map((principle) => (
            <div key={principle.title} className="text-center">
              <h3 className="font-semibold mb-2">{principle.title}</h3>
              <p className="text-sm text-muted-foreground">{principle.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
