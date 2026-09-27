import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, CalendarDays, MessageCircle, MessagesSquare, Smile, Sparkles, UserPlus } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const interestTags = [
  { label: 'Bóng đá', color: 'border-neon text-neon' },
  { label: 'Vẽ', color: 'border-magenta text-magenta' },
  { label: 'Lập trình', color: 'border-cyan text-cyan' },
  { label: 'CLB Âm nhạc', color: 'border-neon text-neon' },
  { label: 'Đọc sách', color: 'border-magenta text-magenta' },
  { label: 'Nhảy', color: 'border-cyan text-cyan' },
  { label: 'Toán học', color: 'border-neon text-neon' },
  { label: 'Nhiếp ảnh', color: 'border-magenta text-magenta' },
  { label: 'Cầu lông', color: 'border-cyan text-cyan' },
  { label: 'Kịch', color: 'border-neon text-neon' },
]

const steps = [
  {
    icon: UserPlus,
    badge: 'bg-neon',
    iconColor: 'text-ink',
    step: 'BƯỚC 01',
    title: 'Tạo hồ sơ, chọn avatar',
    description: 'Không cần ảnh thật — chọn icon đại diện riêng, kể câu chuyện của bạn bằng tag sở thích.',
    offset: '',
  },
  {
    icon: Sparkles,
    badge: 'bg-cyan',
    iconColor: 'text-ink',
    step: 'BƯỚC 02',
    title: 'Khám phá gợi ý đúng gu',
    description: 'Trang chủ gợi ý bạn cùng sở thích, kèm câu hỏi phá băng để mở đầu chuyện dễ hơn.',
    offset: 'sm:mt-16',
  },
  {
    icon: MessagesSquare,
    badge: 'bg-magenta',
    iconColor: 'text-white',
    step: 'BƯỚC 03',
    title: 'Nhắn tin, tham gia nhóm & sự kiện',
    description: 'Chat 1-1, gửi thiệp mời sự kiện ngay trong khung chat, tham gia nhóm học theo môn.',
    offset: '',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('#mascotJump', {
        autoAlpha: 0,
        scale: 0.7,
        rotation: -8,
        duration: 0.9,
        ease: 'back.out(1.6)',
        delay: 0.2,
      })
      gsap.to('.hero-badge', { y: -6, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.utils.toArray<HTMLElement>('.manifesto-sticker').forEach((el, i) => {
        gsap.to(el, { y: -8, duration: 1.8 + i * 0.2, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })
      gsap.from('.manifesto-statement', {
        autoAlpha: 0,
        y: 24,
        duration: 0.6,
        scrollTrigger: { trigger: '.manifesto-statement', start: 'top 85%' },
      })
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 32,
          duration: 0.6,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
      gsap.from('.testimonial-card', {
        autoAlpha: 0,
        y: 32,
        rotate: -2,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonial-section', start: 'top 80%' },
      })
      gsap.utils.toArray<HTMLElement>('.bento-item').forEach((el, i) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 28,
          duration: 0.55,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
      gsap.from('.final-cta-headline, .final-cta-subtext, .final-cta-button', {
        autoAlpha: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: { trigger: '.final-cta-section', start: 'top 75%' },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  function scrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={rootRef} className="w-full font-sans bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink pt-10 pb-24 px-6 sm:px-16">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(212,255,63,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="absolute -right-24 top-10 w-96 h-96 bg-magenta rounded-full opacity-20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 bg-cyan rounded-full opacity-15 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6 mb-14 sm:mb-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-neon flex items-center justify-center text-ink font-display font-bold text-lg">
              K
            </div>
            <span className="text-white font-display font-semibold text-lg">Kết Nối Học Đường</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-white/70 text-[14px] font-medium">
            <span>Cách hoạt động</span>
            <span>Cộng đồng</span>
            <span>Cho giáo viên</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-md bg-neon text-ink font-display font-bold text-[14px] border-2 border-ink"
          >
            Đăng nhập
          </button>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 max-w-[600px]">
            <span className="hero-badge -rotate-6 inline-block border border-dashed border-neon text-neon text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-6">
              Phá vỡ sự ngại ngùng
            </span>
            <h1 className="font-display font-bold text-[36px] sm:text-[52px] leading-[1.1] text-white mb-6">
              Phá <span className="underline decoration-magenta decoration-[10px] underline-offset-[4px]">khoảng cách</span>.
              Không phá <span className="underline decoration-neon decoration-[10px] underline-offset-[4px]">quy tắc</span>.
            </h1>
            <p className="text-white/70 text-[17px] leading-relaxed mb-8 max-w-[480px]">
              Sân trường số của Vinschool Grand Park — nơi bạn tìm đúng hội, đúng gu, đúng bạn.
              Không cần ngại, không cần giả vờ.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-7 py-3.5 rounded-md bg-neon text-ink font-display font-bold text-[16px] border-2 border-ink"
              >
                Vào sân trường →
              </button>
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="px-7 py-3.5 rounded-md bg-transparent text-white font-display font-semibold text-[16px] border-2 border-white/40"
              >
                Xem cách hoạt động
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/50 text-[13px] font-semibold uppercase tracking-wide">
              <span>
                <span className="text-neon font-display text-[16px] mr-1">1.240+</span>Học sinh
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>
                <span className="text-cyan font-display text-[16px] mr-1">45+</span>CLB & Nhóm
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>
                <span className="text-magenta font-display text-[16px] mr-1">120+</span>Sự kiện/năm
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <svg id="mascotJump" viewBox="0 0 320 360" className="w-[260px] sm:w-[340px] h-auto">
              <rect x="60" y="60" width="200" height="200" fill="#D4FF3F" transform="rotate(15 160 160)" opacity="0.95" />
              <rect x="60" y="60" width="200" height="200" fill="#FF2E93" transform="rotate(60 160 160)" opacity="0.85" />
              <ellipse cx="118" cy="312" rx="22" ry="13" fill="#2FF3E0" transform="rotate(-18 118 312)" />
              <ellipse cx="202" cy="312" rx="22" ry="13" fill="#2FF3E0" transform="rotate(18 202 312)" />
              <rect x="108" y="252" width="28" height="58" rx="14" fill="#151821" transform="rotate(-18 122 252)" />
              <rect x="184" y="252" width="28" height="58" rx="14" fill="#151821" transform="rotate(18 198 252)" />
              <rect x="68" y="168" width="28" height="72" rx="14" fill="#FF2E93" transform="rotate(-42 82 168)" />
              <rect x="224" y="168" width="28" height="72" rx="14" fill="#FF2E93" transform="rotate(42 238 168)" />
              <circle cx="58" cy="128" r="13" fill="#FFD9B0" />
              <circle cx="262" cy="128" r="13" fill="#FFD9B0" />
              <rect x="108" y="172" width="104" height="92" rx="30" fill="#FF2E93" />
              <rect x="108" y="208" width="104" height="14" fill="#D4FF3F" />
              <circle cx="160" cy="108" r="58" fill="#FFD9B0" />
              <path d="M104 92 Q 160 40 216 92 Q 210 60 160 55 Q 110 60 104 92 Z" fill="#151821" />
              <path d="M96 90 L 78 60 L 108 82 Z" fill="#D4FF3F" />
              <path d="M224 90 L 242 60 L 212 82 Z" fill="#2FF3E0" />
              <circle cx="140" cy="104" r="7" fill="#151821" />
              <circle cx="142" cy="101" r="2" fill="#ffffff" />
              <circle cx="180" cy="104" r="7" fill="#151821" />
              <circle cx="182" cy="101" r="2" fill="#ffffff" />
              <ellipse cx="126" cy="124" rx="10" ry="6" fill="#FF2E93" opacity="0.45" />
              <ellipse cx="194" cy="124" rx="10" ry="6" fill="#FF2E93" opacity="0.45" />
              <path d="M138 132 Q 160 148 182 132" stroke="#151821" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative py-24 px-6 sm:px-16 bg-cream overflow-hidden">
        <span className="manifesto-sticker hidden sm:block absolute left-[8%] top-[18%] -rotate-6 bg-white border-2 border-ink rounded-lg px-4 py-2 text-[13px] font-display font-bold text-ink">
          1.240+ học sinh
        </span>
        <span className="manifesto-sticker hidden sm:block absolute right-[10%] top-[10%] rotate-3 bg-neon border-2 border-ink rounded-lg px-4 py-2 text-[13px] font-display font-bold text-ink">
          45+ CLB & nhóm
        </span>
        <span className="manifesto-sticker hidden sm:block absolute right-[14%] bottom-[8%] -rotate-3 bg-magenta border-2 border-ink rounded-lg px-4 py-2 text-[13px] font-display font-bold text-white">
          0đ phí sử dụng
        </span>
        <p className="manifesto-statement relative max-w-[760px] mx-auto text-center font-display font-semibold text-[22px] sm:text-[32px] leading-[1.4] text-ink">
          Không phải app quản lý. Không phải mạng xã hội <span className="text-magenta">sến súc</span>. Đây là
          sân trường số — nơi bạn được là{' '}
          <span className="underline decoration-neon decoration-[8px] underline-offset-[2px]">chính mình</span>,
          đầy đủ màu sắc, không cần rập khuôn theo ai cả.
        </p>
      </section>

      {/* Marquee */}
      <section className="relative bg-ink py-10">
        <p className="text-center text-[12px] font-display font-semibold text-neon uppercase tracking-wider mb-6">
          Sở thích của cả sân trường
        </p>
        <div className="marquee-viewport">
          <div className="marquee-track">
            {[...interestTags, ...interestTags].map((tag, i) => (
              <span
                key={`${tag.label}-${i}`}
                aria-hidden={i >= interestTags.length}
                className={`tag-pill px-5 py-2.5 rounded-full border-2 text-[14px] font-semibold shrink-0 ${tag.color}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-20 sm:py-28 px-6 sm:px-16 bg-cream">
        <span className="flex items-center gap-1.5 justify-center text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-16">
          <span className="w-2 h-2 bg-magenta" />
          Cách hoạt động
        </span>
        <div className="flex flex-col sm:flex-row items-start justify-between max-w-[1100px] mx-auto gap-10 sm:gap-6">
          {steps.map((step) => (
            <div key={step.title} className={`step-card w-full sm:w-[300px] ${step.offset}`}>
              <div className={`w-14 h-14 rounded-full ${step.badge} border-2 border-ink flex items-center justify-center mb-5`}>
                <step.icon className={`w-6 h-6 ${step.iconColor}`} />
              </div>
              <p className="font-display font-bold text-[13px] text-magenta mb-2">{step.step}</p>
              <h3 className="font-display font-bold text-[20px] text-ink mb-2">{step.title}</h3>
              <p className="text-ink/60 text-[14px] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-section relative py-20 sm:py-28 px-6 sm:px-16 bg-ink overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(212,255,63,0.1) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="testimonial-card relative max-w-[560px] mx-auto rotate-[-2deg] bg-cream border-2 border-ink rounded-md p-10 shadow-[8px_8px_0px_0px_#FF2E93]">
          <div className="absolute -top-4 left-10 w-24 h-8 bg-neon/80 border border-ink rotate-[-4deg]" />
          <p className="font-display font-semibold text-[19px] sm:text-[22px] leading-relaxed text-ink mb-6">
            "Mình vốn rất ngại làm quen, nhưng nhờ tag CLB Nhạc mà quen được cả nhóm bạn mới toanh. Không ai hỏi
            điểm số, chỉ hỏi bạn thích nghe nhạc gì thôi."
          </p>
          <p className="text-[14px] font-semibold text-magenta">Minh Châu · Lớp 9A2</p>
        </div>
      </section>

      {/* Bento features */}
      <section className="relative py-20 sm:py-28 px-6 sm:px-16 bg-cream">
        <span className="flex items-center gap-1.5 justify-center text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-14">
          <span className="w-2 h-2 bg-cyan" />
          Mọi thứ trong một sân trường
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-2 gap-5 max-w-[1100px] mx-auto sm:h-[520px]">
          <div className="bento-item sm:row-span-2 sm:col-span-1 bg-ink rounded-lg border-2 border-ink p-8 flex flex-col justify-between gap-6">
            <div className="w-12 h-12 rounded-full bg-neon flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-ink" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[22px] text-white mb-2">Nhóm học tập</h3>
              <p className="text-white/60 text-[14px] leading-relaxed">
                Hỏi-đáp theo môn, lập nhóm ôn bài cùng bạn cùng lớp hay khác lớp.
              </p>
            </div>
          </div>
          <div className="bento-item sm:col-span-1 bg-magenta rounded-lg border-2 border-ink p-7 flex flex-col justify-between gap-6">
            <CalendarDays className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-display font-bold text-[18px] text-white mb-1">Sự kiện trường</h3>
              <p className="text-white/80 text-[13px]">Đăng ký/huỷ ngay từ bảng tin.</p>
            </div>
          </div>
          <div className="bento-item sm:col-span-1 bg-cyan rounded-lg border-2 border-ink p-7 flex flex-col justify-between gap-6">
            <MessageCircle className="w-6 h-6 text-ink" />
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink mb-1">Nhắn tin realtime</h3>
              <p className="text-ink/70 text-[13px]">Gửi cả thiệp mời sự kiện trong chat.</p>
            </div>
          </div>
          <div className="bento-item sm:col-span-2 bg-white border-2 border-ink rounded-lg p-7 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-neon border-2 border-ink flex items-center justify-center shrink-0">
              <Smile className="w-7 h-7 text-ink" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink mb-1">Avatar tự chọn, không ảnh thật</h3>
              <p className="text-ink/60 text-[13px]">An toàn, riêng tư, vẫn đầy cá tính.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section relative overflow-hidden bg-ink py-20 sm:py-24 px-6 sm:px-16">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,46,147,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative flex flex-col lg:flex-row items-center justify-between max-w-[1100px] mx-auto gap-10">
          <div className="max-w-[480px] text-center lg:text-left">
            <h2 className="final-cta-headline font-display font-bold text-[30px] sm:text-[40px] leading-tight text-white mb-6">
              Sẵn sàng phá băng chưa?
            </h2>
            <p className="final-cta-subtext text-white/70 text-[16px] mb-8">
              Tạo tài khoản bằng mã học sinh — mất chưa tới 1 phút.
            </p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="final-cta-button px-8 py-4 rounded-md bg-neon text-ink font-display font-bold text-[17px] border-2 border-white"
            >
              Tạo tài khoản ngay →
            </button>
          </div>
          <svg viewBox="0 0 320 360" className="w-[220px] sm:w-[280px] h-auto">
            <circle cx="160" cy="200" r="120" fill="#D4FF3F" opacity="0.12" />
            <ellipse cx="130" cy="312" rx="22" ry="13" fill="#2FF3E0" />
            <ellipse cx="190" cy="312" rx="22" ry="13" fill="#2FF3E0" />
            <rect x="118" y="255" width="28" height="58" rx="14" fill="#151821" />
            <rect x="174" y="255" width="28" height="58" rx="14" fill="#151821" />
            <rect x="70" y="190" width="26" height="66" rx="13" fill="#FF2E93" transform="rotate(-60 83 190)" />
            <rect x="214" y="212" width="26" height="58" rx="13" fill="#FF2E93" transform="rotate(12 227 212)" />
            <circle cx="70" cy="140" r="13" fill="#FFD9B0" />
            <circle cx="238" cy="258" r="13" fill="#FFD9B0" />
            <rect x="118" y="196" width="84" height="78" rx="26" fill="#FF2E93" />
            <rect x="118" y="226" width="84" height="12" fill="#D4FF3F" />
            <circle cx="160" cy="138" r="52" fill="#FFD9B0" />
            <path d="M112 124 Q 160 78 208 124 Q 202 96 160 92 Q 118 96 112 124 Z" fill="#151821" />
            <path d="M104 122 L 88 96 L 116 112 Z" fill="#2FF3E0" />
            <circle cx="142" cy="134" r="6" fill="#151821" />
            <circle cx="144" cy="131" r="1.6" fill="#ffffff" />
            <circle cx="178" cy="134" r="6" fill="#151821" />
            <circle cx="180" cy="131" r="1.6" fill="#ffffff" />
            <ellipse cx="128" cy="152" rx="9" ry="5" fill="#FF2E93" opacity="0.45" />
            <ellipse cx="192" cy="152" rx="9" ry="5" fill="#FF2E93" opacity="0.45" />
            <path d="M140 160 Q 160 174 180 160" stroke="#151821" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="relative flex flex-col sm:flex-row items-center justify-between max-w-[1100px] mx-auto mt-16 sm:mt-24 pt-8 border-t border-white/15 text-white/50 text-[13px] gap-3">
          <span>© 2026 Kết Nối Học Đường — Vinschool Grand Park</span>
          <div className="flex items-center gap-6">
            <span>Về chúng tôi</span>
            <span>Điều khoản</span>
            <span>Liên hệ</span>
          </div>
        </div>
      </section>
    </div>
  )
}
