import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError, api, setTokens, toFullStudentCode } from '@/lib/api'
import type { AuthResponse } from '@/lib/api-types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit =
    fullName.trim().length > 0 &&
    studentCode.length === 6 &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    agreed

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!fullName.trim() || studentCode.length !== 6) {
      setError('Nhập đầy đủ họ tên và mã học sinh (6 số) nhé.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }
    if (!agreed) {
      setError('Cần đồng ý điều khoản sử dụng để tiếp tục.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const fullStudentCode = toFullStudentCode(studentCode)
      await api.post('/api/auth/register', { studentCode: fullStudentCode, password }, { auth: false })
      // Đăng ký xong chưa có token — đăng nhập luôn để lấy accessToken cho bước tạo hồ sơ.
      const auth = await api.post<AuthResponse>(
        '/api/auth/login',
        { studentCode: fullStudentCode, password },
        { auth: false },
      )
      setTokens(auth.accessToken, auth.refreshToken)
      // Họ tên nhập ở đây sẽ được dùng làm giá trị mặc định khi tạo hồ sơ ở bước onboarding.
      sessionStorage.setItem('khd_pending_full_name', fullName.trim())
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo tài khoản, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      badge="Thành viên mới"
      headline={
        <>
          Tạo thẻ học sinh số{' '}
          <span className="underline decoration-neon decoration-[8px] underline-offset-[3px]">
            của riêng bạn
          </span>
          .
        </>
      }
      subtext="Tạo tài khoản để kết nối bạn bè cùng sở thích, tham gia nhóm học và theo dõi sự kiện trường."
    >
      <form onSubmit={handleSubmit}>
        <h2 className="font-display font-bold text-[28px] text-ink mb-2">Đăng ký</h2>
        <p className="text-ink/60 text-[15px] mb-7">Chỉ mất 1 phút để tạo tài khoản.</p>

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="full-name">
          Họ và tên
        </label>
        <Input
          id="full-name"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="reg-student-code">
          Mã học sinh
        </label>
        <div className="flex items-stretch mb-4 rounded-md overflow-hidden border-2 border-ink bg-white focus-within:border-magenta">
          <span className="flex items-center px-3 bg-cream text-ink font-display font-semibold text-[15px]">
            VS
          </span>
          <input
            id="reg-student-code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={studentCode}
            onChange={(event) => setStudentCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="flex-1 px-3 py-3 text-[15px] text-ink outline-none tabular-nums tracking-wider placeholder:text-ink/25"
          />
        </div>

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="reg-password">
          Mật khẩu
        </label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Tạo mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="confirm-password">
          Xác nhận mật khẩu
        </label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mb-5"
        />

        <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 w-4 h-4 accent-magenta"
          />
          <span className="text-[13px] text-ink/70">
            Tôi đồng ý với <a href="#" className="font-semibold text-ink">điều khoản sử dụng</a> của Kết
            Nối Học Đường.
          </span>
        </label>

        {error ? <p className="text-[13px] font-semibold text-magenta mb-4">{error}</p> : null}

        <Button type="submit" size="lg" disabled={!canSubmit || submitting} className="w-full mb-6">
          {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
        <p className="text-center text-[14px] text-ink/60">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-magenta">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
