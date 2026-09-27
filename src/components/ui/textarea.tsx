import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-3 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none resize-none placeholder:text-ink/30 focus:border-magenta',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
