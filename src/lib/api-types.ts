// Các kiểu dữ liệu khớp đúng response thật của backend (docs/API_SPEC.md), không thêm field giả.

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export type TagType = 'SUBJECT' | 'HOBBY' | 'CLUB'

export interface TagResponse {
  id: number
  name: string
  type: TagType
}

export interface UserMeResponse {
  id: number
  studentCode: string
  role: 'STUDENT' | 'STAFF' | 'ADMIN'
  hasProfile: boolean
  fullName: string | null
  className: string | null
  gradeLevel: string | null
  bio: string | null
  avatarUrl: string | null
  profilePublic: boolean
  tags: TagResponse[]
}

export interface PublicProfileResponse {
  id: number
  fullName: string
  className: string | null
  gradeLevel: string | null
  bio: string | null
  avatarUrl: string | null
  tags: TagResponse[]
}

export interface UserSearchResponse {
  userId: number
  fullName: string
  className: string | null
  gradeLevel: string | null
  avatarUrl: string | null
}

export interface MatchSuggestionResponse {
  userId: number
  fullName: string
  className: string | null
  gradeLevel: string | null
  avatarUrl: string | null
  matchedTagCount: number
  matchedTags: TagResponse[]
}

export type EventScope = 'SCHOOL' | 'CLASS' | 'CLUB'
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
export type EventIconKey = 'PARTY' | 'TROPHY' | 'MUSIC' | 'CODE'

export interface EventResponse {
  id: number
  title: string
  description: string | null
  scope: EventScope
  startTime: string
  endTime: string | null
  status: EventStatus
  createdByUserId: number
  createdByName: string | null
  registrationCount: number
  registered: boolean
  location: string | null
  iconKey: EventIconKey
}

export interface EventRegistrationResponse {
  userId: number
  studentCode: string | null
  fullName: string | null
  registeredAt: string
}

export interface StudyGroupResponse {
  id: number
  name: string
  subject: string
  description: string | null
  createdByUserId: number
  createdByName: string | null
  memberCount: number
  joined: boolean
  createdAt: string
}

export interface StudyGroupQuestionResponse {
  id: number
  groupId: number
  authorId: number
  authorName: string | null
  content: string
  createdAt: string
  answerCount: number
}

export interface StudyGroupAnswerResponse {
  id: number
  questionId: number
  authorId: number
  authorName: string | null
  content: string
  createdAt: string
}

export interface StudyGroupMessageResponse {
  id: number
  groupId: number
  senderId: number
  senderName: string | null
  content: string
  sentAt: string
}

export type MessageType = 'TEXT' | 'EVENT_INVITE' | 'GROUP_INVITE'

export interface ThreadResponse {
  threadId: number
  otherUserId: number
  otherUserFullName: string | null
  otherUserAvatarUrl: string | null
  lastMessageContent: string | null
  lastMessageAt: string | null
  lastMessageFromMe: boolean
  unreadCount: number
}

export type NotificationType = 'NEW_MESSAGE' | 'EVENT_REMINDER' | 'GROUP_ACTIVITY'

export interface NotificationResponse {
  id: number
  type: NotificationType
  content: string
  relatedId: number | null
  read: boolean
  createdAt: string
}

export interface NotificationPreferenceResponse {
  messagesEnabled: boolean
  eventsEnabled: boolean
  groupsEnabled: boolean
}

export interface MessageResponse {
  id: number
  threadId: number
  senderId: number
  content: string
  sentAt: string
  read: boolean
  type: MessageType
  eventId: number | null
  eventTitle: string | null
  groupId: number | null
  groupName: string | null
}

export interface AdminUserResponse {
  id: number
  studentCode: string
  role: 'STUDENT' | 'STAFF' | 'ADMIN'
  status: 'ACTIVE' | 'DISABLED'
}

export interface ResetPasswordResponse {
  userId: number
  studentCode: string
  temporaryPassword: string
}

export interface IcebreakerQuestionResponse {
  id: number
  content: string
}

export type FriendshipStatusType = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS'

export interface FriendshipStatusResponse {
  userId: number
  status: FriendshipStatusType
}

export interface FriendResponse {
  userId: number
  studentCode: string
  fullName: string
  className: string | null
  gradeLevel: string | null
  avatarUrl: string | null
  bio: string | null
  since: string
}

export interface FriendRequestResponse {
  requestId: number
  userId: number
  studentCode: string | null
  fullName: string
  className: string | null
  avatarUrl: string | null
  createdAt: string
}

