import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Send, UserX } from 'lucide-react'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { EventInviteCard } from '@/components/event-invite-card'
import { GroupInviteCard } from '@/components/group-invite-card'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import { onIncomingMessage } from '@/lib/chat-socket'
import { useCurrentUser } from '@/lib/current-user'
import type { MessageResponse, PublicProfileResponse, ThreadResponse } from '@/lib/api-types'

const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>()
  const otherUserId = Number(id)
  const navigate = useNavigate()
  const { user: me } = useCurrentUser()

  const [otherUser, setOtherUser] = useState<{ fullName: string; className: string | null; avatarUrl: string | null } | null>(null)
  const [, setThreadId] = useState<number | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!otherUserId) return
    setLoading(true)

    Promise.all([
      api.get<ThreadResponse[]>('/api/threads'),
      api.get<PublicProfileResponse>(`/api/users/${otherUserId}`).catch(() => null),
    ]).then(async ([threads, profile]) => {
      const thread = threads.find((t) => t.otherUserId === otherUserId)
      if (profile) {
        setOtherUser({ fullName: profile.fullName, className: profile.className, avatarUrl: profile.avatarUrl })
      } else if (thread) {
        setOtherUser({
          fullName: thread.otherUserFullName ?? 'Học sinh',
          className: null,
          avatarUrl: thread.otherUserAvatarUrl,
        })
      } else {
        setOtherUser({ fullName: 'Học sinh', className: null, avatarUrl: null })
      }

      if (thread) {
        setThreadId(thread.threadId)
        const history = await api.get<MessageResponse[]>(`/api/threads/${thread.threadId}/messages`)
        setMessages(history)
      }
      setLoading(false)
    })
  }, [otherUserId])

  useEffect(() => {
    const unsubscribe = onIncomingMessage((message) => {
      if (message.senderId !== otherUserId) return
      setThreadId(message.threadId)
      setMessages((prev) => [...prev, message])
    })
    return unsubscribe
  }, [otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (loading || !otherUser) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-ink">Đang tải...</div>
  }

  const avatarStyle = resolveAvatar(otherUser.avatarUrl)

  async function handleSend(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !otherUserId) return

    // Tự động nhận diện nếu tin nhắn là link chia sẻ sự kiện trường hoặc nhóm học tập
    const eventLinkMatch = text.match(/(?:https?:\/\/[^\s]+)?\/events\/(\d+)/i)
    const groupLinkMatch = text.match(/(?:https?:\/\/[^\s]+)?\/groups\/(\d+)/i)

    // Nếu dán link sự kiện (vd: http://localhost:5173/events/3 hoặc /events/3)
    if (eventLinkMatch && !text.replace(eventLinkMatch[0], '').trim()) {
      try {
        const eventId = Number(eventLinkMatch[1])
        const message = await api.post<MessageResponse>(`/api/threads/${otherUserId}/event-invites`, {
          eventId,
        })
        setThreadId(message.threadId)
        setMessages((prev) => [...prev, message])
        setDraft('')
        return
      } catch {
        // Fallback gửi qua tin nhắn thường nếu gọi endpoint thiệp mời lỗi
      }
    }

    // Nếu dán link nhóm học tập (vd: http://localhost:5173/groups/7 hoặc /groups/7)
    if (groupLinkMatch && !text.replace(groupLinkMatch[0], '').trim()) {
      try {
        const groupId = Number(groupLinkMatch[1])
        const message = await api.post<MessageResponse>(`/api/threads/${otherUserId}/group-invites`, {
          groupId,
        })
        setThreadId(message.threadId)
        setMessages((prev) => [...prev, message])
        setDraft('')
        return
      } catch {
        // Fallback gửi qua tin nhắn thường nếu gọi endpoint thiệp mời lỗi
      }
    }

    try {
      const message = await api.post<MessageResponse>(`/api/threads/${otherUserId}/messages`, {
        content: text,
      })
      setThreadId(message.threadId)
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch {
      // Người nhận đã chặn / không tồn tại — giữ nguyên nội dung để thử lại.
    }
  }

  async function handleBlock() {
    await api.post(`/api/users/${otherUserId}/block`)
    navigate('/messages')
  }

  return (
    <div className="w-full min-h-screen bg-cream flex flex-col">
      <header className="flex items-center gap-3 px-6 sm:px-16 py-3.5 border-b-2 border-ink bg-cream">
        <button
          onClick={() => navigate('/messages')}
          className="w-10 h-10 rounded-full border-2 border-ink bg-white flex items-center justify-center shrink-0"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-ink" />
        </button>
        <AvatarIcon icon={avatarStyle.icon} color={avatarStyle.color} />
        <div className="flex-1">
          <p className="font-display font-bold text-[16px] text-ink">{otherUser.fullName}</p>
          {otherUser.className ? <p className="text-[12px] text-ink/50">Lớp {otherUser.className}</p> : null}
        </div>
        {me?.role === 'STUDENT' ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="w-10 h-10 rounded-full border-2 border-ink bg-white flex items-center justify-center"
              aria-label="Thêm tuỳ chọn"
            >
              <MoreVertical className="w-4.5 h-4.5 text-ink" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-12 z-10 bg-white border-2 border-ink rounded-md overflow-hidden w-44">
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-semibold text-magenta hover:bg-cream"
                >
                  <UserX className="w-4 h-4" />
                  Chặn người dùng
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 sm:px-10 py-8">
        {messages.length === 0 ? (
          <p className="text-center text-ink/40 text-[14px] mt-10">
            Chưa có tin nhắn nào. Hãy là người đầu tiên bắt chuyện!
          </p>
        ) : null}
        {messages.map((message) => {
          const isMe = message.senderId === me?.id

          // 1. Nhận diện event invite: từ type EVENT_INVITE hoặc qua link sự kiện trong tin nhắn
          const eventId =
            message.type === 'EVENT_INVITE' && message.eventId
              ? String(message.eventId)
              : message.content?.match(/(?:https?:\/\/[^\s]+)?\/events\/(\d+)/i)?.[1]

          if (eventId) {
            return (
              <div key={message.id} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div>
                  <EventInviteCard eventId={eventId} />
                  <p className={`text-[11px] text-ink/40 mt-1 ${isMe ? 'text-right' : ''}`}>
                    {timeFormatter.format(new Date(message.sentAt))}
                  </p>
                </div>
              </div>
            )
          }

          // 2. Nhận diện group invite: từ type GROUP_INVITE hoặc qua link nhóm trong tin nhắn
          const groupId =
            message.type === 'GROUP_INVITE' && message.groupId
              ? String(message.groupId)
              : message.content?.match(/(?:https?:\/\/[^\s]+)?\/groups\/(\d+)/i)?.[1]

          if (groupId) {
            return (
              <div key={message.id} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div>
                  <GroupInviteCard groupId={groupId} />
                  <p className={`text-[11px] text-ink/40 mt-1 ${isMe ? 'text-right' : ''}`}>
                    {timeFormatter.format(new Date(message.sentAt))}
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div key={message.id} className={`mb-1 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div>
                <div
                  className={
                    isMe
                      ? 'max-w-[70%] bg-neon border-2 border-ink rounded-2xl rounded-br-sm px-4 py-2.5 ml-auto'
                      : 'max-w-[70%] bg-white border-2 border-ink rounded-2xl rounded-bl-sm px-4 py-2.5'
                  }
                >
                  <p className="text-[14px] text-ink font-medium whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className={`text-[11px] text-ink/40 mt-1 ${isMe ? 'text-right' : ''}`}>
                  {timeFormatter.format(new Date(message.sentAt))}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={handleSend} className="flex items-center gap-3 px-6 sm:px-16 py-5 border-t-2 border-ink bg-cream">
        <input
          type="text"
          placeholder="Nhắn tin..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="flex-1 px-4 py-3 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="w-11 h-11 rounded-full border-2 border-ink bg-neon flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <Send className="w-4.5 h-4.5 text-ink" />
        </button>
      </form>
    </div>
  )
}
