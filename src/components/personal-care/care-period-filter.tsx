"use client"

import { useState } from "react"
import { Popover } from "radix-ui"
import { CalendarDays, ChevronDown } from "lucide-react"
import { carePeriodBounds, type CarePeriod } from "@/lib/personal-care-analytics"

export function CarePeriodFilter({ value, onChange, today }: { value: CarePeriod; onChange: (period: CarePeriod) => void; today: string }) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState(today)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const bounds = carePeriodBounds(value)
  const label = value.kind === "today" ? "Hoy" : value.kind === "week" ? "Esta semana" : value.kind === "month" ? "Este mes" : value.kind === "year" ? "Este año" : `${bounds.start} a ${bounds.end}`
  const choose = (period: CarePeriod) => { onChange(period); setOpen(false) }
  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger asChild><button type="button" aria-label="Filtrar Cuidado Personal por periodo" className="care-filter inline-flex min-h-9 items-center gap-2 rounded-md border border-violet-300/35 bg-[#121d36] px-3 text-xs font-semibold text-violet-100 transition-all hover:border-violet-300/70 hover:bg-[#20244b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 data-[state=open]:border-violet-300/75"><CalendarDays size={15} className="text-violet-300" />{label}<ChevronDown size={13} className="text-violet-300" /></button></Popover.Trigger>
    <Popover.Portal><Popover.Content side="bottom" align="end" sideOffset={7} className="care-dropdown z-[100] w-[min(330px,calc(100vw-24px))] rounded-lg border border-violet-300/35 bg-[#111a33] p-3 text-slate-100 shadow-[0_22px_55px_rgba(0,0,0,.58),0_0_24px_rgba(168,85,247,.14)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2">
      <p className="mb-2 text-[10px] font-bold uppercase text-violet-200">Periodo de análisis</p>
      <div className="grid grid-cols-2 gap-1.5">{([{ kind: "today", label: "Hoy" }, { kind: "week", label: "Esta semana" }, { kind: "month", label: "Este mes" }, { kind: "year", label: "Este año" }] as const).map((item) => <button key={item.kind} type="button" onClick={() => choose({ kind: item.kind, anchor: today })} className={`rounded-md border px-2 py-2 text-left text-[11px] transition-colors hover:border-violet-300/55 hover:bg-violet-400/15 ${value.kind === item.kind && value.anchor === today ? "border-violet-300/65 bg-violet-400/15 text-violet-100" : "border-white/10 text-slate-300"}`}>{item.label}</button>)}</div>
      <div className="mt-3 border-t border-white/10 pt-3"><label className="text-[10px] text-slate-400">Fecha de referencia<input aria-label="Fecha de referencia" type="date" value={anchor} onChange={(event) => setAnchor(event.target.value)} className="care-date-input mt-1 w-full rounded-md border border-violet-300/25 bg-[#0a1529] p-2 text-xs text-white outline-none focus:border-violet-300" /></label><div className="mt-2 grid grid-cols-4 gap-1">{([{ kind: "today", label: "Día" }, { kind: "week", label: "Semana" }, { kind: "month", label: "Mes" }, { kind: "year", label: "Año" }] as const).map((item) => <button key={item.kind} type="button" onClick={() => choose({ kind: item.kind, anchor })} className="care-filter-action">{item.label}</button>)}</div></div>
      <div className="mt-3 border-t border-white/10 pt-3"><p className="mb-1 text-[10px] text-slate-400">Rango personalizado</p><div className="flex gap-1"><input aria-label="Desde" type="date" value={start} onChange={(event) => setStart(event.target.value)} className="care-date-input min-w-0 flex-1 rounded-md border border-violet-300/25 bg-[#0a1529] p-1.5 text-[10px] text-white outline-none focus:border-violet-300" /><input aria-label="Hasta" type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="care-date-input min-w-0 flex-1 rounded-md border border-violet-300/25 bg-[#0a1529] p-1.5 text-[10px] text-white outline-none focus:border-violet-300" /></div><button type="button" onClick={() => choose({ kind: "range", start, end })} className="care-filter-action mt-2 w-full">Aplicar rango</button></div>
    </Popover.Content></Popover.Portal>
  </Popover.Root>
}
