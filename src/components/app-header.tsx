import { type FormEvent, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  Home,
  KeyRound,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api, clearTokens, getCurrentUserRole } from '@/lib/api'
import { disconnectChatSocket, onIncomingNotification } from '@/lib/chat-socket'
import { useCurrentUser } from '@/lib/current-user'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { user } = useCurrentUser()
  const tokenRole = getCurrentUserRole()
  const role = tokenRole ?? user?.role ?? 'STUDENT'

  const myAvatar = resolveAvatar(user?.avatarUrl)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  useEffect(() => {
    api
      .get<{ count: number }>('/api/notifications/unread-count')
      .then((res) => setUnreadNotificationCount(res.count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    return onIncomingNotification(() => setUnreadNotificationCount((count) => count + 1))
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const homeUrl = role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/events/manage' : '/home'

  // Giao diện điều hướng CHUYÊN BIỆT cho từng vai trò - tuyệt đối không để lẫn tính năng thừa
  const navItems =
    role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Quản trị hệ thống', icon: ShieldCheck },
          { to: '/events/manage', label: 'Quản lý sự kiện', icon: CalendarDays },
          { to: '/messages', label: 'Tin nhắn hỗ trợ', icon: MessageCircle },
        ]
      : role === 'STAFF'
      ? [
          { to: '/events/manage', label: 'Quản lý sự kiện', icon: CalendarDays },
          { to: '/events', label: 'Bảng tin sự kiện', icon: CalendarDays },
          { to: '/staff/reset-password', label: 'Cấp lại MK học sinh', icon: KeyRound },
          { to: '/messages', label: 'Tin nhắn trao đổi', icon: MessageCircle },
        ]
      : [
          { to: '/home', label: 'Trang chủ', icon: Home },
          { to: '/friends', label: 'Bạn bè', icon: UserCheck },
          { to: '/messages', label: 'Nhắn tin', icon: MessageCircle },
          { to: '/events', label: 'Sự kiện trường', icon: CalendarDays },
          { to: '/groups', label: 'Nhóm học tập', icon: Users },
        ]

  return (
    <header className="border-b-2 border-ink bg-cream">
      <div className="flex items-center justify-between px-6 sm:px-16 py-4 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate(homeUrl)} className="shrink-0">
            <Logo />
          </button>
          {role === 'ADMIN' ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neon text-ink text-[11px] font-bold border border-ink">
              <ShieldCheck className="w-3 h-3" />
              QUẢN TRỊ VIÊN
            </span>
          ) : role === 'STAFF' ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-200 text-ink text-[11px] font-bold border border-ink">
              CÁN BỘ / GIÁO VIÊN
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white text-ink/60 text-[11px] font-semibold border border-ink/20">
              HỌC SINH
            </span>
          )}
        </div>

        {role === 'STUDENT' ? (
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 flex-1 max-w-[420px] px-4 py-2.5 rounded-md border-2 border-ink bg-white"
          >
            <Search className="w-4 h-4 text-ink/50 shrink-0" />
            <input
              type="text"
              placeholder="Tìm bạn, nhóm, sự kiện..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 text-[14px] text-ink outline-none placeholder:text-ink/40 min-w-0"
            />
          </form>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/settings/security')}
            className="w-10 h-10 rounded-full border-2 border-ink bg-white hover:bg-cream flex items-center justify-center"
            title="Cài đặt tài khoản"
            aria-label="Cài đặt"
          >
            <Settings className="w-4.5 h-4.5 text-ink" />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-full border-2 border-ink bg-white hover:bg-cream flex items-center justify-center"
            title="Thông báo"
            aria-label="Thông báo"
          >
            <Bell className="w-4.5 h-4.5 text-ink" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-magenta border-2 border-ink text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            ) : null}
          </button>
          <AvatarIcon
            icon={myAvatar.icon}
            color={myAvatar.color}
            selectable
            onClick={() => navigate(role === 'STUDENT' ? '/profile/me' : '/settings/security')}
            aria-label={role === 'STUDENT' ? 'Hồ sơ của tôi' : 'Tài khoản của tôi'}
          />
          <button
            onClick={() => {
              disconnectChatSocket()
              clearTokens()
              navigate('/login')
            }}
            className="w-10 h-10 rounded-full border-2 border-ink bg-white hover:bg-magenta hover:text-white text-ink flex items-center justify-center transition-colors"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-2 px-6 sm:px-16 pb-3 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold whitespace-nowrap',
                isActive
                  ? item.to === '/admin'
                    ? 'bg-neon text-ink border border-ink'
                    : 'bg-ink text-white'
                  : item.to === '/admin'
                  ? 'bg-white border border-ink text-ink font-bold hover:bg-neon/30'
                  : 'text-ink/55 hover:text-ink',
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
