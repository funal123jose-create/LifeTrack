import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, type LucideIcon } from "lucide-react"

type Metric = {
  label: string
  value: string
  detail: string
  progress?: number
  icon: LucideIcon
}

type Tone = "health" | "career" | "care"

const tones = {
  health: {
    shell: "border-emerald-300/20 bg-[#061b20]",
    overlay: "from-[#05181e] via-[#05232a]/85 to-[#051018]/45",
    eyebrow: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    metric: "border-emerald-300/20 bg-[#06191b]/80",
    icon: "border-emerald-300/25 bg-emerald-400/10 text-emerald-300",
    stroke: "#34e6a4",
  },
  career: {
    shell: "border-orange-300/20 bg-[#1c1513]",
    overlay: "from-[#19110f] via-[#1b1514]/80 to-[#111622]/50",
    eyebrow: "border-orange-300/30 bg-orange-400/10 text-orange-200",
    metric: "border-orange-300/20 bg-[#211712]/80",
    icon: "border-orange-300/25 bg-orange-400/10 text-orange-300",
    stroke: "#fb923c",
  },
  care: {
    shell: "border-violet-300/25 bg-[#160e2a]",
    overlay: "from-[#130e28] via-[#1b1239]/80 to-[#0c1226]/40",
    eyebrow: "border-violet-300/30 bg-violet-400/10 text-violet-200",
    metric: "border-violet-300/20 bg-[#21153d]/80",
    icon: "border-violet-300/25 bg-violet-400/10 text-violet-300",
    stroke: "#b46cff",
  },
} as const

function MetricRing({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = 25
  const circumference = 2 * Math.PI * radius
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-12 w-12 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="7" />
      <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - clamped / 100)} />
    </svg>
  )
}

export function PillarHero({
  tone,
  eyebrow,
  title,
  description,
  image,
  metrics,
}: {
  tone: Tone
  eyebrow: string
  title: string
  description: string
  image: string
  metrics: Metric[]
}) {
  const styles = tones[tone]

  return (
    <section className={`relative isolate overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${styles.shell}`}>
      <Image src="/images/lifetrack/night-mountains.webp" alt="" fill priority sizes="(min-width: 1600px) 1500px, 100vw" className="object-cover object-center opacity-40" />
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.overlay}`} />
      <div className="relative grid min-w-0 gap-5 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:gap-8">
        <div className="relative z-10 flex min-w-0 flex-col items-start">
          <Link href="/pilares" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-3 text-xs font-bold text-slate-200 transition hover:border-white/35 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowLeft size={15} /> Volver a Pilares</Link>
          <span className={`mt-5 inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${styles.eyebrow}`}>{eyebrow}</span>
          <h1 className="mt-3 max-w-[620px] text-balance text-4xl font-extrabold leading-[1.02] text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-[590px] text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
        </div>
        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-2.5 self-end sm:grid-cols-2 sm:gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 backdrop-blur-md sm:p-4 ${styles.metric}`}>
                {metric.progress === undefined ? <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${styles.icon}`}><Icon size={21} /></span> : <MetricRing value={metric.progress} color={styles.stroke} />}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-4 text-slate-300">{metric.label}</p>
                  <p className="mt-1 text-xl font-extrabold leading-none text-white sm:text-2xl">{metric.value}</p>
                  <p className="mt-1 truncate text-[10px] text-slate-400" title={metric.detail}>{metric.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-[27%] hidden h-[80%] w-[40%] lg:block xl:left-[32%] xl:w-[28%]">
        <Image src={image} alt="" fill sizes="(min-width: 1280px) 30vw, 40vw" className="object-contain object-bottom opacity-40 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
      </div>
    </section>
  )
}
