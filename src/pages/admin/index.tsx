import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  Check,
  Copy,
  KeyRound,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { ApiError, api } from '@/lib/api'
import { useCurrentUser } from '@/lib/current-user'
import type {
  AdminUserResponse,
  IcebreakerQuestionResponse,
  ResetPasswordResponse,
  TagResponse,
  TagType,
} from '@/lib/api-types'

export default function AdminPortalPage() {
  const navigate = useNavigate()
  const { user: me, loading: userLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'users' | 'tags' | 'icebreakers'>('users')

  // Users state
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userError, setUserError] = useState('')

  // Role edit modal
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserResponse | null>(null)
  const [newRole, setNewRole] = useState<'STUDENT' | 'STAFF' | 'ADMIN'>('STUDENT')
  const [roleUpdating, setRoleUpdating] = useState(false)

  // Password reset modal
  const [resettingUser, setResettingUser] = useState<AdminUserResponse | null>(null)
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Tags state
  const [tags, setTags] = useState<TagResponse[]>([])
  const [tagQuery, setTagQuery] = useState('')
  const [loadingTags, setLoadingTags] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null)
  const [tagName, setTagName] = useState('')
  const [tagType, setTagType] = useState<TagType>('SUBJECT')
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [tagError, setTagError] = useState('')

  // Icebreakers state
  const [icebreakers, setIcebreakers] = useState<IcebreakerQuestionResponse[]>([])
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false)
  const [icebreakerModalOpen, setIcebreakerModalOpen] = useState(false)
  const [editingIcebreaker, setEditingIcebreaker] = useState<IcebreakerQuestionResponse | null>(null)
  const [icebreakerQuestion, setIcebreakerQuestion] = useState('')
  const [icebreakerSubmitting, setIcebreakerSubmitting] = useState(false)
  const [icebreakerError, setIcebreakerError] = useState('')

  // Security check: only ADMIN
  useEffect(() => {
    if (!userLoading && me && me.role !== 'ADMIN') {
      navigate('/home')
    }
  }, [me, userLoading, navigate])

  // Load all initial data on mount so tab badge counters are accurate
  useEffect(() => {
    loadUsers()
    loadTags()
    loadIcebreakers()
  }, [])

  function loadUsers() {
    setLoadingUsers(true)
    setUserError('')
    api
      .get<AdminUserResponse[]>('/api/admin/users')
      .then(setUsers)
      .catch((err) => setUserError(err instanceof ApiError ? err.message : 'Không tải được danh sách người dùng.'))
      .finally(() => setLoadingUsers(false))
  }

  function loadTags() {
    setLoadingTags(true)
    api
      .get<TagResponse[]>('/api/tags')
      .then(setTags)
      .catch(() => {})
      .finally(() => setLoadingTags(false))
  }

  function loadIcebreakers() {
    setLoadingIcebreakers(true)
    api
      .get<IcebreakerQuestionResponse[]>('/api/icebreakers')
      .then(setIcebreakers)
      .catch(() => {})
      .finally(() => setLoadingIcebreakers(false))
  }

  // Handle Role Change
  async function handleSaveRole() {
    if (!selectedUserForRole) return
    setRoleUpdating(true)
    try {
      await api.put(`/api/admin/users/${selectedUserForRole.id}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => (u.id === selectedUserForRole.id ? { ...u, role: newRole } : u)))
      setSelectedUserForRole(null)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Không đổi được quyền')
    } finally {
      setRoleUpdating(false)
    }
  }

  // Handle Password Reset
  async function handleResetPassword(targetUser: AdminUserResponse) {
    setResettingUser(targetUser)
    setResetResult(null)
    setCopied(false)
    setResetSubmitting(true)
    try {
      const res = await api.post<ResetPasswordResponse>(`/api/admin/users/${targetUser.id}/reset-password`)
      setResetResult(res)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Không cấp lại được mật khẩu')
      setResettingUser(null)
    } finally {
      setResetSubmitting(false)
    }
  }

  // Handle Tag Create / Update
  async function handleSaveTag() {
    if (!tagName.trim()) {
      setTagError('Tên sở thích không được để trống')
      return
    }
    setTagSubmitting(true)
    setTagError('')
    try {
      if (editingTag) {
        const updated = await api.put<TagResponse>(`/api/admin/tags/${editingTag.id}`, {
          name: tagName.trim(),
          type: tagType,
        })
        setTags((prev) => prev.map((t) => (t.id === editingTag.id ? updated : t)))
      } else {
        const created = await api.post<TagResponse>('/api/admin/tags', {
          name: tagName.trim(),
          type: tagType,
        })
        setTags((prev) => [...prev, created])
      }
      setTagModalOpen(false)
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : 'Lỗi khi lưu thẻ')
    } finally {
      setTagSubmitting(false)
    }
  }

  async function handleDeleteTag(tagId: number, tagName: string) {
    if (!window.confirm(`Bạn có chắc muốn xoá thẻ "${tagName}"? Thẻ này sẽ bị gỡ khỏi mọi hồ sơ học sinh đang gắn.`)) {
      return
    }
    try {
      await api.delete(`/api/admin/tags/${tagId}`)
      setTags((prev) => prev.filter((t) => t.id !== tagId))
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Không xoá được thẻ')
    }
  }

  // Handle Icebreaker Create / Update
  async function handleSaveIcebreaker() {
    if (!icebreakerQuestion.trim()) {
      setIcebreakerError('Nội dung câu hỏi không được để trống')
      return
    }
    setIcebreakerSubmitting(true)
    setIcebreakerError('')
    try {
      if (editingIcebreaker) {
        const updated = await api.put<IcebreakerQuestionResponse>(`/api/admin/icebreakers/${editingIcebreaker.id}`, {
          content: icebreakerQuestion.trim(),
        })
        setIcebreakers((prev) => prev.map((q) => (q.id === editingIcebreaker.id ? updated : q)))
      } else {
        const created = await api.post<IcebreakerQuestionResponse>('/api/admin/icebreakers', {
          content: icebreakerQuestion.trim(),
        })
        setIcebreakers((prev) => [...prev, created])
      }
      setIcebreakerModalOpen(false)
    } catch (err) {
      setIcebreakerError(err instanceof ApiError ? err.message : 'Lỗi khi lưu câu hỏi')
    } finally {
      setIcebreakerSubmitting(false)
    }
  }

  async function handleDeleteIcebreaker(qId: number) {
    if (!window.confirm('Bạn có chắc muốn xoá câu hỏi phá băng này?')) return
    try {
      await api.delete(`/api/admin/icebreakers/${qId}`)
      setIcebreakers((prev) => prev.filter((q) => q.id !== qId))
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Không xoá được câu hỏi')
    }
  }

  const filteredUsers = users.filter((u) => u.studentCode.toLowerCase().includes(userQuery.toLowerCase().trim()))

  const filteredTags = tags.filter((t) => t.name.toLowerCase().includes(tagQuery.toLowerCase().trim()))

  if (userLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-ink">Đang tải...</div>
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[1080px] mx-auto px-6 sm:px-12 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Eyebrow color="magenta">Cổng Quản Trị Hệ Thống</Eyebrow>
              <span className="bg-neon text-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-ink">
                ADMIN ONLY
              </span>
            </div>
            <h1 className="font-display font-bold text-[28px] text-ink">Bảng Điều Khiển Quản Trị Viên</h1>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white"
            onClick={() => navigate('/events/manage')}
          >
            <CalendarDays className="w-4 h-4 text-magenta" />
            Quản lý sự kiện trường
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b-2 border-ink pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-display font-bold text-[14px] transition-colors whitespace-nowrap ${
              activeTab === 'users' ? 'bg-ink text-neon border-2 border-ink' : 'bg-white text-ink border-2 border-ink/20 hover:border-ink'
            }`}
          >
            <Users className="w-4 h-4" />
            Người dùng & Phân quyền ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-display font-bold text-[14px] transition-colors whitespace-nowrap ${
              activeTab === 'tags' ? 'bg-ink text-neon border-2 border-ink' : 'bg-white text-ink border-2 border-ink/20 hover:border-ink'
            }`}
          >
            <Tag className="w-4 h-4" />
            Danh mục Sở thích ({tags.length})
          </button>
          <button
            onClick={() => setActiveTab('icebreakers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-display font-bold text-[14px] transition-colors whitespace-nowrap ${
              activeTab === 'icebreakers' ? 'bg-ink text-neon border-2 border-ink' : 'bg-white text-ink border-2 border-ink/20 hover:border-ink'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Câu hỏi Phá băng ({icebreakers.length})
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' ? (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-[360px] px-3.5 py-2.5 rounded-md border-2 border-ink bg-white">
                <Search className="w-4 h-4 text-ink/50" />
                <input
                  type="text"
                  placeholder="Tìm theo mã học sinh (VD: VS000000)..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1 text-[14px] text-ink outline-none placeholder:text-ink/40"
                />
              </div>
              <p className="text-[13px] text-ink/60">
                Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
              </p>
            </div>

            {userError ? <p className="text-magenta font-semibold text-[14px] mb-4">{userError}</p> : null}
            {loadingUsers ? <p className="text-ink/50 text-[14px]">Đang tải dữ liệu người dùng...</p> : null}

            <div className="bg-white border-2 border-ink rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-cream border-b-2 border-ink text-ink font-display font-bold text-[13px]">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Mã học sinh</th>
                      <th className="py-3 px-4">Vai trò (Role)</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {filteredUsers.map((u) => {
                      const isMe = u.id === me?.id
                      return (
                        <tr key={u.id} className="hover:bg-cream/40">
                          <td className="py-3.5 px-4 font-mono text-[13px] text-ink/60">#{u.id}</td>
                          <td className="py-3.5 px-4 font-display font-bold text-ink">
                            {u.studentCode} {isMe ? <span className="text-[11px] text-magenta font-normal">(Bạn)</span> : null}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                u.role === 'ADMIN'
                                  ? 'bg-neon text-ink border-ink'
                                  : u.role === 'STAFF'
                                  ? 'bg-cyan-100 text-ink border-ink/40'
                                  : 'bg-cream text-ink/70 border-ink/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[12px] font-semibold text-emerald-700">● {u.status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isMe ? (
                                <button
                                  onClick={() => navigate(`/messages/${u.id}`)}
                                  className="px-2.5 py-1 text-[12px] font-bold rounded border border-ink/40 hover:border-ink hover:bg-cream flex items-center gap-1 text-ink"
                                  title="Nhắn tin với người dùng này"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-ink/70" />
                                  Nhắn tin
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  setSelectedUserForRole(u)
                                  setNewRole(u.role)
                                }}
                                className="px-2.5 py-1 text-[12px] font-bold rounded border border-ink hover:bg-cream flex items-center gap-1 text-ink"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Đổi quyền
                              </button>
                              <button
                                onClick={() => handleResetPassword(u)}
                                className="px-2.5 py-1 text-[12px] font-bold rounded border border-ink hover:bg-neon flex items-center gap-1 text-ink"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                Đặt lại MK
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* TAB 2: TAGS */}
        {activeTab === 'tags' ? (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-[360px] px-3.5 py-2.5 rounded-md border-2 border-ink bg-white">
                <Search className="w-4 h-4 text-ink/50" />
                <input
                  type="text"
                  placeholder="Tìm sở thích, môn học..."
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  className="flex-1 text-[14px] text-ink outline-none placeholder:text-ink/40"
                />
              </div>
              <Button
                className="flex items-center gap-1.5"
                onClick={() => {
                  setEditingTag(null)
                  setTagName('')
                  setTagType('SUBJECT')
                  setTagError('')
                  setTagModalOpen(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm thẻ mới
              </Button>
            </div>

            {loadingTags ? <p className="text-ink/50 text-[14px]">Đang tải danh mục sở thích...</p> : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 bg-white border-2 border-ink rounded-lg"
                >
                  <div>
                    <p className="font-display font-bold text-[16px] text-ink">{tag.name}</p>
                    <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider">
                      {tag.type === 'SUBJECT' ? 'Môn học' : tag.type === 'HOBBY' ? 'Sở thích' : 'Câu lạc bộ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTag(tag)
                        setTagName(tag.name)
                        setTagType(tag.type)
                        setTagError('')
                        setTagModalOpen(true)
                      }}
                      className="w-8 h-8 rounded border border-ink/40 hover:border-ink flex items-center justify-center text-ink"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="w-8 h-8 rounded border border-magenta/40 hover:border-magenta flex items-center justify-center text-magenta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* TAB 3: ICEBREAKERS */}
        {activeTab === 'icebreakers' ? (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <p className="text-[14px] text-ink/70">
                Danh sách câu hỏi hiển thị ngẫu nhiên trên trang chủ để giúp học sinh mở đầu cuộc trò chuyện.
              </p>
              <Button
                className="flex items-center gap-1.5"
                onClick={() => {
                  setEditingIcebreaker(null)
                  setIcebreakerQuestion('')
                  setIcebreakerError('')
                  setIcebreakerModalOpen(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm câu hỏi mới
              </Button>
            </div>

            {loadingIcebreakers ? <p className="text-ink/50 text-[14px]">Đang tải câu hỏi...</p> : null}

            <div className="flex flex-col gap-3">
              {icebreakers.map((ib, index) => (
                <div
                  key={ib.id}
                  className="flex items-center justify-between gap-4 p-4 bg-white border-2 border-ink rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-cream border border-ink font-bold text-[12px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <p className="font-display font-semibold text-[15px] text-ink leading-snug">"{ib.content}"</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingIcebreaker(ib)
                        setIcebreakerQuestion(ib.content)
                        setIcebreakerError('')
                        setIcebreakerModalOpen(true)
                      }}
                      className="w-8 h-8 rounded border border-ink/40 hover:border-ink flex items-center justify-center text-ink"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteIcebreaker(ib.id)}
                      className="w-8 h-8 rounded border border-magenta/40 hover:border-magenta flex items-center justify-center text-magenta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* MODAL: ĐỔI ROLE */}
      {selectedUserForRole ? (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-ink rounded-lg max-w-[420px] w-full p-6 shadow-xl">
            <h3 className="font-display font-bold text-[20px] text-ink mb-1">Đổi vai trò người dùng</h3>
            <p className="text-[14px] text-ink/60 mb-5">
              Tài khoản: <strong className="text-ink">{selectedUserForRole.studentCode}</strong>
            </p>

            <label className="block text-[13px] font-semibold text-ink mb-2">Chọn vai trò mới:</label>
            <div className="flex flex-col gap-2 mb-6">
              {(['STUDENT', 'STAFF', 'ADMIN'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer ${
                    newRole === r ? 'border-magenta bg-magenta/5' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={newRole === r}
                    onChange={() => setNewRole(r)}
                    className="accent-magenta"
                  />
                  <div>
                    <p className="font-bold text-[14px] text-ink">
                      {r === 'STUDENT' ? 'Học sinh (STUDENT)' : r === 'STAFF' ? 'Cán bộ / Giáo viên (STAFF)' : 'Quản trị viên (ADMIN)'}
                    </p>
                    <p className="text-[12px] text-ink/50">
                      {r === 'STUDENT'
                        ? 'Dùng tính năng ghép đôi, trò chuyện, tham gia nhóm và sự kiện.'
                        : r === 'STAFF'
                        ? 'Có quyền tạo/sửa sự kiện trường và cấp lại mật khẩu cho học sinh.'
                        : 'Toàn quyền quản trị hệ thống, đổi role và cấu hình danh mục.'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedUserForRole(null)} disabled={roleUpdating}>
                Huỷ
              </Button>
              <Button onClick={handleSaveRole} disabled={roleUpdating}>
                {roleUpdating ? 'Đang lưu...' : 'Lưu vai trò'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL: RESET PASSWORD RESULT */}
      {resettingUser ? (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-ink rounded-lg max-w-[460px] w-full p-6 shadow-xl">
            <h3 className="font-display font-bold text-[20px] text-ink mb-2">
              {resetResult ? 'Đặt lại mật khẩu thành công' : 'Đang xử lý đặt lại mật khẩu...'}
            </h3>
            <p className="text-[14px] text-ink/65 mb-4">
              Mã học sinh: <strong className="text-ink">{resettingUser.studentCode}</strong>
            </p>

            {resetSubmitting ? (
              <p className="text-ink/60 text-[14px] py-6 text-center">Hệ thống đang sinh mật khẩu tạm...</p>
            ) : null}

            {resetResult ? (
              <div>
                <div className="p-4 bg-cream border-2 border-dashed border-ink rounded-md mb-4 text-center">
                  <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wider mb-1">
                    Mật khẩu tạm thời (Chỉ hiển thị 1 lần):
                  </p>
                  <p className="font-mono font-bold text-[24px] text-magenta tracking-widest select-all">
                    {resetResult.temporaryPassword}
                  </p>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.temporaryPassword)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border-2 border-ink bg-neon font-bold text-[13px] text-ink"
                  >
                    {copied ? <Check className="w-4 h-4 text-ink" /> : <Copy className="w-4 h-4 text-ink" />}
                    {copied ? 'Đã sao chép vào bộ nhớ tạm' : 'Sao chép mật khẩu'}
                  </button>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[13px] text-amber-900 mb-6 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Hãy gửi mật khẩu này cho học sinh qua kênh liên lạc an toàn. Học sinh có thể đăng nhập và đổi lại mật khẩu mới tại Cài đặt bảo mật.
                  </span>
                </div>
                <Button className="w-full" onClick={() => setResettingUser(null)}>
                  Đóng
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* MODAL: THÊM / SỬA TAG */}
      {tagModalOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-ink rounded-lg max-w-[420px] w-full p-6 shadow-xl">
            <h3 className="font-display font-bold text-[20px] text-ink mb-4">
              {editingTag ? 'Chỉnh sửa sở thích / môn học' : 'Thêm sở thích / môn học mới'}
            </h3>

            <label className="block text-[13px] font-semibold text-ink mb-1.5">Tên hiển thị:</label>
            <input
              type="text"
              placeholder="VD: Cầu lông, Lập trình Robotics..."
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none focus:border-magenta mb-4"
            />

            <label className="block text-[13px] font-semibold text-ink mb-1.5">Loại danh mục:</label>
            <select
              value={tagType}
              onChange={(e) => setTagType(e.target.value as TagType)}
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none focus:border-magenta mb-6"
            >
              <option value="SUBJECT">Môn học (SUBJECT)</option>
              <option value="HOBBY">Sở thích (HOBBY)</option>
              <option value="CLUB">Câu lạc bộ (CLUB)</option>
            </select>

            {tagError ? <p className="text-[13px] font-semibold text-magenta mb-4">{tagError}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setTagModalOpen(false)} disabled={tagSubmitting}>
                Huỷ
              </Button>
              <Button onClick={handleSaveTag} disabled={tagSubmitting}>
                {tagSubmitting ? 'Đang lưu...' : 'Lưu thẻ'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL: THÊM / SỬA ICEBREAKER */}
      {icebreakerModalOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-ink rounded-lg max-w-[500px] w-full p-6 shadow-xl">
            <h3 className="font-display font-bold text-[20px] text-ink mb-4">
              {editingIcebreaker ? 'Sửa câu hỏi phá băng' : 'Thêm câu hỏi phá băng mới'}
            </h3>

            <label className="block text-[13px] font-semibold text-ink mb-1.5">Nội dung câu hỏi:</label>
            <textarea
              rows={3}
              placeholder="VD: Nếu được chọn 1 siêu năng lực để học bài nhanh hơn, bạn sẽ chọn gì?..."
              value={icebreakerQuestion}
              onChange={(e) => setIcebreakerQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none focus:border-magenta mb-4 resize-none"
            />

            {icebreakerError ? <p className="text-[13px] font-semibold text-magenta mb-4">{icebreakerError}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIcebreakerModalOpen(false)} disabled={icebreakerSubmitting}>
                Huỷ
              </Button>
              <Button onClick={handleSaveIcebreaker} disabled={icebreakerSubmitting}>
                {icebreakerSubmitting ? 'Đang lưu...' : 'Lưu câu hỏi'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
