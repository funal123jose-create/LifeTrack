"use client"

import { useState } from "react"
import { Popover } from "radix-ui"
import { CalendarDays, ChevronDown } from "lucide-react"
import { PillarDateField } from "@/components/pillars/pillar-date-field"
import { PillarFilter } from "@/components/pillars/pillar-filter"
import { careerPeriodBounds, type CareerPeriod } from "@/lib/career-period"

export function CareerSelect({ value, onChange, label, children, fullWidth = false }: { value: string; onChange: (value: string) => void; label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return <PillarFilter label={label} value={value} onChange={onChange} tone="career" fullWidth={fullWidth}>{children}</PillarFilter>
}

export function CareerPeriodFilter({ value, onChange }: { value: CareerPeriod; onChange: (period: CareerPeriod) => void }) {
  const [open, setOpen] = useState(false)
  const today = new Date().toLocaleDateString("en-CA")
  const [anchor, setAnchor] = useState(today)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const bounds = careerPeriodBounds(value)
  const label = value.kind === "all" ? "Todo el historial" : value.kind === "day" ? `Día · ${bounds?.start}` : value.kind === "week" ? `Semana · ${bounds?.start}` : value.kind === "month" ? `Mes · ${bounds?.start.slice(0, 7)}` : `${bounds?.start} a ${bounds?.end}`
  const choose = (period: CareerPeriod) => { onChange(period); setOpen(false) }
  return <Popover.Root open={open} onOpenChange={setOpen}><Popover.Trigger asChild><button type="button" aria-label="Filtrar resumen por periodo" className="career-filter inline-flex min-h-8 items-center gap-2 rounded-md border border-orange-300/35 bg-[#0a2230] px-3 text-[10px] font-semibold text-orange-100 transition-all hover:border-orange-300/70 hover:bg-[#143140] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 data-[state=open]:border-orange-300"><CalendarDays size={14} className="text-orange-300" />{label}<ChevronDown size={12} className="text-orange-300" /></button></Popover.Trigger>
    <Popover.Portal><Popover.Content side="bottom" align="end" sideOffset={7} className="career-dropdown z-[100] w-[min(320px,calc(100vw-24px))] rounded-lg border border-orange-300/35 bg-[#0a2030] p-3 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,.55),0_0_25px_rgba(249,115,22,.12)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2">
      <p className="mb-2 text-[10px] font-bold uppercase text-orange-200">Periodo del resumen</p>
      <div className="grid grid-cols-2 gap-1.5">{[{ label: "Todo el historial", period: { kind: "all" } as CareerPeriod }, { label: "Hoy", period: { kind: "day", anchor: today } as CareerPeriod }, { label: "Esta semana", period: { kind: "week", anchor: today } as CareerPeriod }, { label: "Este mes", period: { kind: "month", anchor: today } as CareerPeriod }].map(({ label: text, period }) => <button key={text} type="button" onClick={() => choose(period)} className={`rounded-md border px-2 py-2 text-left text-[11px] transition-colors hover:border-orange-300/55 hover:bg-orange-400/15 ${value.kind === period.kind && (period.kind === "all" || ("anchor" in value && value.anchor === today)) ? "border-orange-300/65 bg-orange-400/15 text-orange-100" : "border-white/10 text-slate-300"}`}>{text}</button>)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3"><PillarDateField id="career-period-anchor" label="Día específico" value={anchor} onChange={setAnchor} /><div className="flex items-end gap-1"><button type="button" onClick={() => choose({ kind: "day", anchor })} className="career-period-action">Día</button><button type="button" onClick={() => choose({ kind: "week", anchor })} className="career-period-action">Semana</button></div><label className="text-[10px] text-slate-400">Mes específico<input aria-label="Mes específico" type="month" value={anchor.slice(0, 7)} onChange={(event) => setAnchor(`${event.target.value}-01`)} className="career-date-input mt-1 w-full rounded-md border border-orange-300/25 bg-[#081824] p-1.5 text-[11px] text-white outline-none focus:border-orange-300" /></label><button type="button" onClick={() => choose({ kind: "month", anchor })} className="career-period-action self-end">Ver mes</button></div>
      <div className="mt-3 border-t border-white/10 pt-3"><p className="mb-1 text-[10px] text-slate-400">Rango personalizado</p><div className="flex items-center gap-1"><PillarDateField id="career-period-start" label="Desde" value={start} onChange={setStart} /><PillarDateField id="career-period-end" label="Hasta" value={end} onChange={setEnd} /></div><button type="button" onClick={() => choose({ kind: "range", start, end })} className="career-period-action mt-2 w-full">Aplicar rango</button></div>
      <p className="mt-3 text-[10px] leading-4 text-slate-400">El periodo usa fechas de registro, cierre o actualización. No reconstruye estados históricos.</p>
    </Popover.Content></Popover.Portal>
  </Popover.Root>
}
