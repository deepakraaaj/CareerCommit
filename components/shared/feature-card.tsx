import type { Feature } from '@/lib/types'

interface FeatureCardProps extends Feature {}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative h-full overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_28px_80px_-45px_rgba(15,23,42,0.55)]">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-6 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />
    </div>
  )
}
