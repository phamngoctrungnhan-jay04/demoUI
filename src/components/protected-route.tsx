import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUserRole, getRoleHomeUrl, isLoggedIn } from '@/lib/api'

export interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('STUDENT' | 'STAFF' | 'ADMIN')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = getCurrentUserRole()
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHomeUrl(role)} replace />
  }

  return <>{children}</>
}
