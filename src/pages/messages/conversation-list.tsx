import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/current-user'
import type { ThreadResponse } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })

export default function ConversationListPage() {
  const { user: me } = useCurrentUser()
  const [threads, setThreads] = useState<ThreadResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<ThreadResponse[]>('/api/threads')
      .then(setThreads)
      .finally(() => setLoading(false))
  }, [])

  const role = me?.role ?? 'STUDENT'
  const eyebrowText = role === 'ADMIN' ? 'Quản trị viên' : role === 'STAFF' ? 'Cán bộ nhà trường' : 'Nhắn tin'
  const titleText = role === 'ADMIN' ? 'Hộp thư hỗ trợ' : role === 'STAFF' ? 'Hộp thư trao đổi' : 'Hội thoại của bạn'
  const emptyText =
    role === 'ADMIN'
      ? 'Chưa có hội thoại nào. Bạn có thể bấm nút "Nhắn tin" tại từng người dùng trong Bảng quản trị người dùng để bắt đầu.'
      : role === 'STAFF'
      ? 'Chưa có cuộc trò chuyện nào với học sinh hoặc đồng nghiệp.'
      : 'Chưa có cuộc trò chuyện nào — nhắn tin cho một người bạn cùng sở thích để bắt đầu.'

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[720px] mx-auto px-6 sm:px-16 py-10">
        <Eyebrow color={role === 'ADMIN' ? 'neon' : role === 'STAFF' ? 'cyan' : 'magenta'} className="mb-1">
          {eyebrowText}
        </Eyebrow>
        <h1 className="font-display font-bold text-[26px] text-ink mb-6">{titleText}</h1>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tải...</p> : null}
        {!loading && threads.length === 0 ? (
          <p className="text-ink/50 text-[14px]">{emptyText}</p>
        ) : null}

        {threads.map((thread) => {
          const avatarStyle = resolveAvatar(thread.otherUserAvatarUrl)
          const isUnread = thread.unreadCount > 0

          return (
            <Link
              key={thread.threadId}
              to={`/messages/${thread.otherUserId}`}
              className={cn(
                'flex items-center gap-4 bg-white rounded-lg p-4 mb-3',
                isUnread ? 'border-2 border-ink' : 'border-2 border-ink/15',
              )}
            >
              <div className="relative shrink-0">
                <AvatarIcon icon={avatarStyle.icon} color={avatarStyle.color} size="lg" />
                {isUnread ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-magenta border-2 border-white" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-display font-bold text-[15px]', isUnread ? 'text-ink' : 'text-ink/70')}>
                  {thread.otherUserFullName ?? 'Học sinh'}
                </p>
                <p className={cn('text-[14px] truncate', isUnread ? 'text-ink font-semibold' : 'text-ink/50')}>
                  {thread.lastMessageFromMe ? 'Bạn: ' : ''}
                  {thread.lastMessageContent}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={cn('text-[12px]', isUnread ? 'text-ink/50' : 'text-ink/40')}>
                  {thread.lastMessageAt ? timeFormatter.format(new Date(thread.lastMessageAt)) : ''}
                </span>
                {isUnread ? <span className="w-2.5 h-2.5 rounded-full bg-magenta" /> : null}
              </div>
            </Link>
          )
        })}
      </main>
    </div>
  )
}
