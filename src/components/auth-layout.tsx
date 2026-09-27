import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/logo'

interface AuthLayoutProps {
  badge: string
  headline: ReactNode
  subtext: string
  children: ReactNode
}

const stats = [
  { value: '1.240+', label: 'Học sinh', color: 'text-neon' },
  { value: '45+', label: 'CLB & Nhóm', color: 'text-cyan' },
  { value: '120+', label: 'Sự kiện/năm', color: 'text-magenta' },
]

export function AuthLayout({ badge, headline, subtext, children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen flex bg-cream">
      <div className="relative w-[600px] shrink-0 bg-ink overflow-hidden hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(212,255,63,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Logo light />
            </Link>
            <span className="-rotate-6 border border-dashed border-neon text-neon text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full">
              {badge}
            </span>
          </div>
          <div>
            <h1 className="font-display font-bold text-[36px] leading-[1.15] text-white mb-5 max-w-[440px]">
              {headline}
            </h1>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-[400px]">{subtext}</p>
          </div>
          <div className="flex gap-8 pt-5 border-t border-white/15">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className={`font-display font-bold text-[24px] ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-white/50 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-8 sm:px-16 py-20">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
