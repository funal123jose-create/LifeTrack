"use client"

import type { ReactNode } from "react"
import { AudioWaveform, Droplet, Flame, Loader2, Mic, Minus, Plus, Save, Target } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { HealthWaterGlass } from "./health-water-glass"

export function HealthMealAudioAction({ recording, busy, onRecord }: { recording: boolean; busy: boolean; onRecord: () => void }) {
  return <div className="hf-audio-row"><button type="button" aria-label={recording ? "Detener grabación de comida" : "Grabar descripción de comida"} aria-pressed={recording} disabled={busy} onClick={onRecord} className="hf-secondary hf-audio-button">
    {recording ? <AudioWaveform size={17} /> : <Mic size={17} />}{recording ? "Detener grabación" : "Dictar comida"}
  </button><span role="status" aria-live="polite">{recording ? "Grabando descripción..." : busy ? "Procesando tu comida..." : "Texto o voz"}</span></div>
}

export function HealthFormMeter({ percent, tone = "health" }: { percent: number; tone?: "health" | "water" | "energy" }) {
  const reduced = useReducedMotion()
  return <div className="hf-meter" data-tone={tone} role="meter" aria-label="Cumplimiento registrado" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.max(0, percent))}>
    <motion.span initial={false} animate={{ scaleX: Math.min(100, Math.max(0, percent)) / 100 }} transition={{ duration: reduced ? 0 : .22, ease: "easeOut" }} />
  </div>
}

export function HealthEnergySummary({ calories, target, percent, onAdjust }: { calories: number; target: number; percent: number; onAdjust: (amount: number) => void }) {
  return <section className="hf-energy" aria-label="Presupuesto energético de hoy">
    <h3><Flame size={18} /> Presupuesto energético de hoy</h3>
    <div className="hf-reading"><strong>{calories.toLocaleString("es-CO")} <small>kcal</small></strong><span>de {target.toLocaleString("es-CO")} kcal · {percent}%</span></div>
    <HealthFormMeter percent={percent} tone="energy" />
    <div className="hf-action-row"><button type="button" className="hf-secondary" onClick={() => onAdjust(100)}><Plus size={16} />100 kcal</button><button type="button" className="hf-icon-button" aria-label="Restar 100 kcal" title="Restar 100 kcal" onClick={() => onAdjust(-100)}><Minus size={16} /></button></div>
    {calories > target && <p className="hf-notice">Límite calórico excedido.</p>}
  </section>
}

export function HealthHydrationWorkspace({ liters, goal, percent, goalInput, saving, error, logs, count, onInput, onSave, onAdd, onRemove }: {
  liters: number; goal: number; percent: number; goalInput: string; saving: boolean; error: string; logs: ReactNode; count: number
  onInput: (value: string) => void; onSave: () => void; onAdd: () => void; onRemove: () => void
}) {
  return <div className="hf-hydration-workspace">
    <section className="hf-water-intake">
      <h3><Droplet size={18} /> Tu hidratación de hoy</h3>
      <div className="hf-water-reading"><HealthWaterGlass percent={percent} large /><div className="hf-reading"><strong>{liters.toLocaleString("es-CO", { maximumFractionDigits: 2 })} <small>L</small></strong><span>de {goal.toFixed(2)} L registrados como meta</span></div></div>
      <div className="hf-meter-caption"><span>Progreso diario</span><strong>{percent}%</strong></div><HealthFormMeter percent={percent} tone="water" />
      <div className="hf-action-row"><button type="button" className="hf-primary" onClick={onAdd}><Plus size={17} />Registrar 250 ml</button><button type="button" className="hf-icon-button" aria-label="Restar 250 ml" title="Restar 250 ml" onClick={onRemove}><Minus size={17} /></button></div>
    </section>
    <aside className="hf-water-context">
      <section className="hf-water-goal"><h3><Target size={18} /> Meta diaria</h3>
        <label htmlFor="water-goal">Cantidad de agua</label><div className="hf-unit-field"><input id="water-goal" type="number" inputMode="decimal" min="0.25" max="10" step="0.25" value={goalInput} onChange={(event) => onInput(event.target.value)} aria-describedby={error ? "water-goal-error" : undefined} aria-invalid={!!error} /><span>litros / día</span></div>
        <button type="button" className="hf-primary" onClick={onSave} disabled={saving} aria-busy={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{saving ? "Guardando..." : "Guardar meta"}</button>
        {error && <p id="water-goal-error" role="alert" className="hf-notice">{error}</p>}
      </section>
      <section className="hf-water-log"><h3>Registros de hoy <span>{count}</span></h3><div>{count ? logs : <p className="hf-empty">Aún no hay eventos de agua registrados hoy.</p>}</div></section>
    </aside>
  </div>
}
