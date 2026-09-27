// "Backend giả lập" chạy hoàn toàn trong trình duyệt: nhận đúng path/method/body mà
// src/lib/api.ts gửi đi và trả lại dữ liệu có cấu trúc giống hệt AuthResponse thật, dựa
// trên bộ dữ liệu mock dùng chung (src/data/mock-seed.ts) và các event bus của mock
// study-group. Nhờ vậy mọi trang (mọi role) đều thao tác trên cùng một "cơ sở dữ liệu"
// nên liên kết được với nhau (bạn bè, tin nhắn, sự kiện, nhóm học...).
import { buildSeedDb, type MockDb, type MockRole, type MockUser } from '@/data/mock-seed'
import { ApiError } from '@/lib/api'
import type {
  AdminUserResponse,
  AuthResponse,
  EventRegistrationResponse,
  EventResponse,
  FriendRequestResponse,
  FriendResponse,
  FriendshipStatusResponse,
  FriendshipStatusType,
  IcebreakerQuestionResponse,
  MatchSuggestionResponse,
  MessageResponse,
  NotificationPreferenceResponse,
  NotificationResponse,
  PublicProfileResponse,
  ResetPasswordResponse,
  StudyGroupAnswerResponse,
  StudyGroupMessageResponse,
  StudyGroupQuestionResponse,
  StudyGroupResponse,
  TagResponse,
  ThreadResponse,
  UserMeResponse,
  UserSearchResponse,
} from '@/lib/api-types'

const STORAGE_KEY = 'khd_mock_db_v1'

function loadDb(): MockDb {
  if (typeof window === 'undefined') return buildSeedDb()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeedDb()
    return JSON.parse(raw) as MockDb
  } catch {
    return buildSeedDb()
  }
}

let db = loadDb()

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Bỏ qua nếu localStorage đầy / bị chặn (chế độ ẩn danh)
  }
}

export function resetMockDb() {
  db = buildSeedDb()
  persist()
}

function nextId(key: string): number {
  const value = db.nextIds[key] ?? 1
  db.nextIds[key] = value + 1
  return value
}

// ---------- JWT giả (không mã hoá thật, chỉ đủ để getCurrentUserTokenInfo() giải mã) ----------
function base64url(input: string): string {
  const base64 = window.btoa(unescape(encodeURIComponent(input)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createToken(user: MockUser, tokenType: 'access' | 'refresh'): string {
  const header = base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const exp = Math.floor(Date.now() / 1000) + (tokenType === 'access' ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 30)
  const payload = base64url(
    JSON.stringify({ sub: user.studentCode, userId: user.id, role: user.role, tokenType, exp }),
  )
  return `${header}.${payload}.mocksig`
}

function decodeToken(token: string): { userId: number; role: MockRole } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(window.atob(base64)))
    const payload = JSON.parse(json) as { userId?: number; role?: MockRole }
    if (!payload.userId || !payload.role) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

// ---------- Helpers dùng chung ----------
function findUser(id: number): MockUser | undefined {
  return db.users.find((u) => u.id === id)
}

function requireUser(id: number): MockUser {
  const user = findUser(id)
  if (!user) throw new ApiError('Không tìm thấy người dùng', 404)
  return user
}

function tagsFor(user: MockUser): TagResponse[] {
  return user.tagIds
    .map((id) => db.tags.find((t) => t.id === id))
    .filter((t): t is TagResponse => Boolean(t))
}

function toUserMe(user: MockUser): UserMeResponse {
  return {
    id: user.id,
    studentCode: user.studentCode,
    role: user.role,
    hasProfile: user.hasProfile,
    fullName: user.fullName,
    className: user.className,
    gradeLevel: user.gradeLevel,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    profilePublic: user.profilePublic,
    tags: tagsFor(user),
  }
}

function toPublicProfile(user: MockUser): PublicProfileResponse {
  return {
    id: user.id,
    fullName: user.fullName ?? user.studentCode,
    className: user.className,
    gradeLevel: user.gradeLevel,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    tags: tagsFor(user),
  }
}

function toUserSearch(user: MockUser): UserSearchResponse {
  return {
    userId: user.id,
    fullName: user.fullName ?? user.studentCode,
    className: user.className,
    gradeLevel: user.gradeLevel,
    avatarUrl: user.avatarUrl,
  }
}

function isBlockedEitherWay(a: number, b: number): boolean {
  return db.blocks.some((x) => (x.userId === a && x.blockedUserId === b) || (x.userId === b && x.blockedUserId === a))
}

function friendshipStatus(viewerId: number, otherId: number): FriendshipStatusType {
  if (db.friendships.some((f) => (f.userA === viewerId && f.userB === otherId) || (f.userA === otherId && f.userB === viewerId))) {
    return 'FRIENDS'
  }
  if (db.friendRequests.some((r) => r.fromUserId === viewerId && r.toUserId === otherId)) return 'PENDING_SENT'
  if (db.friendRequests.some((r) => r.fromUserId === otherId && r.toUserId === viewerId)) return 'PENDING_RECEIVED'
  return 'NONE'
}

function ensurePrefs(userId: number) {
  let prefs = db.notificationPreferences.find((p) => p.userId === userId)
  if (!prefs) {
    prefs = { userId, messagesEnabled: true, eventsEnabled: true, groupsEnabled: true }
    db.notificationPreferences.push(prefs)
  }
  return prefs
}

function findOrCreateThread(userAId: number, userBId: number) {
  let thread = db.threads.find(
    (t) => (t.userAId === userAId && t.userBId === userBId) || (t.userAId === userBId && t.userBId === userAId),
  )
  if (!thread) {
    thread = { id: nextId('thread'), userAId, userBId }
    db.threads.push(thread)
  }
  return thread
}

function otherUserOfThread(thread: { userAId: number; userBId: number }, viewerId: number): number {
  return thread.userAId === viewerId ? thread.userBId : thread.userAId
}

function toEventResponse(event: MockDb['events'][number], viewerId: number | null): EventResponse {
  const creator = findUser(event.createdByUserId)
  const registrationCount = db.eventRegistrations.filter((r) => r.eventId === event.id).length
  const registered = viewerId != null && db.eventRegistrations.some((r) => r.eventId === event.id && r.userId === viewerId)
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    scope: event.scope,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    createdByUserId: event.createdByUserId,
    createdByName: creator?.fullName ?? null,
    registrationCount,
    registered,
    location: event.location,
    iconKey: event.iconKey,
  }
}

function toStudyGroupResponse(group: MockDb['studyGroups'][number], viewerId: number | null): StudyGroupResponse {
  const creator = findUser(group.createdByUserId)
  const memberCount = db.groupMembers.filter((m) => m.groupId === group.id).length
  const joined = viewerId != null && db.groupMembers.some((m) => m.groupId === group.id && m.userId === viewerId)
  return {
    id: group.id,
    name: group.name,
    subject: group.subject,
    description: group.description,
    createdByUserId: group.createdByUserId,
    createdByName: creator?.fullName ?? null,
    memberCount,
    joined,
    createdAt: group.createdAt,
  }
}

function createNotification(
  userId: number,
  type: 'NEW_MESSAGE' | 'EVENT_REMINDER' | 'GROUP_ACTIVITY',
  content: string,
  relatedId: number | null,
) {
  db.notifications.unshift({
    id: nextId('notification'),
    userId,
    type,
    content,
    relatedId,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

function nowIso(): string {
  return new Date().toISOString()
}

// ---------- Router ----------
interface RouteContext {
  params: string[]
  query: URLSearchParams
  body: unknown
  viewer: MockUser | null
}

interface Route {
  method: string
  regex: RegExp
  handler: (ctx: RouteContext) => unknown
  requiresAuth: boolean
}

const routes: Route[] = []

function on(method: string, pattern: string, handler: (ctx: RouteContext) => unknown, requiresAuth = true) {
  const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$')
  routes.push({ method, regex, handler, requiresAuth })
}

// ----- Auth -----
on(
  'POST',
  '/api/auth/login',
  (ctx) => {
    const { studentCode, password } = ctx.body as { studentCode: string; password: string }
    const user = db.users.find((u) => u.studentCode === studentCode)
    if (!user || user.password !== password) {
      throw new ApiError('Mã học sinh hoặc mật khẩu không đúng.', 401)
    }
    const auth: AuthResponse = {
      accessToken: createToken(user, 'access'),
      refreshToken: createToken(user, 'refresh'),
      tokenType: 'Bearer',
    }
    return auth
  },
  false,
)

on(
  'POST',
  '/api/auth/register',
  (ctx) => {
    const { studentCode, password } = ctx.body as { studentCode: string; password: string }
    if (db.users.some((u) => u.studentCode === studentCode)) {
      throw new ApiError('Mã học sinh này đã được đăng ký.', 409, { studentCode: 'Đã tồn tại' })
    }
    const user: MockUser = {
      id: nextId('user'),
      studentCode,
      password,
      role: 'STUDENT',
      hasProfile: false,
      fullName: null,
      className: null,
      gradeLevel: null,
      bio: null,
      avatarUrl: null,
      profilePublic: true,
      tagIds: [],
    }
    db.users.push(user)
    ensurePrefs(user.id)
    return undefined
  },
  false,
)

on('POST', '/api/auth/change-password', (ctx) => {
  const viewer = ctx.viewer!
  const { currentPassword, newPassword } = ctx.body as { currentPassword: string; newPassword: string }
  if (viewer.password !== currentPassword) {
    throw new ApiError('Mật khẩu hiện tại không đúng.', 400)
  }
  viewer.password = newPassword
  return undefined
})

// ----- Users -----
on('GET', '/api/users/me', (ctx) => toUserMe(ctx.viewer!))

on('PUT', '/api/users/me/profile', (ctx) => {
  const viewer = ctx.viewer!
  const body = ctx.body as {
    fullName: string
    className: string | null
    gradeLevel: string | null
    bio: string | null
    avatarUrl: string | null
    profilePublic: boolean
    tagIds: number[]
  }
  viewer.fullName = body.fullName
  viewer.className = body.className
  viewer.gradeLevel = body.gradeLevel
  viewer.bio = body.bio
  viewer.avatarUrl = body.avatarUrl
  viewer.profilePublic = body.profilePublic
  viewer.tagIds = [...body.tagIds]
  viewer.hasProfile = true
  return toUserMe(viewer)
})

on('GET', '/api/users/search', (ctx) => {
  const q = (ctx.query.get('q') ?? '').toLowerCase().trim()
  const viewer = ctx.viewer!
  const results = db.users.filter(
    (u) => u.id !== viewer.id && u.role === 'STUDENT' && (u.fullName ?? '').toLowerCase().includes(q),
  )
  return results.map(toUserSearch) satisfies UserSearchResponse[]
})

on('GET', '/api/users/me/blocks', (ctx) => {
  const viewer = ctx.viewer!
  return db.blocks
    .filter((b) => b.userId === viewer.id)
    .map((b) => {
      const target = findUser(b.blockedUserId)
      return { userId: b.blockedUserId, fullName: target?.fullName ?? 'Học sinh', avatarUrl: target?.avatarUrl ?? null }
    })
})

on('POST', '/api/users/:id/block', (ctx) => {
  const viewer = ctx.viewer!
  const targetId = Number(ctx.params[0])
  if (!db.blocks.some((b) => b.userId === viewer.id && b.blockedUserId === targetId)) {
    db.blocks.push({ userId: viewer.id, blockedUserId: targetId })
  }
  return undefined
})

on('DELETE', '/api/users/:id/block', (ctx) => {
  const viewer = ctx.viewer!
  const targetId = Number(ctx.params[0])
  db.blocks = db.blocks.filter((b) => !(b.userId === viewer.id && b.blockedUserId === targetId))
  return undefined
})

on('GET', '/api/users/:id', (ctx) => {
  const viewer = ctx.viewer!
  const targetId = Number(ctx.params[0])
  const target = findUser(targetId)
  if (!target) throw new ApiError('Không tìm thấy hồ sơ này.', 404)
  const canBypassPrivacy = viewer.role === 'ADMIN' || viewer.role === 'STAFF' || viewer.id === target.id
  if (!target.profilePublic && !canBypassPrivacy) {
    throw new ApiError('Hồ sơ này đang ở chế độ riêng tư.', 403)
  }
  return toPublicProfile(target)
})

// ----- Tags -----
on('GET', '/api/tags', () => db.tags.map((t) => ({ ...t })) satisfies TagResponse[])

function requireAdmin(viewer: MockUser) {
  if (viewer.role !== 'ADMIN') throw new ApiError('Chỉ Quản trị viên mới có quyền thực hiện thao tác này.', 403)
}

on('POST', '/api/admin/tags', (ctx) => {
  requireAdmin(ctx.viewer!)
  const { name, type } = ctx.body as { name: string; type: TagResponse['type'] }
  const tag: TagResponse = { id: nextId('tag'), name, type }
  db.tags.push(tag)
  return tag
})

on('PUT', '/api/admin/tags/:id', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  const tag = db.tags.find((t) => t.id === id)
  if (!tag) throw new ApiError('Không tìm thấy thẻ.', 404)
  const { name, type } = ctx.body as { name: string; type: TagResponse['type'] }
  tag.name = name
  tag.type = type
  return { ...tag }
})

on('DELETE', '/api/admin/tags/:id', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  db.tags = db.tags.filter((t) => t.id !== id)
  db.users.forEach((u) => {
    u.tagIds = u.tagIds.filter((tagId) => tagId !== id)
  })
  return undefined
})

// ----- Icebreakers -----
on('GET', '/api/icebreakers', () => db.icebreakers.map((i) => ({ ...i })) satisfies IcebreakerQuestionResponse[])

on('GET', '/api/icebreakers/random', () => {
  const pick = db.icebreakers[Math.floor(Math.random() * db.icebreakers.length)]
  return { ...pick } satisfies IcebreakerQuestionResponse
})

on('POST', '/api/admin/icebreakers', (ctx) => {
  requireAdmin(ctx.viewer!)
  const { content } = ctx.body as { content: string }
  const question: IcebreakerQuestionResponse = { id: nextId('icebreaker'), content }
  db.icebreakers.push(question)
  return question
})

on('PUT', '/api/admin/icebreakers/:id', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  const question = db.icebreakers.find((q) => q.id === id)
  if (!question) throw new ApiError('Không tìm thấy câu hỏi.', 404)
  const { content } = ctx.body as { content: string }
  question.content = content
  return { ...question }
})

on('DELETE', '/api/admin/icebreakers/:id', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  db.icebreakers = db.icebreakers.filter((q) => q.id !== id)
  return undefined
})

// ----- Admin users -----
on('GET', '/api/admin/users', (ctx) => {
  requireAdmin(ctx.viewer!)
  return db.users.map((u) => ({ id: u.id, studentCode: u.studentCode, role: u.role, status: 'ACTIVE' })) satisfies AdminUserResponse[]
})

on('PUT', '/api/admin/users/:id/role', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  const user = requireUser(id)
  const { role } = ctx.body as { role: MockRole }
  user.role = role
  return undefined
})

on('POST', '/api/admin/users/:id/reset-password', (ctx) => {
  requireAdmin(ctx.viewer!)
  const id = Number(ctx.params[0])
  const user = requireUser(id)
  const temp = Math.random().toString(36).slice(2, 10)
  user.password = temp
  return { userId: user.id, studentCode: user.studentCode, temporaryPassword: temp } satisfies ResetPasswordResponse
})

on('GET', '/api/admin/users/by-code/:code', (ctx) => {
  const viewer = ctx.viewer!
  if (viewer.role === 'STUDENT') throw new ApiError('Không có quyền truy cập.', 403)
  const sixDigits = ctx.params[0]
  const fullCode = `VS${sixDigits}`
  const user = db.users.find((u) => u.studentCode === fullCode)
  if (!user) throw new ApiError(`Không tìm thấy học sinh với mã ${fullCode}.`, 404)
  return toUserSearch(user)
})

on('POST', '/api/staff/users/by-code/:code/reset-password', () => {
  throw new ApiError('Không dùng endpoint này.', 404)
})

// ----- Matches -----
on('GET', '/api/matches/suggestions', (ctx) => {
  const viewer = ctx.viewer!
  const viewerTags = new Set(viewer.tagIds)
  const suggestions = db.users
    .filter((u) => u.id !== viewer.id && u.role === 'STUDENT' && !isBlockedEitherWay(viewer.id, u.id))
    .filter((u) => friendshipStatus(viewer.id, u.id) !== 'FRIENDS')
    .map((u) => {
      const matchedTags = tagsFor(u).filter((t) => viewerTags.has(t.id))
      return {
        userId: u.id,
        fullName: u.fullName ?? u.studentCode,
        className: u.className,
        gradeLevel: u.gradeLevel,
        avatarUrl: u.avatarUrl,
        matchedTagCount: matchedTags.length,
        matchedTags,
      } satisfies MatchSuggestionResponse
    })
    .sort((a, b) => b.matchedTagCount - a.matchedTagCount)
    .slice(0, 8)
  return suggestions
})

// ----- Events -----
on('GET', '/api/events/mine', (ctx) => {
  const viewer = ctx.viewer!
  if (viewer.role === 'STUDENT') throw new ApiError('Không có quyền truy cập.', 403)
  return db.events
    .filter((e) => e.createdByUserId === viewer.id || viewer.role === 'ADMIN')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((e) => toEventResponse(e, viewer.id))
})

on('GET', '/api/events', (ctx) => {
  const viewer = ctx.viewer
  return db.events
    .filter((e) => e.status === 'PUBLISHED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((e) => toEventResponse(e, viewer?.id ?? null))
})

on('POST', '/api/events', (ctx) => {
  const viewer = ctx.viewer!
  if (viewer.role === 'STUDENT') throw new ApiError('Không có quyền tạo sự kiện.', 403)
  const body = ctx.body as Omit<MockDb['events'][number], 'id' | 'createdByUserId' | 'status'>
  const event: MockDb['events'][number] = {
    id: nextId('event'),
    title: body.title,
    description: body.description ?? null,
    scope: body.scope,
    startTime: body.startTime,
    endTime: body.endTime ?? null,
    status: 'DRAFT',
    createdByUserId: viewer.id,
    location: body.location ?? null,
    iconKey: body.iconKey,
  }
  db.events.push(event)
  return toEventResponse(event, viewer.id)
})

on('GET', '/api/events/:id', (ctx) => {
  const viewer = ctx.viewer
  const id = Number(ctx.params[0])
  const event = db.events.find((e) => e.id === id)
  if (!event) throw new ApiError('Không tìm thấy sự kiện này.', 404)
  const canSeeUnpublished = viewer && (viewer.role === 'ADMIN' || viewer.id === event.createdByUserId)
  if (event.status !== 'PUBLISHED' && !canSeeUnpublished) {
    throw new ApiError('Không tìm thấy sự kiện này.', 404)
  }
  return toEventResponse(event, viewer?.id ?? null)
})

on('PUT', '/api/events/:id', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const event = db.events.find((e) => e.id === id)
  if (!event) throw new ApiError('Không tìm thấy sự kiện này.', 404)
  if (viewer.role !== 'ADMIN' && viewer.id !== event.createdByUserId) {
    throw new ApiError('Bạn không có quyền sửa sự kiện này.', 403)
  }
  const body = ctx.body as Partial<MockDb['events'][number]>
  Object.assign(event, {
    title: body.title ?? event.title,
    description: body.description ?? event.description,
    scope: body.scope ?? event.scope,
    startTime: body.startTime ?? event.startTime,
    endTime: body.endTime ?? event.endTime,
    location: body.location ?? event.location,
    iconKey: body.iconKey ?? event.iconKey,
    status: body.status ?? event.status,
  })
  return toEventResponse(event, viewer.id)
})

on('POST', '/api/events/:id/register', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const event = db.events.find((e) => e.id === id)
  if (!event || event.status !== 'PUBLISHED') throw new ApiError('Sự kiện chưa mở đăng ký.', 400)
  if (!db.eventRegistrations.some((r) => r.eventId === id && r.userId === viewer.id)) {
    db.eventRegistrations.push({ eventId: id, userId: viewer.id, registeredAt: nowIso() })
  }
  return undefined
})

on('DELETE', '/api/events/:id/register', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  db.eventRegistrations = db.eventRegistrations.filter((r) => !(r.eventId === id && r.userId === viewer.id))
  return undefined
})

on('GET', '/api/events/:id/registrations', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const event = db.events.find((e) => e.id === id)
  if (!event) throw new ApiError('Không tìm thấy sự kiện này.', 404)
  if (viewer.role !== 'ADMIN' && viewer.id !== event.createdByUserId) {
    throw new ApiError('Bạn không có quyền xem danh sách này.', 403)
  }
  return db.eventRegistrations
    .filter((r) => r.eventId === id)
    .map((r) => {
      const user = findUser(r.userId)
      return {
        userId: r.userId,
        studentCode: user?.studentCode ?? null,
        fullName: user?.fullName ?? null,
        registeredAt: r.registeredAt,
      } satisfies EventRegistrationResponse
    })
})

// ----- Study groups -----
on('GET', '/api/study-groups', (ctx) => {
  const viewer = ctx.viewer
  const q = (ctx.query.get('q') ?? '').toLowerCase().trim()
  return db.studyGroups
    .filter((g) => !q || g.name.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q))
    .map((g) => toStudyGroupResponse(g, viewer?.id ?? null))
})

on('POST', '/api/study-groups', (ctx) => {
  const viewer = ctx.viewer!
  const body = ctx.body as { name: string; subject: string; description: string | null }
  const group: MockDb['studyGroups'][number] = {
    id: nextId('studyGroup'),
    name: body.name,
    subject: body.subject,
    description: body.description,
    createdByUserId: viewer.id,
    createdAt: nowIso(),
  }
  db.studyGroups.push(group)
  db.groupMembers.push({ groupId: group.id, userId: viewer.id })
  return toStudyGroupResponse(group, viewer.id)
})

on('GET', '/api/study-groups/:id', (ctx) => {
  const viewer = ctx.viewer
  const id = Number(ctx.params[0])
  const group = db.studyGroups.find((g) => g.id === id)
  if (!group) throw new ApiError('Không tìm thấy nhóm học tập này.', 404)
  return toStudyGroupResponse(group, viewer?.id ?? null)
})

on('POST', '/api/study-groups/:id/join', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  if (!db.groupMembers.some((m) => m.groupId === id && m.userId === viewer.id)) {
    db.groupMembers.push({ groupId: id, userId: viewer.id })
  }
  return undefined
})

on('DELETE', '/api/study-groups/:id/join', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  db.groupMembers = db.groupMembers.filter((m) => !(m.groupId === id && m.userId === viewer.id))
  return undefined
})

on('GET', '/api/study-groups/:id/messages', (ctx) => {
  const id = Number(ctx.params[0])
  return db.groupMessages
    .filter((m) => m.groupId === id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
    .map((m) => {
      const sender = findUser(m.senderId)
      return {
        id: m.id,
        groupId: m.groupId,
        senderId: m.senderId,
        senderName: sender?.fullName ?? null,
        content: m.content,
        sentAt: m.sentAt,
      } satisfies StudyGroupMessageResponse
    })
})

on('POST', '/api/study-groups/:id/messages', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const { content } = ctx.body as { content: string }
  const message = { id: nextId('groupMessage'), groupId: id, senderId: viewer.id, content, sentAt: nowIso() }
  db.groupMessages.push(message)
  return {
    id: message.id,
    groupId: id,
    senderId: viewer.id,
    senderName: viewer.fullName,
    content,
    sentAt: message.sentAt,
  } satisfies StudyGroupMessageResponse
})

on('GET', '/api/study-groups/:id/questions', (ctx) => {
  const id = Number(ctx.params[0])
  return db.groupQuestions
    .filter((q) => q.groupId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((q) => {
      const author = findUser(q.authorId)
      const answerCount = db.groupAnswers.filter((a) => a.questionId === q.id).length
      return {
        id: q.id,
        groupId: q.groupId,
        authorId: q.authorId,
        authorName: author?.fullName ?? null,
        content: q.content,
        createdAt: q.createdAt,
        answerCount,
      } satisfies StudyGroupQuestionResponse
    })
})

on('POST', '/api/study-groups/:id/questions', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const { content } = ctx.body as { content: string }
  const question = { id: nextId('groupQuestion'), groupId: id, authorId: viewer.id, content, createdAt: nowIso() }
  db.groupQuestions.push(question)
  return {
    id: question.id,
    groupId: id,
    authorId: viewer.id,
    authorName: viewer.fullName,
    content,
    createdAt: question.createdAt,
    answerCount: 0,
  } satisfies StudyGroupQuestionResponse
})

on('GET', '/api/study-groups/:id/questions/:qid/answers', (ctx) => {
  const qid = Number(ctx.params[1])
  return db.groupAnswers
    .filter((a) => a.questionId === qid)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((a) => {
      const author = findUser(a.authorId)
      return {
        id: a.id,
        questionId: a.questionId,
        authorId: a.authorId,
        authorName: author?.fullName ?? null,
        content: a.content,
        createdAt: a.createdAt,
      } satisfies StudyGroupAnswerResponse
    })
})

on('POST', '/api/study-groups/:id/questions/:qid/answers', (ctx) => {
  const viewer = ctx.viewer!
  const qid = Number(ctx.params[1])
  const { content } = ctx.body as { content: string }
  const answer = { id: nextId('groupAnswer'), questionId: qid, authorId: viewer.id, content, createdAt: nowIso() }
  db.groupAnswers.push(answer)
  return {
    id: answer.id,
    questionId: qid,
    authorId: viewer.id,
    authorName: viewer.fullName,
    content,
    createdAt: answer.createdAt,
  } satisfies StudyGroupAnswerResponse
})

// ----- Threads / messages -----
on('GET', '/api/threads', (ctx) => {
  const viewer = ctx.viewer!
  return db.threads
    .filter((t) => t.userAId === viewer.id || t.userBId === viewer.id)
    .map((t) => {
      const otherId = otherUserOfThread(t, viewer.id)
      const other = findUser(otherId)
      const threadMessages = db.messages.filter((m) => m.threadId === t.id).sort((a, b) => a.sentAt.localeCompare(b.sentAt))
      const last = threadMessages[threadMessages.length - 1]
      const unreadCount = threadMessages.filter((m) => m.senderId !== viewer.id && !m.read).length
      return {
        threadId: t.id,
        otherUserId: otherId,
        otherUserFullName: other?.fullName ?? null,
        otherUserAvatarUrl: other?.avatarUrl ?? null,
        lastMessageContent: last?.content ?? null,
        lastMessageAt: last?.sentAt ?? null,
        lastMessageFromMe: last ? last.senderId === viewer.id : false,
        unreadCount,
      } satisfies ThreadResponse
    })
    .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''))
})

function toMessageResponse(m: MockDb['messages'][number]): MessageResponse {
  const event = m.eventId != null ? db.events.find((e) => e.id === m.eventId) : null
  const group = m.groupId != null ? db.studyGroups.find((g) => g.id === m.groupId) : null
  return {
    id: m.id,
    threadId: m.threadId,
    senderId: m.senderId,
    content: m.content,
    sentAt: m.sentAt,
    read: m.read,
    type: m.type,
    eventId: m.eventId,
    eventTitle: event?.title ?? null,
    groupId: m.groupId,
    groupName: group?.name ?? null,
  }
}

on('GET', '/api/threads/:otherUserId/messages', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  const thread = db.threads.find(
    (t) => (t.userAId === viewer.id && t.userBId === otherId) || (t.userAId === otherId && t.userBId === viewer.id),
  )
  if (!thread) return []
  db.messages.forEach((m) => {
    if (m.threadId === thread!.id && m.senderId !== viewer.id) m.read = true
  })
  return db.messages
    .filter((m) => m.threadId === thread!.id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
    .map(toMessageResponse)
})

function assertNotBlocked(viewerId: number, otherId: number) {
  if (isBlockedEitherWay(viewerId, otherId)) {
    throw new ApiError('Không thể gửi tin nhắn cho người dùng này.', 403)
  }
}

on('POST', '/api/threads/:otherUserId/messages', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  assertNotBlocked(viewer.id, otherId)
  const { content } = ctx.body as { content: string }
  const thread = findOrCreateThread(viewer.id, otherId)
  const message = {
    id: nextId('message'),
    threadId: thread.id,
    senderId: viewer.id,
    content,
    sentAt: nowIso(),
    read: false,
    type: 'TEXT' as const,
    eventId: null,
    groupId: null,
  }
  db.messages.push(message)
  const prefs = ensurePrefs(otherId)
  if (prefs.messagesEnabled) {
    createNotification(otherId, 'NEW_MESSAGE', `${viewer.fullName ?? 'Một bạn học'} đã nhắn tin cho bạn.`, thread.id)
  }
  return toMessageResponse(message)
})

on('POST', '/api/threads/:otherUserId/event-invites', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  assertNotBlocked(viewer.id, otherId)
  const { eventId } = ctx.body as { eventId: number }
  const thread = findOrCreateThread(viewer.id, otherId)
  const event = db.events.find((e) => e.id === eventId)
  const message = {
    id: nextId('message'),
    threadId: thread.id,
    senderId: viewer.id,
    content: `Đã chia sẻ sự kiện: ${event?.title ?? ''}`,
    sentAt: nowIso(),
    read: false,
    type: 'EVENT_INVITE' as const,
    eventId,
    groupId: null,
  }
  db.messages.push(message)
  const prefs = ensurePrefs(otherId)
  if (prefs.messagesEnabled) {
    createNotification(otherId, 'NEW_MESSAGE', `${viewer.fullName ?? 'Một bạn học'} đã mời bạn tham gia sự kiện.`, thread.id)
  }
  return toMessageResponse(message)
})

on('POST', '/api/threads/:otherUserId/group-invites', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  assertNotBlocked(viewer.id, otherId)
  const { groupId } = ctx.body as { groupId: number }
  const thread = findOrCreateThread(viewer.id, otherId)
  const group = db.studyGroups.find((g) => g.id === groupId)
  const message = {
    id: nextId('message'),
    threadId: thread.id,
    senderId: viewer.id,
    content: `Đã mời bạn vào nhóm: ${group?.name ?? ''}`,
    sentAt: nowIso(),
    read: false,
    type: 'GROUP_INVITE' as const,
    eventId: null,
    groupId,
  }
  db.messages.push(message)
  const prefs = ensurePrefs(otherId)
  if (prefs.messagesEnabled) {
    createNotification(otherId, 'NEW_MESSAGE', `${viewer.fullName ?? 'Một bạn học'} đã mời bạn vào nhóm học tập.`, thread.id)
  }
  return toMessageResponse(message)
})

// ----- Friends -----
on('GET', '/api/friends', (ctx) => {
  const viewer = ctx.viewer!
  return db.friendships
    .filter((f) => f.userA === viewer.id || f.userB === viewer.id)
    .map((f) => {
      const otherId = f.userA === viewer.id ? f.userB : f.userA
      const other = requireUser(otherId)
      return {
        userId: other.id,
        studentCode: other.studentCode,
        fullName: other.fullName ?? other.studentCode,
        className: other.className,
        gradeLevel: other.gradeLevel,
        avatarUrl: other.avatarUrl,
        bio: other.bio,
        since: f.since,
      } satisfies FriendResponse
    })
})

on('GET', '/api/friends/requests', (ctx) => {
  const viewer = ctx.viewer!
  return db.friendRequests
    .filter((r) => r.toUserId === viewer.id)
    .map((r) => {
      const from = requireUser(r.fromUserId)
      return {
        requestId: r.id,
        userId: from.id,
        studentCode: from.studentCode,
        fullName: from.fullName ?? from.studentCode,
        className: from.className,
        avatarUrl: from.avatarUrl,
        createdAt: r.createdAt,
      } satisfies FriendRequestResponse
    })
})

on('GET', '/api/friends/sent-requests', (ctx) => {
  const viewer = ctx.viewer!
  return db.friendRequests
    .filter((r) => r.fromUserId === viewer.id)
    .map((r) => {
      const to = requireUser(r.toUserId)
      return {
        requestId: r.id,
        userId: to.id,
        studentCode: to.studentCode,
        fullName: to.fullName ?? to.studentCode,
        className: to.className,
        avatarUrl: to.avatarUrl,
        createdAt: r.createdAt,
      } satisfies FriendRequestResponse
    })
})

on('GET', '/api/friends/status/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  return { userId: otherId, status: friendshipStatus(viewer.id, otherId) } satisfies FriendshipStatusResponse
})

on('POST', '/api/friends/request/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  const status = friendshipStatus(viewer.id, otherId)
  if (status === 'NONE') {
    db.friendRequests.push({ id: nextId('friendRequest'), fromUserId: viewer.id, toUserId: otherId, createdAt: nowIso() })
    createNotification(otherId, 'GROUP_ACTIVITY', `${viewer.fullName ?? 'Một bạn học'} đã gửi lời mời kết bạn.`, null)
  }
  return { userId: otherId, status: friendshipStatus(viewer.id, otherId) } satisfies FriendshipStatusResponse
})

on('POST', '/api/friends/accept/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  const request = db.friendRequests.find((r) => r.fromUserId === otherId && r.toUserId === viewer.id)
  if (request) {
    db.friendRequests = db.friendRequests.filter((r) => r.id !== request.id)
    db.friendships.push({ id: nextId('friendship'), userA: viewer.id, userB: otherId, since: nowIso() })
  }
  return { userId: otherId, status: friendshipStatus(viewer.id, otherId) } satisfies FriendshipStatusResponse
})

on('POST', '/api/friends/reject/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  db.friendRequests = db.friendRequests.filter((r) => !(r.fromUserId === otherId && r.toUserId === viewer.id))
  return undefined
})

on('POST', '/api/friends/cancel/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  db.friendRequests = db.friendRequests.filter((r) => !(r.fromUserId === viewer.id && r.toUserId === otherId))
  return undefined
})

on('DELETE', '/api/friends/:userId', (ctx) => {
  const viewer = ctx.viewer!
  const otherId = Number(ctx.params[0])
  db.friendships = db.friendships.filter(
    (f) => !((f.userA === viewer.id && f.userB === otherId) || (f.userA === otherId && f.userB === viewer.id)),
  )
  return undefined
})

// ----- Notifications -----
on('GET', '/api/notifications', (ctx) => {
  const viewer = ctx.viewer!
  return db.notifications
    .filter((n) => n.userId === viewer.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((n) => ({ ...n })) satisfies NotificationResponse[]
})

on('GET', '/api/notifications/unread-count', (ctx) => {
  const viewer = ctx.viewer!
  const count = db.notifications.filter((n) => n.userId === viewer.id && !n.read).length
  return { count }
})

on('POST', '/api/notifications/:id/read', (ctx) => {
  const viewer = ctx.viewer!
  const id = Number(ctx.params[0])
  const notification = db.notifications.find((n) => n.id === id && n.userId === viewer.id)
  if (notification) notification.read = true
  return undefined
})

on('POST', '/api/notifications/read-all', (ctx) => {
  const viewer = ctx.viewer!
  db.notifications.forEach((n) => {
    if (n.userId === viewer.id) n.read = true
  })
  return undefined
})

on('GET', '/api/notifications/preferences', (ctx) => {
  const viewer = ctx.viewer!
  const prefs = ensurePrefs(viewer.id)
  return { messagesEnabled: prefs.messagesEnabled, eventsEnabled: prefs.eventsEnabled, groupsEnabled: prefs.groupsEnabled } satisfies NotificationPreferenceResponse
})

on('PUT', '/api/notifications/preferences', (ctx) => {
  const viewer = ctx.viewer!
  const prefs = ensurePrefs(viewer.id)
  const body = ctx.body as NotificationPreferenceResponse
  prefs.messagesEnabled = body.messagesEnabled
  prefs.eventsEnabled = body.eventsEnabled
  prefs.groupsEnabled = body.groupsEnabled
  return undefined
})

// ---------- Dispatcher ----------
function delay(): Promise<void> {
  const ms = 120 + Math.random() * 180
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockRequest<T>(
  path: string,
  method: string,
  body: unknown,
  authHeader: string | null,
): Promise<T> {
  await delay()

  const [pathname, search] = path.split('?')
  const query = new URLSearchParams(search ?? '')

  let viewer: MockUser | null = null
  if (authHeader) {
    const decoded = decodeToken(authHeader)
    if (decoded) viewer = findUser(decoded.userId) ?? null
  }

  for (const route of routes) {
    if (route.method !== method) continue
    const match = route.regex.exec(pathname)
    if (!match) continue

    if (route.requiresAuth && !viewer) {
      throw new ApiError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 401)
    }

    const result = route.handler({ params: match.slice(1), query, body, viewer })
    persist()
    return result as T
  }

  throw new ApiError(`Không tìm thấy endpoint mock cho ${method} ${pathname}`, 404)
}
