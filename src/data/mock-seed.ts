// Dữ liệu mock ban đầu (seed) cho toàn bộ ứng dụng khi chạy không có backend thật.
// Mọi ID được gán cố định để các trang có thể liên kết chéo với nhau (bạn bè, tin nhắn,
// sự kiện, nhóm học tập, thông báo...).

export type MockRole = 'STUDENT' | 'STAFF' | 'ADMIN'

export interface MockUser {
  id: number
  studentCode: string
  password: string
  role: MockRole
  hasProfile: boolean
  fullName: string | null
  className: string | null
  gradeLevel: string | null
  bio: string | null
  avatarUrl: string | null
  profilePublic: boolean
  tagIds: number[]
}

export interface MockTag {
  id: number
  name: string
  type: 'SUBJECT' | 'HOBBY' | 'CLUB'
}

export interface MockIcebreaker {
  id: number
  content: string
}

export interface MockEvent {
  id: number
  title: string
  description: string | null
  scope: 'SCHOOL' | 'CLASS' | 'CLUB'
  startTime: string
  endTime: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  createdByUserId: number
  location: string | null
  iconKey: 'PARTY' | 'TROPHY' | 'MUSIC' | 'CODE'
}

export interface MockEventRegistration {
  eventId: number
  userId: number
  registeredAt: string
}

export interface MockStudyGroup {
  id: number
  name: string
  subject: string
  description: string | null
  createdByUserId: number
  createdAt: string
}

export interface MockGroupMember {
  groupId: number
  userId: number
}

export interface MockGroupMessage {
  id: number
  groupId: number
  senderId: number
  content: string
  sentAt: string
}

export interface MockGroupQuestion {
  id: number
  groupId: number
  authorId: number
  content: string
  createdAt: string
}

export interface MockGroupAnswer {
  id: number
  questionId: number
  authorId: number
  content: string
  createdAt: string
}

export interface MockThread {
  id: number
  userAId: number
  userBId: number
}

export interface MockMessage {
  id: number
  threadId: number
  senderId: number
  content: string
  sentAt: string
  read: boolean
  type: 'TEXT' | 'EVENT_INVITE' | 'GROUP_INVITE'
  eventId: number | null
  groupId: number | null
}

export interface MockFriendship {
  id: number
  userA: number
  userB: number
  since: string
}

export interface MockFriendRequest {
  id: number
  fromUserId: number
  toUserId: number
  createdAt: string
}

export interface MockNotification {
  id: number
  userId: number
  type: 'NEW_MESSAGE' | 'EVENT_REMINDER' | 'GROUP_ACTIVITY'
  content: string
  relatedId: number | null
  read: boolean
  createdAt: string
}

export interface MockNotificationPreference {
  userId: number
  messagesEnabled: boolean
  eventsEnabled: boolean
  groupsEnabled: boolean
}

export interface MockBlock {
  userId: number
  blockedUserId: number
}

export interface MockDb {
  users: MockUser[]
  tags: MockTag[]
  icebreakers: MockIcebreaker[]
  events: MockEvent[]
  eventRegistrations: MockEventRegistration[]
  studyGroups: MockStudyGroup[]
  groupMembers: MockGroupMember[]
  groupMessages: MockGroupMessage[]
  groupQuestions: MockGroupQuestion[]
  groupAnswers: MockGroupAnswer[]
  threads: MockThread[]
  messages: MockMessage[]
  friendships: MockFriendship[]
  friendRequests: MockFriendRequest[]
  notifications: MockNotification[]
  notificationPreferences: MockNotificationPreference[]
  blocks: MockBlock[]
  nextIds: Record<string, number>
}

export const DEFAULT_PASSWORD = '123456'

export const TAGS: MockTag[] = [
  { id: 1, name: 'Toán', type: 'SUBJECT' },
  { id: 2, name: 'Ngữ văn', type: 'SUBJECT' },
  { id: 3, name: 'Tiếng Anh', type: 'SUBJECT' },
  { id: 4, name: 'Vật lý', type: 'SUBJECT' },
  { id: 5, name: 'Hóa học', type: 'SUBJECT' },
  { id: 6, name: 'Sinh học', type: 'SUBJECT' },
  { id: 7, name: 'Lịch sử', type: 'SUBJECT' },
  { id: 8, name: 'Địa lý', type: 'SUBJECT' },
  { id: 9, name: 'GDCD', type: 'SUBJECT' },
  { id: 10, name: 'Tin học', type: 'SUBJECT' },
  { id: 11, name: 'Đọc sách', type: 'HOBBY' },
  { id: 12, name: 'Âm nhạc', type: 'HOBBY' },
  { id: 13, name: 'Vẽ', type: 'HOBBY' },
  { id: 14, name: 'Nhiếp ảnh', type: 'HOBBY' },
  { id: 15, name: 'Du lịch', type: 'HOBBY' },
  { id: 16, name: 'Game', type: 'HOBBY' },
  { id: 17, name: 'Thể thao', type: 'HOBBY' },
  { id: 18, name: 'Nấu ăn', type: 'HOBBY' },
  { id: 19, name: 'Thời trang', type: 'HOBBY' },
  { id: 20, name: 'Phim ảnh', type: 'HOBBY' },
  { id: 21, name: 'CLB Bóng đá', type: 'CLUB' },
  { id: 22, name: 'CLB Nhảy', type: 'CLUB' },
  { id: 23, name: 'CLB Tiếng Anh', type: 'CLUB' },
  { id: 24, name: 'CLB Guitar', type: 'CLUB' },
  { id: 25, name: 'CLB MC', type: 'CLUB' },
  { id: 26, name: 'CLB Tình nguyện', type: 'CLUB' },
]

export const ICEBREAKERS: MockIcebreaker[] = [
  { id: 1, content: 'Nếu được đổi tên CLB trường thành 1 từ, bạn chọn từ gì?' },
  { id: 2, content: 'Một bài hát bạn nghe đi nghe lại cả tuần này là gì?' },
  { id: 3, content: 'Nếu được dạy 1 môn bất kỳ trong 1 ngày, bạn chọn môn gì?' },
  { id: 4, content: 'Món ăn căng tin bạn ghiền nhất là gì?' },
  { id: 5, content: 'Nếu có siêu năng lực để học bài nhanh hơn, bạn chọn năng lực gì?' },
  { id: 6, content: 'Bạn thích học nhóm hay học một mình hơn? Vì sao?' },
  { id: 7, content: 'CLB nào ở trường bạn muốn thử một lần?' },
  { id: 8, content: 'Nếu được nghỉ học 1 ngày để làm điều mình thích, bạn sẽ làm gì?' },
]

function code(id: number): string {
  return `VS${String(id).padStart(6, '0')}`
}

export const USERS: MockUser[] = [
  {
    id: 1,
    studentCode: code(1),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Nguyễn Minh Anh',
    className: '10A1',
    gradeLevel: 'Khối 10',
    bio: 'Mê bóng đá, thích giải toán khó và đang tìm đồng đội cho CLB Bóng đá trường.',
    avatarUrl: 'rocket',
    profilePublic: true,
    tagIds: [1, 21, 11],
  },
  {
    id: 2,
    studentCode: code(2),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Trần Bảo Châu',
    className: '10A1',
    gradeLevel: 'Khối 10',
    bio: 'Vẽ là đam mê, hiện đang là MC nhí của trường.',
    avatarUrl: 'paintbrush',
    profilePublic: true,
    tagIds: [2, 13, 25],
  },
  {
    id: 3,
    studentCode: code(3),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Lê Gia Hân',
    className: '10A2',
    gradeLevel: 'Khối 10',
    bio: 'Thích đi du lịch và luyện nghe tiếng Anh qua nhạc.',
    avatarUrl: 'sun',
    profilePublic: true,
    tagIds: [3, 12, 15],
  },
  {
    id: 4,
    studentCode: code(4),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Phạm Đức Huy',
    className: '11A1',
    gradeLevel: 'Khối 11',
    bio: 'Game thủ, mê Vật lý và đang luyện giao tiếp tiếng Anh.',
    avatarUrl: 'gamepad',
    profilePublic: true,
    tagIds: [4, 16, 23],
  },
  {
    id: 5,
    studentCode: code(5),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Hoàng Thị Kim Ngân',
    className: '11A1',
    gradeLevel: 'Khối 11',
    bio: 'Thành viên CLB Nhảy, thích chụp ảnh phong cảnh trường.',
    avatarUrl: 'flower',
    profilePublic: true,
    tagIds: [5, 14, 22],
  },
  {
    id: 6,
    studentCode: code(6),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Vũ Quang Minh',
    className: '11A3',
    gradeLevel: 'Khối 11',
    bio: 'Đam mê lập trình game, đá bóng mỗi chiều thứ 6.',
    avatarUrl: 'zap',
    profilePublic: true,
    tagIds: [10, 16, 21],
  },
  {
    id: 7,
    studentCode: code(7),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Đỗ Thanh Trúc',
    className: '12A1',
    gradeLevel: 'Khối 12',
    bio: 'Yêu Sinh học, hay đọc sách và tham gia CLB Tình nguyện.',
    avatarUrl: 'leaf',
    profilePublic: true,
    tagIds: [6, 11, 26],
  },
  {
    id: 8,
    studentCode: code(8),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Bùi Anh Tuấn',
    className: '12A2',
    gradeLevel: 'Khối 12',
    bio: 'Thích tìm hiểu Lịch sử, chơi guitar vào giờ ra chơi.',
    avatarUrl: 'trophy',
    profilePublic: true,
    tagIds: [7, 17, 24],
  },
  {
    id: 9,
    studentCode: code(9),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Ngô Thảo Vy',
    className: '9A1',
    gradeLevel: 'Khối 9',
    bio: 'Mê thời trang, xem phim mỗi cuối tuần.',
    avatarUrl: 'star',
    profilePublic: true,
    tagIds: [8, 19, 20],
  },
  {
    id: 10,
    studentCode: code(10),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Đặng Nhật Long',
    className: '9A2',
    gradeLevel: 'Khối 9',
    bio: 'Thích nấu ăn cho gia đình, đội trưởng đội bóng lớp.',
    avatarUrl: 'car',
    profilePublic: true,
    tagIds: [9, 18, 21],
  },
  {
    id: 11,
    studentCode: code(11),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Lý Hồng Phúc',
    className: '10A3',
    gradeLevel: 'Khối 10',
    bio: 'Chỉ chia sẻ hồ sơ với bạn bè thân thiết.',
    avatarUrl: 'ghost',
    profilePublic: false,
    tagIds: [1, 10, 16],
  },
  {
    id: 12,
    studentCode: code(12),
    password: DEFAULT_PASSWORD,
    role: 'STUDENT',
    hasProfile: true,
    fullName: 'Trịnh Yến Nhi',
    className: '12A3',
    gradeLevel: 'Khối 12',
    bio: 'MC các sự kiện trường, mê nghe nhạc indie.',
    avatarUrl: 'crown',
    profilePublic: true,
    tagIds: [2, 12, 25],
  },
  {
    id: 90,
    studentCode: code(90),
    password: DEFAULT_PASSWORD,
    role: 'STAFF',
    hasProfile: true,
    fullName: 'Cô Phạm Thu Hà',
    className: null,
    gradeLevel: null,
    bio: 'Phụ trách Đoàn - Đội, quản lý các sự kiện trường.',
    avatarUrl: 'sparkles',
    profilePublic: true,
    tagIds: [],
  },
  {
    id: 91,
    studentCode: code(91),
    password: DEFAULT_PASSWORD,
    role: 'STAFF',
    hasProfile: true,
    fullName: 'Thầy Lê Văn Sơn',
    className: null,
    gradeLevel: null,
    bio: 'Giáo viên chủ nhiệm khối 11, phụ trách CLB thể thao.',
    avatarUrl: 'trophy',
    profilePublic: true,
    tagIds: [],
  },
  {
    id: 99,
    studentCode: code(99),
    password: DEFAULT_PASSWORD,
    role: 'ADMIN',
    hasProfile: true,
    fullName: 'Quản Trị Viên Hệ Thống',
    className: null,
    gradeLevel: null,
    bio: 'Quản trị toàn bộ hệ thống Kết Nối Học Đường.',
    avatarUrl: 'crown',
    profilePublic: true,
    tagIds: [],
  },
]

export const EVENTS: MockEvent[] = [
  {
    id: 1,
    title: 'Đêm nhạc Acoustic Sân Trường',
    description: 'Đêm nhạc acoustic với các tiết mục do chính học sinh biểu diễn, mở tự do cho toàn trường.',
    scope: 'SCHOOL',
    startTime: '2026-10-05T18:00:00',
    endTime: '2026-10-05T21:00:00',
    status: 'PUBLISHED',
    createdByUserId: 90,
    location: 'Sân trường chính',
    iconKey: 'MUSIC',
  },
  {
    id: 2,
    title: 'Giải Bóng Đá Học Sinh Khối 11',
    description: 'Giải đấu bóng đá giao hữu giữa các lớp khối 11, đăng ký theo đội hoặc cá nhân.',
    scope: 'CLASS',
    startTime: '2026-10-12T14:00:00',
    endTime: '2026-10-12T17:00:00',
    status: 'PUBLISHED',
    createdByUserId: 91,
    location: 'Sân vận động trường',
    iconKey: 'TROPHY',
  },
  {
    id: 3,
    title: 'Hội Chợ Công Nghệ - Hackathon Mini',
    description: 'Một ngày hackathon mini cho học sinh yêu thích lập trình, làm việc nhóm dựng sản phẩm nhỏ.',
    scope: 'CLUB',
    startTime: '2026-11-02T08:00:00',
    endTime: '2026-11-02T17:00:00',
    status: 'PUBLISHED',
    createdByUserId: 90,
    location: 'Phòng Lab Tin học',
    iconKey: 'CODE',
  },
  {
    id: 4,
    title: 'Tiệc Chào Tân Học Sinh Khối 9',
    description: 'Buổi giao lưu chào đón các bạn học sinh khối 9 mới vào trường.',
    scope: 'SCHOOL',
    startTime: '2026-10-20T17:00:00',
    endTime: null,
    status: 'DRAFT',
    createdByUserId: 91,
    location: 'Hội trường A',
    iconKey: 'PARTY',
  },
  {
    id: 5,
    title: 'Giải Chạy Việt Dã Mùa Thu',
    description: 'Giải chạy việt dã thường niên, đã huỷ do thời tiết xấu.',
    scope: 'SCHOOL',
    startTime: '2026-09-15T07:00:00',
    endTime: '2026-09-15T09:00:00',
    status: 'CANCELLED',
    createdByUserId: 90,
    location: 'Công viên trường',
    iconKey: 'TROPHY',
  },
]

export const EVENT_REGISTRATIONS: MockEventRegistration[] = [
  { eventId: 1, userId: 1, registeredAt: '2026-09-20T10:00:00' },
  { eventId: 1, userId: 2, registeredAt: '2026-09-20T11:00:00' },
  { eventId: 1, userId: 3, registeredAt: '2026-09-21T09:00:00' },
  { eventId: 1, userId: 6, registeredAt: '2026-09-22T08:30:00' },
  { eventId: 1, userId: 9, registeredAt: '2026-09-22T09:15:00' },
  { eventId: 2, userId: 4, registeredAt: '2026-09-23T10:00:00' },
  { eventId: 2, userId: 6, registeredAt: '2026-09-23T10:20:00' },
  { eventId: 2, userId: 8, registeredAt: '2026-09-24T08:00:00' },
  { eventId: 2, userId: 10, registeredAt: '2026-09-24T09:00:00' },
  { eventId: 3, userId: 1, registeredAt: '2026-09-25T14:00:00' },
  { eventId: 3, userId: 5, registeredAt: '2026-09-25T15:00:00' },
  { eventId: 3, userId: 11, registeredAt: '2026-09-26T10:00:00' },
]

export const STUDY_GROUPS: MockStudyGroup[] = [
  {
    id: 1,
    name: 'Nhóm Toán 10A3',
    subject: 'Toán học',
    description: 'Ôn thi giữa kỳ Toán 10, cùng nhau giải đề khó.',
    createdByUserId: 1,
    createdAt: '2026-09-10T08:00:00',
  },
  {
    id: 2,
    name: 'CLB Tiếng Anh Giao Tiếp',
    subject: 'Tiếng Anh',
    description: 'Luyện nói tiếng Anh mỗi tuần qua chủ đề ngẫu nhiên.',
    createdByUserId: 3,
    createdAt: '2026-09-12T08:00:00',
  },
  {
    id: 3,
    name: 'Nhóm Lý - Hóa 11',
    subject: 'Vật lý & Hóa học',
    description: 'Giải đề thi thử, chia sẻ tài liệu ôn tập.',
    createdByUserId: 5,
    createdAt: '2026-09-14T08:00:00',
  },
  {
    id: 4,
    name: 'Hội Mê Vẽ',
    subject: 'Mỹ thuật',
    description: 'Chia sẻ tranh vẽ, kỹ thuật vẽ và góp ý cho nhau.',
    createdByUserId: 2,
    createdAt: '2026-09-16T08:00:00',
  },
]

export const GROUP_MEMBERS: MockGroupMember[] = [
  { groupId: 1, userId: 1 },
  { groupId: 1, userId: 2 },
  { groupId: 1, userId: 6 },
  { groupId: 1, userId: 11 },
  { groupId: 2, userId: 3 },
  { groupId: 2, userId: 4 },
  { groupId: 2, userId: 9 },
  { groupId: 3, userId: 4 },
  { groupId: 3, userId: 5 },
  { groupId: 3, userId: 7 },
  { groupId: 4, userId: 2 },
  { groupId: 4, userId: 9 },
]

export const GROUP_MESSAGES: MockGroupMessage[] = [
  { id: 1, groupId: 1, senderId: 1, content: 'Tối nay mình họp ôn chương Hàm số nhé cả nhóm!', sentAt: '2026-09-24T19:00:00' },
  { id: 2, groupId: 1, senderId: 2, content: 'Ok bạn, mình gửi trước đề cương nha.', sentAt: '2026-09-24T19:05:00' },
  { id: 3, groupId: 1, senderId: 6, content: 'Cho mình xin đề cương với!', sentAt: '2026-09-24T19:10:00' },
]

export const GROUP_QUESTIONS: MockGroupQuestion[] = [
  { id: 1, groupId: 1, authorId: 6, content: 'Có ai giải thích lại dùm mình cách xét dấu tam thức bậc 2 không?', createdAt: '2026-09-25T14:00:00' },
  { id: 2, groupId: 2, authorId: 9, content: 'Mọi người ơi, cách phát âm từ "though" chuẩn là sao vậy?', createdAt: '2026-09-25T15:00:00' },
]

export const GROUP_ANSWERS: MockGroupAnswer[] = [
  { id: 1, questionId: 1, authorId: 1, content: 'Bạn xét dấu hệ số a trước rồi so nghiệm là ra ngay á!', createdAt: '2026-09-25T14:10:00' },
  { id: 2, questionId: 1, authorId: 2, content: 'Mình có file tóm tắt công thức, để mình gửi vào nhóm.', createdAt: '2026-09-25T14:15:00' },
]

export const THREADS: MockThread[] = [
  { id: 1, userAId: 1, userBId: 2 },
  { id: 2, userAId: 1, userBId: 6 },
  { id: 3, userAId: 1, userBId: 90 },
  { id: 4, userAId: 2, userBId: 6 },
]

export const MESSAGES: MockMessage[] = [
  { id: 1, threadId: 1, senderId: 1, content: 'Chào Châu, tối nay đi tập văn nghệ không?', sentAt: '2026-09-26T18:00:00', read: true, type: 'TEXT', eventId: null, groupId: null },
  { id: 2, threadId: 1, senderId: 2, content: 'Có chứ! À bạn xem thiệp mời sự kiện này chưa?', sentAt: '2026-09-26T18:05:00', read: true, type: 'TEXT', eventId: null, groupId: null },
  { id: 3, threadId: 1, senderId: 2, content: 'Mời bạn tham gia Đêm nhạc Acoustic Sân Trường nè!', sentAt: '2026-09-26T18:06:00', read: false, type: 'EVENT_INVITE', eventId: 1, groupId: null },
  { id: 4, threadId: 2, senderId: 6, content: 'Ê Minh Anh, mai đá bóng không?', sentAt: '2026-09-25T17:00:00', read: true, type: 'TEXT', eventId: null, groupId: null },
  { id: 5, threadId: 2, senderId: 1, content: 'Có, mà tối nay vào nhóm Toán ôn bài xíu nha.', sentAt: '2026-09-25T17:10:00', read: true, type: 'TEXT', eventId: null, groupId: null },
  { id: 6, threadId: 2, senderId: 1, content: 'Mời bạn vào nhóm học tập của mình nè.', sentAt: '2026-09-25T17:11:00', read: true, type: 'GROUP_INVITE', eventId: null, groupId: 1 },
  { id: 7, threadId: 3, senderId: 1, content: 'Cô ơi em muốn hỏi về cách đăng ký Hackathon Mini ạ.', sentAt: '2026-09-24T09:00:00', read: true, type: 'TEXT', eventId: null, groupId: null },
  { id: 8, threadId: 3, senderId: 90, content: 'Em vào mục Sự kiện trường, bấm đăng ký sự kiện Hackathon Mini là được nhé!', sentAt: '2026-09-24T09:05:00', read: false, type: 'TEXT', eventId: null, groupId: null },
]

export const FRIENDSHIPS: MockFriendship[] = [
  { id: 1, userA: 1, userB: 2, since: '2026-08-01T08:00:00' },
  { id: 2, userA: 1, userB: 6, since: '2026-08-05T08:00:00' },
  { id: 3, userA: 2, userB: 6, since: '2026-08-10T08:00:00' },
  { id: 4, userA: 4, userB: 5, since: '2026-08-15T08:00:00' },
]

export const FRIEND_REQUESTS: MockFriendRequest[] = [
  { id: 1, fromUserId: 1, toUserId: 9, createdAt: '2026-09-20T10:00:00' },
  { id: 2, fromUserId: 3, toUserId: 1, createdAt: '2026-09-21T10:00:00' },
]

export const NOTIFICATIONS: MockNotification[] = [
  { id: 1, userId: 1, type: 'NEW_MESSAGE', content: 'Trần Bảo Châu đã gửi cho bạn một thiệp mời sự kiện.', relatedId: 1, read: false, createdAt: '2026-09-26T18:06:00' },
  { id: 2, userId: 1, type: 'EVENT_REMINDER', content: 'Sự kiện "Đêm nhạc Acoustic Sân Trường" sắp diễn ra.', relatedId: 1, read: true, createdAt: '2026-09-25T08:00:00' },
  { id: 3, userId: 1, type: 'GROUP_ACTIVITY', content: 'Vũ Quang Minh vừa đặt câu hỏi mới trong nhóm Toán 10A3.', relatedId: 1, read: false, createdAt: '2026-09-25T14:00:00' },
  { id: 4, userId: 2, type: 'NEW_MESSAGE', content: 'Nguyễn Minh Anh đã nhắn tin cho bạn.', relatedId: 1, read: true, createdAt: '2026-09-26T18:00:00' },
  { id: 5, userId: 90, type: 'NEW_MESSAGE', content: 'Nguyễn Minh Anh đã nhắn tin hỏi về sự kiện.', relatedId: 3, read: true, createdAt: '2026-09-24T09:00:00' },
  { id: 6, userId: 9, type: 'GROUP_ACTIVITY', content: 'Bạn có một lời mời kết bạn mới.', relatedId: null, read: false, createdAt: '2026-09-20T10:00:00' },
]

export const NOTIFICATION_PREFERENCES: MockNotificationPreference[] = USERS.map((u) => ({
  userId: u.id,
  messagesEnabled: true,
  eventsEnabled: true,
  groupsEnabled: true,
}))

export const BLOCKS: MockBlock[] = [{ userId: 1, blockedUserId: 12 }]

export function buildSeedDb(): MockDb {
  return {
    users: USERS.map((u) => ({ ...u, tagIds: [...u.tagIds] })),
    tags: TAGS.map((t) => ({ ...t })),
    icebreakers: ICEBREAKERS.map((i) => ({ ...i })),
    events: EVENTS.map((e) => ({ ...e })),
    eventRegistrations: EVENT_REGISTRATIONS.map((r) => ({ ...r })),
    studyGroups: STUDY_GROUPS.map((g) => ({ ...g })),
    groupMembers: GROUP_MEMBERS.map((m) => ({ ...m })),
    groupMessages: GROUP_MESSAGES.map((m) => ({ ...m })),
    groupQuestions: GROUP_QUESTIONS.map((q) => ({ ...q })),
    groupAnswers: GROUP_ANSWERS.map((a) => ({ ...a })),
    threads: THREADS.map((t) => ({ ...t })),
    messages: MESSAGES.map((m) => ({ ...m })),
    friendships: FRIENDSHIPS.map((f) => ({ ...f })),
    friendRequests: FRIEND_REQUESTS.map((r) => ({ ...r })),
    notifications: NOTIFICATIONS.map((n) => ({ ...n })),
    notificationPreferences: NOTIFICATION_PREFERENCES.map((p) => ({ ...p })),
    blocks: BLOCKS.map((b) => ({ ...b })),
    nextIds: {
      user: 100,
      tag: 100,
      icebreaker: 100,
      event: 100,
      studyGroup: 100,
      groupMessage: 100,
      groupQuestion: 100,
      groupAnswer: 100,
      thread: 100,
      message: 100,
      friendship: 100,
      friendRequest: 100,
      notification: 100,
    },
  }
}

/** Tài khoản demo dùng cho khối nút "Đăng nhập nhanh" ở trang đăng nhập. */
export const QUICK_LOGIN_ACCOUNTS = [
  { role: 'STUDENT' as const, studentCode: code(1), password: DEFAULT_PASSWORD, label: 'Học sinh', name: 'Nguyễn Minh Anh' },
  { role: 'STAFF' as const, studentCode: code(90), password: DEFAULT_PASSWORD, label: 'Giáo viên / Cán bộ', name: 'Cô Phạm Thu Hà' },
  { role: 'ADMIN' as const, studentCode: code(99), password: DEFAULT_PASSWORD, label: 'Quản trị viên', name: 'Quản Trị Viên Hệ Thống' },
]
