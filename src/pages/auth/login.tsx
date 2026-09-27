import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, KeyRound, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { QUICK_LOGIN_ACCOUNTS } from '@/data/mock-seed'
import { ApiError, api, getCurrentUserRole, getRoleHomeUrl, isLoggedIn, setTokens, toFullStudentCode } from '@/lib/api'
import type { AuthResponse, UserMeResponse } from '@/lib/api-types'

const quickLoginIcon = { STUDENT: GraduationCap, STAFF: KeyRound, ADMIN: ShieldCheck } as const

export default function LoginPage() {
  const navigate = useNavigate()
  const [studentCode, setStudentCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [quickLoggingIn, setQuickLoggingIn] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn()) {
      const role = getCurrentUserRole()
      navigate(getRoleHomeUrl(role), { replace: true })
    }
  }, [navigate])

  const canSubmit = studentCode.length === 6 && password.length > 0

  async function loginWithCredentials(fullStudentCode: string, plainPassword: string) {
    const auth = await api.post<AuthResponse>(
      '/api/auth/login',
      { studentCode: fullStudentCode, password: plainPassword },
      { auth: false },
    )
    setTokens(auth.accessToken, auth.refreshToken)
    const me = await api.get<UserMeResponse>('/api/users/me')
    if (me.role === 'ADMIN') {
      navigate('/admin')
    } else if (me.role === 'STAFF') {
      navigate('/events/manage')
    } else {
      navigate(me.hasProfile ? '/home' : '/onboarding')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) {
      setError('Nhập đủ 6 số mã học sinh và mật khẩu nhé.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await loginWithCredentials(toFullStudentCode(studentCode), password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đăng nhập, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuickLogin(account: (typeof QUICK_LOGIN_ACCOUNTS)[number]) {
    setError('')
    setQuickLoggingIn(account.role)
    try {
      await loginWithCredentials(account.studentCode, account.password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đăng nhập nhanh, thử lại sau.')
    } finally {
      setQuickLoggingIn(null)
    }
  }

  return (
    <AuthLayout
      badge="Thẻ học sinh số"
      headline={
        <>
          Sân trường có{' '}
          <span className="underline decoration-magenta decoration-[8px] underline-offset-[3px]">
            gu riêng
          </span>{' '}
          của bạn.
        </>
      }
      subtext="Không rập khuôn, không sến — chỉ là nơi tìm đúng hội, đúng gu, đúng bạn."
    >
      <form onSubmit={handleSubmit}>
        <h2 className="font-display font-bold text-[28px] text-ink mb-2">Đăng nhập</h2>
        <p className="text-ink/60 text-[15px] mb-8">Nhập mã học sinh và mật khẩu để tiếp tục.</p>

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="student-code">
          Mã học sinh
        </label>
        <div className="flex items-stretch mb-5 rounded-md overflow-hidden border-2 border-ink bg-white focus-within:border-magenta">
          <span className="flex items-center px-3 bg-cream text-ink font-display font-semibold text-[15px]">
            VS
          </span>
          <input
            id="student-code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={studentCode}
            onChange={(event) => setStudentCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="flex-1 px-3 py-3 text-[15px] text-ink outline-none tabular-nums tracking-wider placeholder:text-ink/25"
          />
        </div>

        <label className="block text-[13px] font-semibold text-ink mb-1.5" htmlFor="password">
          Mật khẩu
        </label>
        <div className="relative mb-2">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-3 py-3 pr-11 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none focus:border-magenta placeholder:text-ink/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        <div className="flex justify-end mb-6">
          <a href="#" className="text-[13px] font-semibold text-magenta">
            Quên mật khẩu?
          </a>
        </div>

        {error ? <p className="text-[13px] font-semibold text-magenta mb-4">{error}</p> : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full mb-6">
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
        <div className="flex items-center gap-2 mb-6">
          <span className="flex-1 border-t border-dashed border-ink/20" />
        </div>
        <p className="text-center text-[14px] text-ink/60">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-magenta">
            Đăng ký ngay
          </Link>
        </p>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/15">
        <p className="text-center text-[12px] font-semibold text-ink/50 uppercase tracking-wider mb-3">
          Bản demo · Đăng nhập nhanh theo vai trò
        </p>
        <div className="flex flex-col gap-2.5">
          {QUICK_LOGIN_ACCOUNTS.map((account) => {
            const Icon = quickLoginIcon[account.role]
            const busy = quickLoggingIn === account.role
            return (
              <button
                key={account.role}
                type="button"
                disabled={submitting || quickLoggingIn !== null}
                onClick={() => handleQuickLogin(account)}
                className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-ink bg-white hover:bg-cream disabled:opacity-50 transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-full border-2 border-ink bg-neon flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-ink" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[14px] text-ink">
                    {busy ? 'Đang đăng nhập...' : account.label}
                  </span>
                  <span className="block text-[12px] text-ink/50 truncate">
                    {account.name} · {account.studentCode}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </AuthLayout>
  )
}
