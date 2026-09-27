import { cn } from '@/lib/utils'

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-9 h-9 rounded-md bg-neon flex items-center justify-center text-ink font-display font-bold text-lg">
        K
      </div>
      <span className={cn('font-display font-semibold text-lg', light ? 'text-white' : 'text-ink')}>
        Kết Nối Học Đường
      </span>
    </div>
  )
}
