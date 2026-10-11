"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CircleCheck, Lightbulb, Loader2, RefreshCcw, Sparkles } from "lucide-react"
import { HEALTH_AI_REFERENCES, type HealthAiText } from "@/lib/health-ai-reading"
import type { HealthInsight } from "@/lib/health-insights"

type Result = { reading: HealthAiText; generatedAt: string; revision: number }

export function HealthAiReading({ fallback, revision }: { fallback: HealthInsight; revision: number }) {
  const [available, setAvailable] = useState<boolean | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/health-insight", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : { enabled: false })
      .then((data: { enabled?: boolean }) => setAvailable(data.enabled === true))
      .catch(() => { if (!controller.signal.aborted) setAvailable(false) })
    return () => controller.abort()
  }, [])

  const generate = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/health-insight", { method: "POST", cache: "no-store" })
      const data: { error?: string; reading?: HealthAiText; generatedAt?: string } = await response.json()
      if (!response.ok || !data.reading || !data.generatedAt) throw new Error(data.error || "No se pudo generar la lectura.")
      setResult({ reading: data.reading, generatedAt: data.generatedAt, revision })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo generar la lectura.")
    } finally {
      setLoading(false)
    }
  }

  const current = result?.revision === revision ? result : null
  const reading = current?.reading
  const sections = [
    { label: "Avance", text: reading?.avance || fallback.positive, icon: CircleCheck, color: "text-emerald-300", body: "text-emerald-100" },
    { label: "Atención", text: reading?.atencion || fallback.attention, icon: AlertCircle, color: "text-cyan-300", body: "text-slate-200" },
    { label: "Próximo paso", text: reading?.recomendacion || fallback.action, icon: Lightbulb, color: "text-amber-300", body: "text-slate-300" },
  ]

  return <>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-300/15 pb-3">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-white sm:text-[15px]"><Sparkles size={17} className="shrink-0 text-emerald-300" aria-hidden="true" />Lectura de salud</h2>
      {available && <button type="button" onClick={generate} disabled={loading} className="health-pressable inline-flex items-center gap-1.5 rounded-md border border-emerald-300/35 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-100 hover:border-emerald-300/60 hover:bg-emerald-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:opacity-50">{loading ? <Loader2 size={12} className="motion-safe:animate-spin" /> : current ? <RefreshCcw size={12} /> : <Sparkles size={12} />}{loading ? "Analizando..." : current ? "Actualizar" : "Generar con Gemini"}</button>}
    </div>
    <div className="flex flex-1 flex-col justify-between gap-3">
      <div className="grid grid-cols-3 divide-x divide-emerald-300/15 border-b border-emerald-300/15 pb-3">
        {fallback.signals.map((signal) => <div key={signal.label} className="min-w-0 px-2 first:pl-0 last:pr-0" title={signal.detail}><span className="block text-[10px] leading-3 text-slate-400">{signal.label}</span><strong className="mt-1 block text-base leading-5 text-white">{signal.value}</strong><span className="block text-[10px] leading-3 text-slate-400">{signal.detail}</span></div>)}
      </div>
      <div className="space-y-2 text-[11px] leading-[1.45]" aria-live="polite">
        {sections.map(({ label, text, icon: Icon, color, body }) => <p key={label} className={`flex gap-2 border-l-2 border-emerald-300/20 py-0.5 pl-2.5 ${body}`}><Icon size={14} className={`mt-0.5 shrink-0 ${color}`} /><span><strong className={color}>{label} · </strong>{text}</span></p>)}
      </div>
      <div className="border-t border-emerald-300/15 pt-2.5 text-[10px] leading-4 text-slate-400">
        {reading ? <><p>{reading.limite}</p><p className="mt-1">Gemini · {new Date(current!.generatedAt).toLocaleString("es-CO")} · orientación general, no consulta profesional.</p><p className="mt-1">Referencias generales: {HEALTH_AI_REFERENCES.map((source, index) => <span key={source.url}>{index > 0 ? " · " : ""}<a href={source.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline hover:text-white">{source.title}</a></span>)}</p></> : <><p>Base: {fallback.basis}</p><p className="mt-1">{available === false ? "Gemini pendiente de habilitar." : available ? "Al generar, se envía a Google un resumen de tus registros de salud." : "Comprobando disponibilidad de Gemini..."}</p></>}
        {error && <p role="alert" className="mt-1 text-orange-300">{error}</p>}
      </div>
    </div>
  </>
}
