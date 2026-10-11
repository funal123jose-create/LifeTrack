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
    <div className="flex min-h-[108px] min-w-0 flex-col justify-between border-b border-violet-300/15 px-2 py-3 transition-colors hover:bg-violet-400/5">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`pillar-heading-icon shrink-0 ${accent}`}>
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="break-words text-[11px] font-semibold text-slate-200">{label}</p>
            <p className="text-[10px] text-slate-400">{helper}</p>
          </div>
        </div>
        <p className={`shrink-0 whitespace-nowrap text-xl font-bold ${accent}`}>{value}/10</p>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={sliderClassName}
        aria-label={label}
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
    <div className="flex min-h-[95px] min-w-0 flex-col justify-between border-b border-violet-300/15 px-2 py-2.5 transition-colors hover:bg-violet-400/5">
      <div className="mb-1 flex items-center gap-2 text-violet-300"><Icon size={15} /><p className="text-[10px] font-semibold text-slate-300">{label}</p></div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-400">{helper}</p>
    </div>
  )
}
