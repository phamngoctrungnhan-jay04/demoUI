import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'

import { getCurrentUserRole } from '@/lib/api'

export function SettingsLayout({ children }: { children: ReactNode }) {
  const role = getCurrentUserRole()

  const navItems =
    role === 'STUDENT'
      ? [
          { to: '/profile/edit', label: 'Hồ sơ học sinh' },
          { to: '/settings/notifications', label: 'Thông báo' },
          { to: '/settings/blocked', label: 'Người đã chặn' },
          { to: '/settings/security', label: 'Đổi mật khẩu & Bảo mật' },
        ]
      : [
          { to: '/settings/security', label: 'Đổi mật khẩu & Tài khoản' },
          { to: '/settings/notifications', label: 'Thông báo' },
        ]

  return (
    <div className="w-full min-h-screen bg-cream">
      <PageHeader title="Cài đặt tài khoản" />
      <main className="flex flex-col sm:flex-row px-6 sm:px-16 py-10 gap-10">
        <div className="w-full sm:w-[240px] shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'block px-4 py-3 rounded-md text-[14px] mb-1',
                  isActive
                    ? 'border-2 border-ink bg-neon font-display font-bold text-ink'
                    : 'font-medium text-ink/60 hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 max-w-[640px]">{children}</div>
      </main>
    </div>
  )
}
