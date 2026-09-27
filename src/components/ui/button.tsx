import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-display font-bold transition-transform active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-neon text-ink border-2 border-ink',
        outline: 'bg-white text-ink border-2 border-ink',
        ghost: 'text-ink/60 hover:text-ink font-sans font-semibold',
        danger: 'bg-white text-magenta border-2 border-magenta',
        dark: 'bg-ink text-neon border-2 border-ink',
      },
      size: {
        default: 'px-6 py-3 text-[15px]',
        sm: 'px-4 py-2 text-[13px]',
        lg: 'px-7 py-3.5 text-[16px]',
        icon: 'w-10 h-10 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
