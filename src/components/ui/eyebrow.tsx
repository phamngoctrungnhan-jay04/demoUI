import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const dotColor = {
  magenta: 'bg-magenta',
  neon: 'bg-neon',
  cyan: 'bg-cyan',
} as const

export function Eyebrow({
  children,
  color = 'magenta',
  className,
}: {
  children: ReactNode
  color?: keyof typeof dotColor
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider',
        className,
      )}
    >
      <span className={cn('w-2 h-2', dotColor[color])} />
      {children}
    </span>
  )
}
