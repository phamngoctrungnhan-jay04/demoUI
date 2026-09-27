import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Link as LinkIcon, Search, Send, X } from 'lucide-react'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { Button } from '@/components/ui/button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import type { EventResponse, UserSearchResponse } from '@/lib/api-types'

export function ShareEventModal({ event, onClose }: { event: EventResponse; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResponse[]>([])
  const [selected, setSelected] = useState<Map<number, UserSearchResponse>>(new Map())
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      api
        .get<UserSearchResponse[]>(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
        .then(setResults)
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  function toggle(user: UserSearchResponse) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(user.userId)) next.delete(user.userId)
      else next.set(user.userId, user)
      return next
    })
  }

  async function handleSend() {
    setSending(true)
    try {
      await Promise.all(
        [...selected.values()].map((user) =>
          api.post(`/api/threads/${user.userId}/event-invites`, { eventId: event.id }).catch(() => {}),
        ),
      )
      if (selected.size === 1) {
        navigate(`/messages/${[...selected.values()][0].userId}`)
      }
      onClose()
    } finally {
      setSending(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-[540px] bg-white border-2 border-ink rounded-lg p-8">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display font-bold text-[20px] text-ink">Chia sẻ sự kiện</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-ink" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-cream border-2 border-ink rounded-lg p-3 mb-5 mt-4">
          <div>
            <p className="font-display font-bold text-[14px] text-ink">{event.title}</p>
            <p className="text-[12px] text-ink/55">
              {formatEventDateRange(event.startTime, event.endTime)}
              {event.location ? ` · ${event.location}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-md border-2 border-ink bg-white mb-4">
          <Search className="w-4 h-4 text-ink/50" />
          <input
            type="text"
            placeholder="Tìm bạn theo tên"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 text-[14px] text-ink outline-none placeholder:text-ink/40"
          />
        </div>

        <div className="flex flex-col gap-2.5 mb-6 max-h-[260px] overflow-y-auto">
          {query.trim() && results.length === 0 ? (
            <p className="text-[13px] text-ink/40 text-center py-4">Không tìm thấy học sinh nào.</p>
          ) : null}
          {results.map((user) => {
            const style = resolveAvatar(user.avatarUrl)
            const isSelected = selected.has(user.userId)
            return (
              <label
                key={user.userId}
                className={`flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer ${
                  isSelected ? 'border-ink bg-cream' : 'border-ink/20 bg-white'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded border-2 border-ink flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-neon' : 'bg-white'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 text-ink" /> : null}
                </span>
                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggle(user)} />
                <AvatarIcon icon={style.icon} color={style.color} size="sm" />
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {user.fullName}{' '}
                  {user.className ? <span className="font-normal text-ink/50">· {user.className}</span> : null}
                </span>
              </label>
            )
          })}
        </div>

        <Button
          size="lg"
          className="w-full flex items-center justify-center gap-2 mb-3"
          disabled={selected.size === 0 || sending}
          onClick={handleSend}
        >
          <Send className="w-4.5 h-4.5" />
          Gửi thiệp mời ({selected.size} đã chọn)
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleCopyLink}
        >
          <LinkIcon className="w-4 h-4" />
          {copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
        </Button>
      </div>
    </div>
  )
}
