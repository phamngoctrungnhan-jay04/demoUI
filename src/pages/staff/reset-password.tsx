import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Copy, KeyRound, Search, ShieldAlert, UserCheck } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { ApiError, api, toFullStudentCode } from '@/lib/api'
import { useCurrentUser } from '@/lib/current-user'
import type { ResetPasswordResponse, UserSearchResponse } from '@/lib/api-types'

export default function StaffResetPasswordPage() {
  const navigate = useNavigate()
  const { user: me, loading: userLoading } = useCurrentUser()

  const [studentCodeInput, setStudentCodeInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundStudent, setFoundStudent] = useState<UserSearchResponse | null>(null)
  const [searchError, setSearchError] = useState('')

  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null)
  const [copied, setCopied] = useState(false)

  // Only STAFF or ADMIN can use this
  if (!userLoading && me && me.role === 'STUDENT') {
    return (
      <div className="w-full min-h-screen bg-cream">
        <AppHeader />
        <main className="max-w-[600px] mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-magenta/10 border-2 border-magenta flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-magenta" />
          </div>
          <h1 className="font-display font-bold text-[22px] text-ink mb-2">Quyền truy cập bị hạn chế</h1>
          <p className="text-[14px] text-ink/60 mb-6">
            Tính năng cấp lại mật khẩu tạm chỉ dành cho Giáo viên / Cán bộ nhà trường (STAFF) hoặc Quản trị viên (ADMIN).
          </p>
          <Button onClick={() => navigate('/home')}>Về trang chủ</Button>
        </main>
      </div>
    )
  }

  async function handleSearchStudent(e: React.FormEvent) {
    e.preventDefault()
    const cleanCode = studentCodeInput.replace(/\D/g, '').slice(0, 6)
    if (cleanCode.length !== 6) {
      setSearchError('Vui lòng nhập đúng 6 chữ số mã học sinh.')
      return
    }
    setSearchError('')
    setSearching(true)
    setFoundStudent(null)
    setResetResult(null)

    try {
      // Find student directly by student code using dedicated lookup endpoint
      const student = await api.get<UserSearchResponse>(`/api/admin/users/by-code/${cleanCode}`)
      setFoundStudent(student)
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : `Không tìm thấy hồ sơ học sinh nào với mã VS${cleanCode}.`)
    } finally {
      setSearching(false)
    }
  }

  async function handleResetPassword() {
    if (!foundStudent) return
    setResetSubmitting(true)
    setCopied(false)
    try {
      const res = await api.post<ResetPasswordResponse>(`/api/admin/users/${foundStudent.userId}/reset-password`)
      setResetResult(res)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Không cấp lại được mật khẩu.')
    } finally {
      setResetSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[680px] mx-auto px-6 sm:px-12 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Eyebrow color="cyan">Hỗ Trợ Nhà Trường</Eyebrow>
            <span className="bg-cyan-200 text-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-ink">
              STAFF & ADMIN
            </span>
          </div>
          <h1 className="font-display font-bold text-[26px] text-ink mb-2">Cấp Lại Mật Khẩu Cho Học Sinh</h1>
          <p className="text-[14px] text-ink/65 leading-relaxed">
            Dành cho thầy cô hoặc cán bộ nhà trường hỗ trợ học sinh quên mật khẩu đăng nhập. Mật khẩu tạm thời sẽ được tạo ngẫu nhiên để gửi lại cho học sinh.
          </p>
        </div>

        {/* Form tìm kiếm */}
        <div className="bg-white border-2 border-ink rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-display font-bold text-[17px] text-ink mb-4 flex items-center gap-2">
            <Search className="w-4.5 h-4.5 text-magenta" />
            Tra cứu thông tin học sinh
          </h2>

          <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex items-stretch flex-1 rounded-md overflow-hidden border-2 border-ink bg-white focus-within:border-magenta">
              <span className="flex items-center px-3 bg-cream text-ink font-display font-semibold text-[15px]">
                VS
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Nhập 6 số mã học sinh (VD: 888999)"
                maxLength={6}
                value={studentCodeInput}
                onChange={(e) => setStudentCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-3 py-2.5 text-[15px] text-ink outline-none tabular-nums"
              />
            </div>
            <Button type="submit" disabled={searching || studentCodeInput.length !== 6} className="shrink-0">
              {searching ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </form>

          {searchError ? <p className="text-[13px] font-semibold text-magenta mt-3">{searchError}</p> : null}
        </div>

        {/* Kết quả tìm kiếm học sinh */}
        {foundStudent ? (
          <div className="bg-white border-2 border-ink rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full border-2 border-ink bg-neon flex items-center justify-center font-bold text-ink">
                  <UserCheck className="w-6 h-6 text-ink" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[18px] text-ink">{foundStudent.fullName}</h3>
                  <p className="text-[13px] text-ink/60">
                    Mã học sinh: <strong className="text-ink">{toFullStudentCode(studentCodeInput)}</strong> ·{' '}
                    {foundStudent.className ? `Lớp ${foundStudent.className}` : 'Chưa xếp lớp'}
                  </p>
                </div>
              </div>

              {!resetResult ? (
                <Button
                  onClick={handleResetPassword}
                  disabled={resetSubmitting}
                  className="flex items-center gap-2 bg-magenta text-white hover:bg-magenta/90"
                >
                  <KeyRound className="w-4 h-4" />
                  {resetSubmitting ? 'Đang cấp lại...' : 'Cấp mật khẩu tạm'}
                </Button>
              ) : null}
            </div>

            {/* Khi đã reset xong */}
            {resetResult ? (
              <div className="mt-4 pt-4 border-t-2 border-ink/15">
                <div className="p-4 bg-cream border-2 border-dashed border-ink rounded-md mb-4 text-center">
                  <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wider mb-1">
                    Mật khẩu tạm thời đã cấp:
                  </p>
                  <p className="font-mono font-bold text-[26px] text-magenta tracking-widest select-all">
                    {resetResult.temporaryPassword}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
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

                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[13px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Thầy cô vui lòng báo mật khẩu này cho học sinh. Học sinh đăng nhập và có thể đổi mật khẩu mới trong phần <strong>Cài đặt bảo mật</strong>.
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}
