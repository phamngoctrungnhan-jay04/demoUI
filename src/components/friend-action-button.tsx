import { useEffect, useState } from 'react'
import { Check, Clock, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { FriendshipStatusResponse, FriendshipStatusType } from '@/lib/api-types'

interface FriendActionButtonProps {
  userId: number
  initialStatus?: FriendshipStatusType
  onStatusChange?: (newStatus: FriendshipStatusType) => void
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function FriendActionButton({
  userId,
  initialStatus,
  onStatusChange,
  size = 'sm',
  className = '',
}: FriendActionButtonProps) {
  const [status, setStatus] = useState<FriendshipStatusType>(initialStatus ?? 'NONE')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus)
      return
    }
    api
      .get<FriendshipStatusResponse>(`/api/friends/status/${userId}`)
      .then((res) => setStatus(res.status))
      .catch(() => setStatus('NONE'))
  }, [userId, initialStatus])

  async function handleSend() {
    setBusy(true)
    try {
      const res = await api.post<FriendshipStatusResponse>(`/api/friends/request/${userId}`)
      setStatus(res.status)
      onStatusChange?.(res.status)
    } catch {
      // Giữ nguyên trạng thái nếu lỗi
    } finally {
      setBusy(false)
    }
  }

  async function handleAccept() {
    setBusy(true)
    try {
      const res = await api.post<FriendshipStatusResponse>(`/api/friends/accept/${userId}`)
      setStatus(res.status)
      onStatusChange?.(res.status)
    } catch {
      // Giữ nguyên
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    setBusy(true)
    try {
      await api.post(`/api/friends/reject/${userId}`)
      setStatus('NONE')
      onStatusChange?.('NONE')
    } catch {
      // Giữ nguyên
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    setBusy(true)
    try {
      await api.post(`/api/friends/cancel/${userId}`)
      setStatus('NONE')
      onStatusChange?.('NONE')
    } catch {
      // Giữ nguyên
    } finally {
      setBusy(false)
    }
  }

  async function handleUnfriend() {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ kết bạn không?')) return
    setBusy(true)
    try {
      await api.delete(`/api/friends/${userId}`)
      setStatus('NONE')
      onStatusChange?.('NONE')
    } catch {
      // Giữ nguyên
    } finally {
      setBusy(false)
    }
  }

  if (status === 'FRIENDS') {
    return (
      <div className={`relative group shrink-0 ${className}`}>
        <button
          type="button"
          onClick={handleUnfriend}
          disabled={busy}
          title="Nhấp để huỷ kết bạn"
          className="px-3 py-1.5 rounded-md border-2 border-ink bg-neon/30 text-ink text-[12px] font-bold flex items-center gap-1.5 hover:bg-magenta/15 hover:text-magenta transition-colors"
        >
          <Check className="w-3.5 h-3.5 group-hover:hidden" />
          <X className="w-3.5 h-3.5 hidden group-hover:inline" />
          <span className="group-hover:hidden">Bạn bè</span>
          <span className="hidden group-hover:inline">Huỷ kết bạn</span>
        </button>
      </div>
    )
  }

  if (status === 'PENDING_SENT') {
    return (
      <button
        type="button"
        onClick={handleCancel}
        disabled={busy}
        title="Nhấn để huỷ lời mời kết bạn"
        className={`px-3 py-1.5 rounded-md border-2 border-dashed border-ink/40 bg-ink/5 text-ink/75 text-[12px] font-semibold hover:border-magenta hover:text-magenta hover:bg-magenta/5 flex items-center gap-1.5 transition-colors shrink-0 ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Đã gửi lời mời</span>
        <X className="w-3 h-3 text-ink/40" />
      </button>
    )
  }

  if (status === 'PENDING_RECEIVED') {
    return (
      <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
        <Button
          size={size}
          onClick={handleAccept}
          disabled={busy}
          className="flex items-center gap-1 bg-neon text-ink"
        >
          <Check className="w-3.5 h-3.5" />
          Đồng ý
        </Button>
        <button
          type="button"
          onClick={handleReject}
          disabled={busy}
          className="px-2.5 py-1.5 rounded-md border-2 border-ink bg-white text-ink text-[12px] font-semibold hover:bg-magenta/10 hover:text-magenta transition-colors"
        >
          Từ chối
        </button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleSend}
      disabled={busy}
      className={`flex items-center gap-1.5 shrink-0 ${className}`}
    >
      <UserPlus className="w-3.5 h-3.5" />
      Kết bạn
    </Button>
  )
}
