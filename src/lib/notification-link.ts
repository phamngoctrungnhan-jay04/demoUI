import { api } from './api'
import type { NotificationResponse, ThreadResponse } from './api-types'

/** Backend không trả sẵn "link" — relatedId có ý nghĩa khác nhau tuỳ loại thông báo:
 * NEW_MESSAGE → threadId (cần tra ngược ra otherUserId để khớp route /messages/:userId),
 * EVENT_REMINDER → eventId, GROUP_ACTIVITY → groupId. */
export async function resolveNotificationLink(notification: NotificationResponse): Promise<string> {
  if (notification.relatedId == null) return '/notifications'

  switch (notification.type) {
    case 'EVENT_REMINDER':
      return `/events/${notification.relatedId}`
    case 'GROUP_ACTIVITY':
      return `/groups/${notification.relatedId}`
    case 'NEW_MESSAGE': {
      try {
        const threads = await api.get<ThreadResponse[]>('/api/threads')
        const thread = threads.find((t) => t.threadId === notification.relatedId)
        return thread ? `/messages/${thread.otherUserId}` : '/messages'
      } catch {
        return '/messages'
      }
    }
    default:
      return '/notifications'
  }
}
