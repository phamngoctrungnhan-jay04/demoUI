import type { ButtonHTMLAttributes } from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const bgByColor = {
  neon: 'bg-neon text-ink',
  magenta: 'bg-magenta text-white',
  cyan: 'bg-cyan text-ink',
  ink: 'bg-ink text-neon',
  muted: 'bg-ink/10 text-ink/60',
} as const

export type AvatarColor = keyof typeof bgByColor

interface AvatarIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  color?: AvatarColor
  size?: 'sm' | 'md' | 'lg' | 'xl'
  selected?: boolean
  selectable?: boolean
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6.5 h-6.5',
  xl: 'w-10 h-10',
}

export function AvatarIcon({
  icon: Icon,
  color = 'neon',
  size = 'md',
  selected,
  selectable,
  className,
  ...props
}: AvatarIconProps) {
  return (
    <button
      type="button"
      tabIndex={selectable ? 0 : -1}
      aria-hidden={selectable ? undefined : true}
      className={cn(
        'relative shrink-0 rounded-full border-2 flex items-center justify-center',
        sizeMap[size],
        selected ? 'border-magenta' : 'border-ink',
        bgByColor[color],
        selectable ? 'cursor-pointer' : 'cursor-default pointer-events-none',
        className,
      )}
      {...props}
    >
      <Icon className={iconSizeMap[size]} />
      {selected ? (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-magenta border-2 border-ink flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      ) : null}
    </button>
  )
}
