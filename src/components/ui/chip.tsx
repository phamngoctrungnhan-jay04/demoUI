import type { ButtonHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'px-4 py-2 rounded-full text-[14px] font-semibold border-2 flex items-center gap-1.5 transition-colors',
        selected ? 'bg-magenta text-white border-ink' : 'bg-white text-ink border-ink/25 hover:border-ink/50',
        className,
      )}
      {...props}
    >
      {selected ? <Check className="w-3.5 h-3.5" /> : null}
      {children}
    </button>
  )
}
