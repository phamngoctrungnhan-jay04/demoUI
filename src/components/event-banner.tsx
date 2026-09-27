import { Code2, Music4, PartyPopper, Trophy, type LucideIcon } from 'lucide-react'
import type { EventIconKey } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const iconMap: Record<EventIconKey, LucideIcon> = {
  PARTY: PartyPopper,
  TROPHY: Trophy,
  MUSIC: Music4,
  CODE: Code2,
}

export const eventBannerStyles: Record<EventIconKey, { bg: string; fg: string }> = {
  PARTY: { bg: 'bg-magenta', fg: 'text-white' },
  TROPHY: { bg: 'bg-neon', fg: 'text-ink' },
  MUSIC: { bg: 'bg-cyan', fg: 'text-ink' },
  CODE: { bg: 'bg-ink', fg: 'text-neon' },
}

export function EventBanner({
  iconKey,
  size = 'card',
  className,
}: {
  iconKey: EventIconKey
  size?: 'card' | 'hero'
  className?: string
}) {
  const Icon = iconMap[iconKey]
  const style = eventBannerStyles[iconKey]
  return (
    <div
      className={cn(
        'flex items-center justify-center border-2 border-ink',
        size === 'hero' ? 'h-56 rounded-lg' : 'h-28',
        style.bg,
        className,
      )}
    >
      <Icon className={cn(size === 'hero' ? 'w-16 h-16' : 'w-10 h-10', style.fg)} />
    </div>
  )
}
