export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** Dự án này chưa có backend thật đi kèm — mặc định chạy với dữ liệu mock trong trình
 * duyệt (xem src/lib/mock-api.ts) để mọi trang, mọi role đều dùng được ngay. Đặt biến môi
 * trường VITE_USE_MOCK=false nếu sau này có backend thật để tắt chế độ mock. */
export const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

const ACCESS_TOKEN_KEY = 'khd_access_token'
const REFRESH_TOKEN_KEY = 'khd_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-token-changed'))
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-token-changed'))
  }
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

export interface TokenPayload {
  sub?: string
  userId?: number
  role?: 'STUDENT' | 'STAFF' | 'ADMIN'
  tokenType?: string
  exp?: number
}

export function getCurrentUserTokenInfo(): TokenPayload | null {
  const token = getAccessToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as TokenPayload
  } catch {
    return null
  }
}

export function getCurrentUserRole(): 'STUDENT' | 'STAFF' | 'ADMIN' | null {
  const info = getCurrentUserTokenInfo()
  return info?.role ?? null
}

export function getRoleHomeUrl(role: 'STUDENT' | 'STAFF' | 'ADMIN' | null | undefined): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'STAFF') return '/events/manage'
  return '/home'
}

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  if (USE_MOCK_API) {
    const { mockRequest } = await import('./mock-api')
    const token = auth ? getAccessToken() : null
    return mockRequest<T>(path, method, body, token)
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message ?? `Yêu cầu thất bại (${response.status})`
    throw new ApiError(message, response.status, payload?.fieldErrors)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

/** Backend chỉ nhận studentCode đầy đủ dạng "VS######"; UI chỉ cho nhập 6 số. */
export function toFullStudentCode(sixDigits: string): string {
  return `VS${sixDigits}`
}
