"use client"

import { CalendarDays } from "lucide-react"

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  required?: boolean
}

export function CareerDateField({ id, label, value, onChange, min, required }: Props) {
  return <label htmlFor={id} className="block min-w-0 space-y-2 text-[10px] font-semibold text-slate-300">
    <span>{label}</span>
    <span className="flex h-10 items-center gap-2 rounded-md border border-orange-300/25 bg-[#081824] px-3 transition-colors focus-within:border-orange-300/70 focus-within:ring-2 focus-within:ring-orange-400/15 hover:border-orange-300/50">
      <CalendarDays size={15} className="shrink-0 text-orange-300" aria-hidden="true" />
      <input id={id} type="date" value={value} min={min} required={required} onChange={(event) => onChange(event.target.value)} className="career-date-input min-w-0 w-full bg-transparent text-xs text-white outline-none [color-scheme:dark]" />
    </span>
  </label>
}
