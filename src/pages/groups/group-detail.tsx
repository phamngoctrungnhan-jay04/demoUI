import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Plus, Send, UserPlus } from 'lucide-react'
import { GroupBanner } from '@/components/group-banner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { InviteFriendsModal } from '@/components/invite-friends-modal'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/current-user'
import type {
  StudyGroupAnswerResponse,
  StudyGroupMessageResponse,
  StudyGroupQuestionResponse,
  StudyGroupResponse,
} from '@/lib/api-types'
import { cn } from '@/lib/utils'

type Tab = 'chat' | 'qa'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: me } = useCurrentUser()

  const [group, setGroup] = useState<StudyGroupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('chat')

  const [messages, setMessages] = useState<StudyGroupMessageResponse[]>([])
  const [draft, setDraft] = useState('')

  const [questions, setQuestions] = useState<StudyGroupQuestionResponse[]>([])
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, StudyGroupAnswerResponse[]>>({})
  const [questionDraft, setQuestionDraft] = useState('')
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({})

  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get<StudyGroupResponse>(`/api/study-groups/${id}`),
      api.get<StudyGroupMessageResponse[]>(`/api/study-groups/${id}/messages`),
      api.get<StudyGroupQuestionResponse[]>(`/api/study-groups/${id}/questions`),
    ])
      .then(async ([groupData, messagesData, questionsData]) => {
        setGroup(groupData)
        setMessages(messagesData)
        setQuestions(questionsData)
        const answerEntries = await Promise.all(
          questionsData.map(
            (q) =>
              api
                .get<StudyGroupAnswerResponse[]>(`/api/study-groups/${id}/questions/${q.id}/answers`)
                .then((answers) => [q.id, answers] as const),
          ),
        )
        setAnswersByQuestion(Object.fromEntries(answerEntries))
      })
      .catch(() => setGroup(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-ink">Đang tải...</div>
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-ink">
        Không tìm thấy nhóm này.
      </div>
    )
  }

  async function toggleJoin() {
    if (!group) return
    if (group.joined) {
      await api.delete(`/api/study-groups/${group.id}/join`)
      setGroup({ ...group, joined: false, memberCount: group.memberCount - 1 })
    } else {
      await api.post(`/api/study-groups/${group.id}/join`)
      setGroup({ ...group, joined: true, memberCount: group.memberCount + 1 })
    }
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || !group) return
    const message = await api.post<StudyGroupMessageResponse>(`/api/study-groups/${group.id}/messages`, {
      content: draft.trim(),
    })
    setMessages((prev) => [...prev, message])
    setDraft('')
  }

  async function handlePostQuestion(event: FormEvent) {
    event.preventDefault()
    if (!questionDraft.trim() || !group) return
    const question = await api.post<StudyGroupQuestionResponse>(`/api/study-groups/${group.id}/questions`, {
      content: questionDraft.trim(),
    })
    setQuestions((prev) => [question, ...prev])
    setAnswersByQuestion((prev) => ({ ...prev, [question.id]: [] }))
    setQuestionDraft('')
  }

  async function handlePostAnswer(questionId: number) {
    const text = answerDrafts[questionId]?.trim()
    if (!text || !group) return
    const answer = await api.post<StudyGroupAnswerResponse>(
      `/api/study-groups/${group.id}/questions/${questionId}/answers`,
      { content: text },
    )
    setAnswersByQuestion((prev) => ({ ...prev, [questionId]: [...(prev[questionId] ?? []), answer] }))
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answerCount: q.answerCount + 1 } : q)))
    setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }))
  }

  return (
    <div className="w-full min-h-screen bg-cream flex flex-col">
      <header className="flex items-center gap-3 px-6 sm:px-16 py-3.5 border-b-2 border-ink bg-cream flex-wrap">
        <button
          onClick={() => navigate('/groups')}
          className="w-10 h-10 rounded-full border-2 border-ink bg-white flex items-center justify-center shrink-0"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-ink" />
        </button>
        <GroupBanner subject={group.subject} />
        <div className="flex-1 min-w-[140px]">
          <p className="font-display font-bold text-[16px] text-ink">{group.name}</p>
          <p className="text-[12px] text-ink/50">{group.memberCount} thành viên</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border-2 border-ink bg-white text-ink text-[12px] font-semibold"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Mời bạn
        </button>
        <button
          onClick={toggleJoin}
          className="px-3.5 py-2 rounded-md border-2 border-magenta bg-white text-magenta text-[12px] font-semibold"
        >
          {group.joined ? 'Rời nhóm' : 'Tham gia'}
        </button>
      </header>

      <div className="flex gap-2 px-6 sm:px-16 pt-4">
        <button
          onClick={() => setTab('chat')}
          className={cn(
            'px-5 py-2.5 rounded-md text-[13px] font-display font-bold',
            tab === 'chat' ? 'bg-ink text-white' : 'border-2 border-ink/20 text-ink/60',
          )}
        >
          Trò chuyện
        </button>
        <button
          onClick={() => setTab('qa')}
          className={cn(
            'px-5 py-2.5 rounded-md text-[13px] font-display font-bold',
            tab === 'qa' ? 'bg-ink text-white' : 'border-2 border-ink/20 text-ink/60',
          )}
        >
          Hỏi & đáp
        </button>
      </div>

      {tab === 'chat' ? (
        <>
          <main className="flex-1 max-w-[720px] w-full mx-auto px-4 sm:px-10 py-8">
            {messages.length === 0 ? (
              <p className="text-center text-ink/40 text-[14px] mt-10">
                Chưa có tin nhắn nào. Hãy là người đầu tiên bắt chuyện!
              </p>
            ) : (
              messages.map((message) => {
                const isMe = message.senderId === me?.id
                return isMe ? (
                  <div key={message.id} className="flex justify-end mb-4">
                    <div className="max-w-[70%] bg-neon border-2 border-ink rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-[14px] text-ink font-medium">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="mb-4">
                    <p className="text-[11px] font-semibold text-ink/50 mb-1">
                      {message.senderName ?? 'Học sinh'}
                    </p>
                    <div className="max-w-[380px] bg-white border-2 border-ink rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <p className="text-[14px] text-ink">{message.content}</p>
                    </div>
                  </div>
                )
              })
            )}
          </main>
          {group.joined ? (
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 px-6 sm:px-16 py-5 border-t-2 border-ink bg-cream"
            >
              <button
                type="button"
                className="w-10 h-10 rounded-full border-2 border-ink bg-white flex items-center justify-center shrink-0"
              >
                <Plus className="w-4.5 h-4.5 text-ink" />
              </button>
              <input
                type="text"
                placeholder="Nhắn vào nhóm..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="flex-1 px-4 py-3 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none placeholder:text-ink/40"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="w-11 h-11 rounded-full border-2 border-ink bg-neon flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                <Send className="w-4.5 h-4.5 text-ink" />
              </button>
            </form>
          ) : (
            <p className="text-center text-[13px] text-ink/40 py-5 border-t-2 border-ink/10">
              Tham gia nhóm để nhắn tin
            </p>
          )}
        </>
      ) : (
        <main className="max-w-[720px] mx-auto w-full px-4 sm:px-10 py-8">
          {group.joined ? (
            <form onSubmit={handlePostQuestion} className="mb-6">
              <Textarea
                rows={2}
                placeholder="Đặt câu hỏi cho cả nhóm..."
                value={questionDraft}
                onChange={(event) => setQuestionDraft(event.target.value)}
              />
              <Button type="submit" size="sm" disabled={!questionDraft.trim()} className="mt-2">
                Đăng câu hỏi
              </Button>
            </form>
          ) : (
            <p className="text-[13px] text-ink/40 mb-6">Tham gia nhóm để đăng câu hỏi.</p>
          )}

          {questions.length === 0 ? (
            <p className="text-center text-ink/40 text-[14px] mt-10">Chưa có câu hỏi nào trong nhóm này.</p>
          ) : (
            questions.map((question) => {
              const answers = answersByQuestion[question.id] ?? []
              return (
                <div key={question.id} className="bg-white border-2 border-ink rounded-lg p-5 mb-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[13px] font-semibold text-ink">
                      {question.authorName ?? 'Học sinh'}
                    </span>
                  </div>
                  <p className="font-display font-bold text-[16px] text-ink mb-3">{question.content}</p>

                  {answers.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-3 pl-4 border-l-2 border-ink/15">
                      {answers.map((answer) => (
                        <p key={answer.id} className="text-[13px] text-ink/70">
                          <span className="font-semibold text-ink">{answer.authorName ?? 'Học sinh'}:</span>{' '}
                          {answer.content}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {group.joined ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Trả lời..."
                        value={answerDrafts[question.id] ?? ''}
                        onChange={(event) =>
                          setAnswerDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))
                        }
                        className="flex-1 px-3 py-2 rounded-md border-2 border-ink/20 bg-cream text-[13px] text-ink outline-none placeholder:text-ink/40"
                      />
                      <button
                        onClick={() => handlePostAnswer(question.id)}
                        disabled={!answerDrafts[question.id]?.trim()}
                        className="w-9 h-9 rounded-md border-2 border-ink bg-white flex items-center justify-center disabled:opacity-40 shrink-0"
                        aria-label="Gửi trả lời"
                      >
                        <MessageSquare className="w-4 h-4 text-ink" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </main>
      )}

      {inviteOpen ? (
        <InviteFriendsModal
          title="Mời bạn bè vào nhóm"
          subtitle={`"${group.name}"`}
          onClose={() => setInviteOpen(false)}
          onConfirm={async (selected) => {
            await Promise.all(
              selected.map((user) =>
                api.post(`/api/threads/${user.userId}/group-invites`, { groupId: group.id }).catch(() => {}),
              ),
            )
            setInviteOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
