type MetricGridItem = {
  label: string
  value: string | number
  detail: string
}

type MetricGridProps = {
  metrics: MetricGridItem[]
  className?: string
}

export function MetricGrid({ metrics, className = "" }: MetricGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${className}`}>
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-white/[0.06] bg-black/24 p-3">
          <p className="break-words text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-100">{metric.value}</p>
          <p className="mt-1 text-[9px] font-medium text-slate-600">{metric.detail}</p>
        </div>
      ))}
    </div>
  )
}
