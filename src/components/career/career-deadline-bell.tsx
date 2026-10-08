"use client"

import { useState } from "react"
import { Popover } from "radix-ui"
import { Bell, CalendarClock, Pause, X } from "lucide-react"
import type { DeadlineAlert } from "@/lib/career-deadlines"
import { formatProjectDate, limaToday } from "@/lib/career-deadlines"
import { CareerDateField } from "@/components/career/career-date-field"

type Props = {
  alerts: DeadlineAlert[]
  onPostpone: (id: string, date: string) => Promise<boolean>
  onPause: (id: string) => Promise<boolean>
}

export function CareerDeadlineBell({ alerts, onPostpone, onPause }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [date, setDate] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function postpone(id: string) {
    setBusy(id)
    setError("")
    const success = await onPostpone(id, date)
    setBusy(null)
    if (success) { setEditing(null); setDate("") } else setError("No se pudo aplazar el proyecto. Revisa la fecha e inténtalo de nuevo.")
  }

  async function pause(id: string) {
    setBusy(id)
    setError("")
    const success = await onPause(id)
    setBusy(null)
    if (success) setConfirming(null)
    else setError("No se pudo pausar el proyecto. Inténtalo de nuevo.")
  }

  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger asChild><button type="button" title="Vencimientos de proyectos" aria-label={`Vencimientos de proyectos: ${alerts.length} requieren atención`} className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-orange-300/30 bg-[#0a2230]/90 text-orange-300 transition-all hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 motion-reduce:transform-none">
      <Bell size={17} aria-hidden="true" />
      {alerts.length > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-orange-500 px-1 text-center text-[10px] font-bold leading-5 text-[#081824]">{alerts.length}</span>}
    </button></Popover.Trigger>
    <Popover.Portal><Popover.Content sideOffset={8} align="end" aria-label="Alertas de vencimiento" className="z-[90] w-[min(92vw,380px)] rounded-lg border border-orange-300/30 bg-[#081b29] p-3 text-slate-100 shadow-[0_24px_55px_rgba(0,0,0,.55)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out motion-reduce:animate-none">
        <div className="mb-2 flex items-center justify-between border-b border-orange-300/15 pb-2"><div><h2 className="text-sm font-bold">Vencimientos</h2><p className="text-[10px] text-slate-400">{alerts.length} proyectos requieren atención</p></div><Popover.Close asChild><button type="button" aria-label="Cerrar alertas" className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X size={16} /></button></Popover.Close></div>
        {error && <p role="alert" className="mb-2 text-xs text-rose-300">{error}</p>}
        <div className="max-h-[min(60vh,420px)] space-y-2 overflow-y-auto overscroll-contain">
          {alerts.length === 0 && <p className="py-7 text-center text-xs text-slate-400">No hay proyectos por vencer o vencidos.</p>}
          {alerts.map(({ project, kind, days }) => <div key={project.id} className="rounded-md border border-orange-300/15 bg-[#0d2938] p-3">
            <div className="flex items-start justify-between gap-2"><strong className="min-w-0 text-xs text-white">{project.title}</strong><span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${kind === "overdue" ? "bg-rose-500/15 text-rose-300" : "bg-orange-500/15 text-orange-300"}`}>{kind === "overdue" ? "Vencido" : "Vence mañana"}</span></div>
            <p className="mt-1 text-[10px] text-slate-300">{project.status} · Límite: {formatProjectDate(project.end_date!)}{kind === "overdue" ? ` · ${Math.abs(days)} día(s) de retraso` : ""}</p>
            <p className="mt-1 text-[10px] text-slate-400">El proyecto sigue pendiente. Aplaza el plazo o ponlo en pausa para reorganizarlo.</p>
            {editing === project.id ? <div className="mt-3 space-y-2"><CareerDateField id={`postpone-${project.id}`} label="Nueva fecha límite" value={date} min={limaToday()} onChange={setDate} required /><div className="flex gap-2"><button type="button" disabled={!date || busy !== null} onClick={() => postpone(project.id)} className="rounded bg-orange-500/25 px-2 py-1.5 text-[10px] text-orange-100 hover:bg-orange-500/40 disabled:opacity-40">Guardar plazo</button><button type="button" onClick={() => setEditing(null)} className="px-2 text-[10px] text-slate-400 hover:text-white">Cancelar</button></div></div> : confirming === project.id ? <div className="mt-3 space-y-2"><p className="text-[10px] text-slate-300">Al pausar, se quitarán las fechas activas. El avance se conservará.</p><div className="flex gap-2"><button type="button" disabled={busy !== null} onClick={() => pause(project.id)} className="rounded bg-orange-500/25 px-2 py-1.5 text-[10px] text-orange-100 hover:bg-orange-500/40 disabled:opacity-40">Confirmar pausa</button><button type="button" onClick={() => setConfirming(null)} className="px-2 text-[10px] text-slate-400 hover:text-white">Cancelar</button></div></div> : <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { setEditing(project.id); setDate("") }} className="inline-flex items-center gap-1 rounded border border-orange-300/25 px-2 py-1.5 text-[10px] text-orange-200 hover:bg-orange-500/15"><CalendarClock size={12} /> Aplazar</button><button type="button" disabled={busy !== null} onClick={() => setConfirming(project.id)} className="inline-flex items-center gap-1 rounded border border-slate-400/25 px-2 py-1.5 text-[10px] text-slate-200 hover:bg-white/10 disabled:opacity-40"><Pause size={12} /> Pausar</button></div>}
          </div>)}
        </div>
      </Popover.Content></Popover.Portal>
  </Popover.Root>
}
