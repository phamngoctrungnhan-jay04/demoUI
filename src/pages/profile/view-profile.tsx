import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, MessageCircle, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { FriendActionButton } from '@/components/friend-action-button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { ApiError, api } from '@/lib/api'
import { useCurrentUser } from '@/lib/current-user'
import type { PublicProfileResponse, TagResponse, UserMeResponse } from '@/lib/api-types'

export default function ViewProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMe = id === 'me'
  const { user: me } = useCurrentUser()

  const [profile, setProfile] = useState<PublicProfileResponse | UserMeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [privateProfile, setPrivateProfile] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setPrivateProfile(false)
    setNotFound(false)

    const request = isMe
      ? api.get<UserMeResponse>('/api/users/me')
      : api.get<PublicProfileResponse>(`/api/users/${id}`)

    request
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setPrivateProfile(true)
        else if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id, isMe])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Hồ sơ" />
        <div className="flex justify-center px-6 sm:px-16 py-14">
          <p className="text-ink/60">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (notFound || (!profile && !privateProfile)) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Hồ sơ" />
        <div className="flex justify-center px-6 sm:px-16 py-14">
          <p className="text-ink/60">Không tìm thấy hồ sơ này.</p>
        </div>
      </div>
    )
  }

  if (privateProfile) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Hồ sơ" />
        <main className="flex justify-center px-6 sm:px-16 py-14">
          <div className="w-full max-w-[640px] bg-white border-2 border-ink rounded-lg p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-ink/40 bg-cream flex items-center justify-center mb-6">
              <Lock className="w-9 h-9 text-ink/40" />
            </div>
            <h1 className="font-display font-bold text-[22px] text-ink mb-2">
              Hồ sơ này đang ở chế độ riêng tư
            </h1>
            <p className="text-[14px] text-ink/55 max-w-[380px] mb-8">
              Chủ hồ sơ đã chọn không hiển thị thông tin này cho người khác.
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate('/home')}>
              Quay lại trang chủ
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const data = profile!
  const avatarStyle = resolveAvatar(data.avatarUrl)
  const myTagIds = new Set((me?.tags ?? []).map((tag) => tag.id))
  const shared = isMe ? 0 : data.tags.filter((tag) => myTagIds.has(tag.id)).length
  const userId = 'id' in data ? data.id : null

  return (
    <div className="w-full min-h-screen bg-cream">
      <PageHeader title="Hồ sơ" />
      <main className="flex justify-center px-6 sm:px-16 py-14">
        <div className="w-full max-w-[640px] bg-white border-2 border-ink rounded-lg p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <AvatarIcon icon={avatarStyle.icon} color={avatarStyle.color} size="xl" className="mb-4" />
            <div className="flex items-center gap-2 justify-center flex-wrap mb-1">
              <h1 className="font-display font-bold text-[24px] text-ink">{data.fullName}</h1>
              {'role' in data && data.role === 'ADMIN' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-neon text-ink text-[11px] font-bold border border-ink">
                  QUẢN TRỊ VIÊN
                </span>
              ) : 'role' in data && data.role === 'STAFF' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-200 text-ink text-[11px] font-bold border border-ink">
                  CÁN BỘ / GIÁO VIÊN
                </span>
              ) : null}
            </div>
            {data.className ? <p className="text-[14px] text-ink/55 mb-4">Lớp {data.className}</p> : null}
            {data.bio ? (
              <p className="text-[15px] text-ink/75 leading-relaxed max-w-[440px]">{data.bio}</p>
            ) : null}
          </div>

          <div className="mb-6">
            {!isMe && shared > 0 ? (
              <span className="-rotate-2 inline-block bg-ink text-neon text-[12px] font-bold px-3 py-1.5 rounded-full mb-3">
                {shared} sở thích chung với bạn
              </span>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: TagResponse) => {
                const isShared = !isMe && myTagIds.has(tag.id)
                return (
                  <span
                    key={tag.id}
                    className={
                      isShared
                        ? 'px-3.5 py-1.5 rounded-full bg-magenta text-white text-[13px] font-semibold'
                        : 'px-3.5 py-1.5 rounded-full border-2 border-ink/20 text-ink text-[13px]'
                    }
                  >
                    {tag.name}
                  </span>
                )
              })}
            </div>
          </div>

          {isMe ? (
            <Link to="/profile/edit">
              <Button size="lg" className="w-full flex items-center justify-center gap-2">
                <Pencil className="w-4.5 h-4.5" />
                Chỉnh sửa hồ sơ
              </Button>
            </Link>
          ) : (
            <div className="flex gap-3">
              {userId ? (
                <FriendActionButton userId={userId} size="default" className="flex-1 justify-center py-3 text-[14px]" />
              ) : null}
              <Button
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => navigate(`/messages/${userId}`)}
              >
                <MessageCircle className="w-4.5 h-4.5" />
                Nhắn tin
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
