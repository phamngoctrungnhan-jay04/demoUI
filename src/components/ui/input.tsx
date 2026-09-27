import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-3 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none placeholder:text-ink/30 focus:border-magenta',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
