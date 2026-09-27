import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Clock, MessageCircle, UserCheck, UserPlus, Users, X } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import type { FriendRequestResponse, FriendResponse } from '@/lib/api-types'

export default function FriendsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'friends' | 'received' | 'sent'>('friends')
  const [friends, setFriends] = useState<FriendResponse[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestResponse[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestResponse[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [friendsData, receivedData, sentData] = await Promise.all([
        api.get<FriendResponse[]>('/api/friends'),
        api.get<FriendRequestResponse[]>('/api/friends/requests'),
        api.get<FriendRequestResponse[]>('/api/friends/sent-requests'),
      ])
      setFriends(friendsData)
      setReceivedRequests(receivedData)
      setSentRequests(sentData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAccept(userId: number) {
    try {
      await api.post(`/api/friends/accept/${userId}`)
      await loadData()
    } catch {
      // Bỏ qua
    }
  }

  async function handleReject(userId: number) {
    try {
      await api.post(`/api/friends/reject/${userId}`)
      setReceivedRequests((prev) => prev.filter((r) => r.userId !== userId))
    } catch {
      // Bỏ qua
    }
  }

  async function handleCancelSent(userId: number) {
    try {
      await api.post(`/api/friends/cancel/${userId}`)
      setSentRequests((prev) => prev.filter((r) => r.userId !== userId))
    } catch {
      // Bỏ qua
    }
  }

  async function handleUnfriend(userId: number) {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ kết bạn không?')) return
    try {
      await api.delete(`/api/friends/${userId}`)
      setFriends((prev) => prev.filter((f) => f.userId !== userId))
    } catch {
      // Bỏ qua
    }
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[860px] mx-auto px-6 sm:px-16 py-10">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <Eyebrow color="magenta" className="mb-1">
              Bạn bè & Kết nối
            </Eyebrow>
            <h1 className="font-display font-bold text-[26px] text-ink">Bạn bè của tôi</h1>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate('/home')}
          >
            <UserPlus className="w-4 h-4" />
            Khám phá bạn mới
          </Button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6 border-b-2 border-ink/15 pb-3 flex-wrap">
          <button
            type="button"
            onClick={() => setTab('friends')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'friends'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            <Users className="w-4 h-4" />
            Bạn bè
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'friends' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {friends.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'received'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Lời mời kết bạn
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                receivedRequests.length > 0
                  ? 'bg-magenta text-white'
                  : tab === 'received'
                  ? 'bg-neon/20 text-neon'
                  : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {receivedRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'sent'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            <Clock className="w-4 h-4" />
            Đã gửi
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'sent' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {sentRequests.length}
            </span>
          </button>
        </div>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tải dữ liệu...</p> : null}

        {/* Tab 1: Danh sách bạn bè */}
        {!loading && tab === 'friends' ? (
          <div>
            {friends.length === 0 ? (
              <div className="bg-white border-2 border-ink rounded-lg p-8 text-center max-w-[540px] mx-auto">
                <Users className="w-12 h-12 text-ink/30 mx-auto mb-3" />
                <p className="font-display font-bold text-[17px] text-ink mb-2">Bạn chưa có bạn bè nào</p>
                <p className="text-[14px] text-ink/60 mb-5">
                  Hãy xem các gợi ý bạn cùng gu ở Trang chủ hoặc tìm kiếm bạn bè trong trường để kết nối nhé!
                </p>
                <Button size="sm" onClick={() => navigate('/home')}>
                  Khám phá gợi ý bạn bè
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map((friend) => {
                  const avatar = resolveAvatar(friend.avatarUrl)
                  return (
                    <div
                      key={friend.userId}
                      className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4"
                    >
                      <Link to={`/profile/${friend.userId}`} className="shrink-0">
                        <AvatarIcon icon={avatar.icon} color={avatar.color} size="lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${friend.userId}`}
                          className="font-display font-bold text-[16px] text-ink hover:text-magenta block truncate"
                        >
                          {friend.fullName}
                        </Link>
                        <p className="text-[13px] text-ink/50">
                          {friend.className ? `Lớp ${friend.className} · ` : ''}
                          Mã HS: {friend.studentCode}
                        </p>
                        {friend.bio ? (
                          <p className="text-[12px] text-ink/60 truncate mt-0.5">{friend.bio}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/messages/${friend.userId}`)}
                          className="flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Nhắn tin
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleUnfriend(friend.userId)}
                          className="px-3 py-1.5 rounded-md border-2 border-ink bg-white text-ink text-[12px] font-semibold hover:bg-magenta/10 hover:text-magenta transition-colors"
                        >
                          Huỷ kết bạn
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Tab 2: Lời mời kết bạn nhận được */}
        {!loading && tab === 'received' ? (
          <div>
            {receivedRequests.length === 0 ? (
              <div className="bg-white border-2 border-ink rounded-lg p-8 text-center max-w-[540px] mx-auto">
                <UserCheck className="w-12 h-12 text-ink/30 mx-auto mb-3" />
                <p className="font-display font-bold text-[17px] text-ink mb-2">Không có lời mời nào</p>
                <p className="text-[14px] text-ink/60">
                  Khi có bạn học sinh khác gửi lời mời kết bạn, thông báo sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {receivedRequests.map((req) => {
                  const avatar = resolveAvatar(req.avatarUrl)
                  return (
                    <div
                      key={req.requestId}
                      className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4"
                    >
                      <Link to={`/profile/${req.userId}`} className="shrink-0">
                        <AvatarIcon icon={avatar.icon} color={avatar.color} size="lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${req.userId}`}
                          className="font-display font-bold text-[16px] text-ink hover:text-magenta block truncate"
                        >
                          {req.fullName}
                        </Link>
                        <p className="text-[13px] text-ink/50">
                          {req.className ? `Lớp ${req.className}` : 'Học sinh'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(req.userId)}
                          className="bg-neon text-ink flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Đồng ý
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.userId)}
                          className="px-3 py-1.5 rounded-md border-2 border-ink bg-white text-ink text-[12px] font-semibold hover:bg-magenta/10 hover:text-magenta transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Tab 3: Lời mời đã gửi */}
        {!loading && tab === 'sent' ? (
          <div>
            {sentRequests.length === 0 ? (
              <div className="bg-white border-2 border-ink rounded-lg p-8 text-center max-w-[540px] mx-auto">
                <Clock className="w-12 h-12 text-ink/30 mx-auto mb-3" />
                <p className="font-display font-bold text-[17px] text-ink mb-2">Chưa gửi lời mời nào</p>
                <p className="text-[14px] text-ink/60">
                  Bạn chưa có lời mời kết bạn nào đang chờ phản hồi.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sentRequests.map((req) => {
                  const avatar = resolveAvatar(req.avatarUrl)
                  return (
                    <div
                      key={req.requestId}
                      className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4"
                    >
                      <Link to={`/profile/${req.userId}`} className="shrink-0">
                        <AvatarIcon icon={avatar.icon} color={avatar.color} size="lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${req.userId}`}
                          className="font-display font-bold text-[16px] text-ink hover:text-magenta block truncate"
                        >
                          {req.fullName}
                        </Link>
                        <p className="text-[13px] text-ink/50">
                          {req.className ? `Lớp ${req.className}` : 'Học sinh'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCancelSent(req.userId)}
                          className="px-3 py-1.5 rounded-md border-2 border-ink bg-white text-ink text-[12px] font-semibold hover:border-magenta hover:text-magenta transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Huỷ lời mời
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
