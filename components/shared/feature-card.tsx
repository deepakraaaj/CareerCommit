import type { Feature } from '@/lib/types'

interface FeatureCardProps extends Feature {}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="card-premium p-6">
      <Icon className="w-8 h-8 text-primary mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
