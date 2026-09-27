import { useEffect, useState } from 'react'
import { Check, Search, UserPlus, X } from 'lucide-react'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { Button } from '@/components/ui/button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import type { UserSearchResponse } from '@/lib/api-types'

export function InviteFriendsModal({
  title,
  subtitle,
  onClose,
  onConfirm,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  onConfirm: (selected: UserSearchResponse[]) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResponse[]>([])
  const [selected, setSelected] = useState<Map<number, UserSearchResponse>>(new Map())

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

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-[540px] bg-white border-2 border-ink rounded-lg p-8">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display font-bold text-[20px] text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-ink" />
          </button>
        </div>
        {subtitle ? <p className="text-[13px] text-ink/55 mb-5">{subtitle}</p> : null}

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

        {selected.size > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {[...selected.values()].map((user) => (
              <span
                key={user.userId}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-magenta text-white text-[12px] font-semibold"
              >
                {user.fullName}
                <button onClick={() => toggle(user)} aria-label={`Bỏ chọn ${user.fullName}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

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
          className="w-full flex items-center justify-center gap-2"
          disabled={selected.size === 0}
          onClick={() => onConfirm([...selected.values()])}
        >
          <UserPlus className="w-4.5 h-4.5" />
          Gửi lời mời ({selected.size} đã chọn)
        </Button>
      </div>
    </div>
  )
}
