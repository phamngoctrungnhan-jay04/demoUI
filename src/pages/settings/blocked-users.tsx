import { useEffect, useState } from 'react'
import { SettingsLayout } from '@/components/settings-layout'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { Button } from '@/components/ui/button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'

interface BlockedUserResponse {
  userId: number
  fullName: string
  avatarUrl: string | null
}

export default function BlockedUsersPage() {
  const [blocked, setBlocked] = useState<BlockedUserResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<BlockedUserResponse[]>('/api/users/me/blocks')
      .then(setBlocked)
      .finally(() => setLoading(false))
  }, [])

  async function unblock(userId: number) {
    await api.delete(`/api/users/${userId}/block`)
    setBlocked((prev) => prev.filter((user) => user.userId !== userId))
  }

  return (
    <SettingsLayout>
      <div className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-1">
        <span className="w-2 h-2 bg-magenta" />
        Người đã chặn
      </div>
      <h1 className="font-display font-bold text-[24px] text-ink mb-6">
        {loading ? 'Đang tải...' : blocked.length > 0 ? `${blocked.length} người bạn đã chặn` : 'Bạn chưa chặn ai'}
      </h1>

      {!loading && blocked.length === 0 ? (
        <p className="text-[14px] text-ink/50">
          Khi bạn chặn ai đó, họ sẽ xuất hiện ở đây và bạn có thể bỏ chặn bất cứ lúc nào.
        </p>
      ) : (
        blocked.map((user) => {
          const style = resolveAvatar(user.avatarUrl)
          return (
            <div key={user.userId} className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4 mb-4">
              <AvatarIcon icon={style.icon} color={style.color} size="lg" />
              <p className="flex-1 font-semibold text-[15px] text-ink">{user.fullName}</p>
              <Button variant="outline" size="sm" onClick={() => unblock(user.userId)}>
                Bỏ chặn
              </Button>
            </div>
          )
        })
      )}
    </SettingsLayout>
  )
}
