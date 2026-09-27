import { Client, type IMessage } from '@stomp/stompjs'
import { API_BASE_URL, USE_MOCK_API, getAccessToken } from './api'
import type { MessageResponse, NotificationResponse, StudyGroupMessageResponse } from './api-types'

let client: Client | null = null
const messageListeners = new Set<(message: MessageResponse) => void>()
const groupMessageListeners = new Set<(message: StudyGroupMessageResponse) => void>()
const notificationListeners = new Set<(notification: NotificationResponse) => void>()

/** Chưa có backend WebSocket thật khi chạy ở chế độ mock — các trang vẫn tự làm mới dữ
 * liệu qua fetch (refetch on mount), nên chỉ cần không kết nối thật để tránh log lỗi
 * reconnect liên tục trong console. */
function ensureClient(): Client | null {
  if (USE_MOCK_API) return null
  if (client) return client

  const token = getAccessToken()
  const wsUrl = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/chat?token=${encodeURIComponent(token ?? '')}`

  client = new Client({
    brokerURL: wsUrl,
    reconnectDelay: 3000,
    onConnect: () => {
      client?.subscribe('/user/queue/messages', (frame: IMessage) => {
        const payload = JSON.parse(frame.body) as MessageResponse
        messageListeners.forEach((listener) => listener(payload))
      })
      client?.subscribe('/user/queue/group-messages', (frame: IMessage) => {
        const payload = JSON.parse(frame.body) as StudyGroupMessageResponse
        groupMessageListeners.forEach((listener) => listener(payload))
      })
      client?.subscribe('/user/queue/notifications', (frame: IMessage) => {
        const payload = JSON.parse(frame.body) as NotificationResponse
        notificationListeners.forEach((listener) => listener(payload))
      })
    },
  })
  client.activate()
  return client
}

/** Đăng ký nhận tin nhắn 1-1 realtime. Trả về hàm huỷ đăng ký. */
export function onIncomingMessage(listener: (message: MessageResponse) => void): () => void {
  ensureClient()
  messageListeners.add(listener)
  return () => messageListeners.delete(listener)
}

/** Đăng ký nhận tin nhắn nhóm học tập realtime. Trả về hàm huỷ đăng ký. */
export function onIncomingGroupMessage(listener: (message: StudyGroupMessageResponse) => void): () => void {
  ensureClient()
  groupMessageListeners.add(listener)
  return () => groupMessageListeners.delete(listener)
}

/** Đăng ký nhận thông báo realtime. Trả về hàm huỷ đăng ký. */
export function onIncomingNotification(listener: (notification: NotificationResponse) => void): () => void {
  ensureClient()
  notificationListeners.add(listener)
  return () => notificationListeners.delete(listener)
}

/** Gọi khi đăng xuất để đóng kết nối, tránh giữ socket của phiên cũ. */
export function disconnectChatSocket() {
  client?.deactivate()
  client = null
  messageListeners.clear()
  groupMessageListeners.clear()
  notificationListeners.clear()
}
