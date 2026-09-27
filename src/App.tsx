import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import LandingPage from '@/pages/landing'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import OnboardingPage from '@/pages/auth/onboarding'
import HomePage from '@/pages/home'
import ViewProfilePage from '@/pages/profile/view-profile'
import EditProfilePage from '@/pages/profile/edit-profile'
import BlockedUsersPage from '@/pages/settings/blocked-users'
import NotificationPreferencesPage from '@/pages/settings/notification-preferences'
import SecurityPage from '@/pages/settings/security'
import ConversationListPage from '@/pages/messages/conversation-list'
import ChatThreadPage from '@/pages/messages/chat-thread'
import EventFeedPage from '@/pages/events/event-feed'
import EventDetailPage from '@/pages/events/event-detail'
import ManageEventsPage from '@/pages/events/manage-events'
import GroupListPage from '@/pages/groups/group-list'
import CreateGroupPage from '@/pages/groups/create-group'
import GroupDetailPage from '@/pages/groups/group-detail'
import NotificationListPage from '@/pages/notifications/notification-list'
import SearchResultsPage from '@/pages/search/search-results'
import FriendsPage from '@/pages/friends/friends-page'
import AdminPortalPage from '@/pages/admin'
import StaffResetPasswordPage from '@/pages/staff/reset-password'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Màn hình dành riêng cho HỌC SINH (STUDENT) */}
      <Route path="/home" element={<ProtectedRoute allowedRoles={['STUDENT']}><HomePage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute allowedRoles={['STUDENT']}><OnboardingPage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['STUDENT']}><EditProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><ViewProfilePage /></ProtectedRoute>} />
      <Route path="/settings/blocked" element={<ProtectedRoute allowedRoles={['STUDENT']}><BlockedUsersPage /></ProtectedRoute>} />
      <Route path="/settings/notifications" element={<ProtectedRoute allowedRoles={['STUDENT']}><NotificationPreferencesPage /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute allowedRoles={['STUDENT']}><FriendsPage /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute allowedRoles={['STUDENT']}><GroupListPage /></ProtectedRoute>} />
      <Route path="/groups/new" element={<ProtectedRoute allowedRoles={['STUDENT']}><CreateGroupPage /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><GroupDetailPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchResultsPage /></ProtectedRoute>} />

      {/* Màn hình dành riêng cho GIÁO VIÊN / CÁN BỘ (STAFF) và QUẢN TRỊ VIÊN (ADMIN) */}
      <Route path="/events/manage" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><ManageEventsPage /></ProtectedRoute>} />
      <Route path="/staff/reset-password" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><StaffResetPasswordPage /></ProtectedRoute>} />

      {/* Màn hình dành riêng cho QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPortalPage /></ProtectedRoute>} />

      {/* Các màn hình chung cần thiết cho các role */}
      <Route path="/settings/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><ConversationListPage /></ProtectedRoute>} />
      <Route path="/messages/:id" element={<ProtectedRoute><ChatThreadPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventFeedPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationListPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
