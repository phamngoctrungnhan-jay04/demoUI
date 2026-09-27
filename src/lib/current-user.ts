import { useEffect, useState } from 'react'
import { api, getAccessToken } from './api'
import type { UserMeResponse } from './api-types'

let cachedToken: string | null = null
let cache: Promise<UserMeResponse> | null = null

export function fetchCurrentUser(forceRefresh = false): Promise<UserMeResponse> {
  const currentToken = getAccessToken()
  if (!currentToken) {
    cache = null
    cachedToken = null
    return Promise.reject(new Error('Chưa đăng nhập'))
  }

  if (!cache || cachedToken !== currentToken || forceRefresh) {
    cachedToken = currentToken
    cache = api.get<UserMeResponse>('/api/users/me').catch((err) => {
      // Don't retain failed promises in cache
      cache = null
      cachedToken = null
      throw err
    })
  }
  return cache
}

/** Gọi sau khi sửa hồ sơ hoặc đăng xuất để lần đọc kế tiếp lấy dữ liệu mới thay vì bản cache cũ. */
export function invalidateCurrentUser() {
  cache = null
  cachedToken = null
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserMeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenVersion, setTokenVersion] = useState(0)

  useEffect(() => {
    const handleAuthChange = () => {
      invalidateCurrentUser()
      setTokenVersion((v) => v + 1)
    }
    window.addEventListener('auth-token-changed', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    return () => {
      window.removeEventListener('auth-token-changed', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  const currentToken = getAccessToken()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    if (!currentToken) {
      setUser(null)
      setLoading(false)
      return
    }

    fetchCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setUser(null)
          setError(err instanceof Error ? err.message : 'Không tải được hồ sơ')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentToken, tokenVersion])

  return { user, loading, error }
}
