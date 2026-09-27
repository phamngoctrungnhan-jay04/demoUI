import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { SettingsLayout } from '@/components/settings-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError, api, clearTokens } from '@/lib/api'
import { disconnectChatSocket } from '@/lib/chat-socket'

export default function SecurityPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault()
    if (!currentPassword || newPassword.length < 6) {
      setMessage('Mật khẩu mới cần ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận chưa khớp.')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword })
      setMessage('Đã đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể đổi mật khẩu, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    disconnectChatSocket()
    clearTokens()
    navigate('/login')
  }

  return (
    <SettingsLayout>
      <div className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-1">
        <span className="w-2 h-2 bg-magenta" />
        Bảo mật
      </div>
      <h1 className="font-display font-bold text-[24px] text-ink mb-6">Tài khoản & bảo mật</h1>

      <form onSubmit={handleChangePassword} className="bg-white border-2 border-ink rounded-lg p-6 mb-8">
        <h2 className="font-display font-bold text-[16px] text-ink mb-4">Đổi mật khẩu</h2>

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Mật khẩu hiện tại</label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Mật khẩu mới</label>
        <Input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Xác nhận mật khẩu mới</label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mb-4"
        />

        {message ? <p className="text-[13px] font-semibold text-magenta mb-4">{message}</p> : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </form>

      <div className="bg-white border-2 border-magenta rounded-lg p-6">
        <h2 className="font-display font-bold text-[16px] text-ink mb-1">Đăng xuất</h2>
        <p className="text-[13px] text-ink/55 mb-4">Bạn sẽ cần đăng nhập lại bằng mã học sinh và mật khẩu.</p>
        <Button variant="danger" className="flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Đăng xuất khỏi Kết Nối Học Đường
        </Button>
      </div>
    </SettingsLayout>
  )
}
