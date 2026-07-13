import type { LucideIcon } from "lucide-react"

type CheckinMetricCardProps = {
  label: string
  value: number
  helper: string
  Icon: LucideIcon
  accent: string
  sliderClassName: string
  onChange: (value: number) => void
}

export function CheckinMetricCard({
  label,
  value,
  helper,
  Icon,
  accent,
  sliderClassName,
  onChange,
}: CheckinMetricCardProps) {
  return (
    <div className="flex min-h-[108px] min-w-0 flex-col justify-between rounded-[1.4rem] border border-white/[0.065] bg-slate-950/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] ${accent}`}>
            <Icon size={16} />
          </span>
          <div>
            <p className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p className="text-xs font-medium text-slate-600">{helper}</p>
          </div>
        </div>
        <p className={`text-2xl font-extrabold ${accent}`}>{value}/10</p>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={sliderClassName}
      />
    </div>
  )
}

type WeeklySummaryMetricCardProps = {
  label: string
  value: string
  helper: string
  Icon: LucideIcon
}

export function WeeklySummaryMetricCard({ label, value, helper, Icon }: WeeklySummaryMetricCardProps) {
  return (
    <div className="flex min-h-[108px] min-w-0 flex-col justify-between rounded-[1.35rem] border border-white/[0.065] bg-slate-950/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="mb-3 flex items-center justify-between">
        <Icon size={16} className="text-cyan-300" />
        <span className="rounded-full border border-white/[0.05] bg-white/[0.04] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500">
          semana
        </span>
      </div>
      <p className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 break-words text-xs font-medium text-slate-600">{helper}</p>
    </div>
  )
}
