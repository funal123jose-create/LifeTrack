import { Droplet } from "lucide-react"

import { formatLocalDateTime } from "@/lib/health-page-helpers"
import type { BodyProgressLog, MealLog, WaterLog } from "@/lib/health-page-models"
import { getConfidenceClass, getConfidenceLabel, getMealTypeLabel } from "@/lib/nutrition"

type MealLogCardProps = {
  meal: MealLog
}

export function MealLogCard({ meal }: MealLogCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-300">
          {meal.meal_description}
        </p>
        <span className="shrink-0 rounded-lg bg-orange-500/[0.08] px-2 py-1 text-[10px] font-extrabold text-orange-300">
          {Math.round(meal.estimated_calories)} kcal
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-300/10 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.10em] text-emerald-300/80">
            {getMealTypeLabel(meal.meal_type)}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.10em] ${getConfidenceClass(meal.confidence)}`}>
            {getConfidenceLabel(meal.confidence)}
          </span>
          <span>{meal.source === "audio" ? "Audio" : "Texto"}</span>
        </div>
        <span>{formatLocalDateTime(meal.created_at)}</span>
      </div>
      {meal.portion_assumption && (
        <p className="mt-2 line-clamp-2 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-[10px] font-medium leading-relaxed text-slate-500">
          Porción asumida: {meal.portion_assumption}
        </p>
      )}
    </div>
  )
}

type WaterLogCardProps = {
  water: WaterLog
}

export function WaterLogCard({ water }: WaterLogCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.055] bg-black/20 p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-300/15 bg-blue-500/[0.055] text-blue-300">
          <Droplet size={14} />
        </div>
        <div>
          <p className="text-xs font-extrabold text-slate-200">
            +{water.amount_liters}L
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
            Manual
          </p>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500">
        {formatLocalDateTime(water.created_at)}
      </span>
    </div>
  )
}

type BodyProgressLogCardProps = {
  log: BodyProgressLog
}

export function BodyProgressLogCard({ log }: BodyProgressLogCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-white">
            {log.weight_kg !== null ? `${log.weight_kg} kg` : "Peso no registrado"}
          </p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
            {new Date(log.date).toLocaleDateString("es-PE")}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-emerald-500/[0.08] px-2 py-1 text-[10px] font-extrabold text-emerald-300">
          {log.energy_level !== null ? `${log.energy_level}/10 energía` : "Sin energía"}
        </span>
      </div>
      {log.notes && (
        <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-400">
          {log.notes}
        </p>
      )}
    </div>
  )
}
