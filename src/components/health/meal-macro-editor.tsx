"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { sanitizeNutritionResponse, type NutritionFood } from "@/lib/nutrition"
import type { NutritionHistory } from "@/lib/health-analytics"

type Meal = NutritionHistory["meals"][number]
type MacroValue = "protein_g" | "carbs_g" | "fat_g"

function storedFoods(value: unknown): NutritionFood[] {
  if (!Array.isArray(value)) return []
  return value.filter((food): food is NutritionFood => typeof food === "object" && food !== null && typeof food.name === "string" && typeof food.portion === "string")
}

export function MealMacroEditor({ meal, onSave }: { meal: Meal; onSave: (input: { protein_g: number | null; carbs_g: number | null; fat_g: number | null; portion_assumption: string; foods: NutritionFood[] }) => Promise<boolean> }) {
  const [values, setValues] = useState<Record<MacroValue, string>>({
    protein_g: meal.protein_g == null ? "" : String(meal.protein_g),
    carbs_g: meal.carbs_g == null ? "" : String(meal.carbs_g),
    fat_g: meal.fat_g == null ? "" : String(meal.fat_g),
  })
  const [portion, setPortion] = useState(meal.portion_assumption || "")
  const [foods, setFoods] = useState<NutritionFood[]>(() => storedFoods(meal.food_breakdown))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const estimate = async () => {
    setLoading(true)
    setError("")
    setSaved(false)
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Analiza solo esta comida: ${meal.meal_description}. Porción registrada: ${meal.portion_assumption || "sin cantidad explícita"}. Devuelve una sola comida con desglose por alimento.` }),
      })
      if (!response.ok) throw new Error("No se pudo estimar la composición.")
      const result = sanitizeNutritionResponse(await response.json())
      const estimate = result.meals[0]
      if (!estimate) throw new Error("La descripción no permitió identificar alimentos suficientes.")
      setValues({ protein_g: estimate.protein_g == null ? "" : String(estimate.protein_g), carbs_g: estimate.carbs_g == null ? "" : String(estimate.carbs_g), fat_g: estimate.fat_g == null ? "" : String(estimate.fat_g) })
      setPortion(estimate.portion_assumption || "")
      setFoods(estimate.foods || [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo estimar la composición.")
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    const parse = (value: string) => value.trim() === "" ? null : Number(value)
    const protein_g = parse(values.protein_g)
    const carbs_g = parse(values.carbs_g)
    const fat_g = parse(values.fat_g)
    if ([protein_g, carbs_g, fat_g].some((value) => value !== null && (!Number.isFinite(value) || value < 0 || value > 1000))) {
      setError("Los macros deben ser valores entre 0 y 1000 g, o quedar vacíos si se desconocen.")
      return
    }
    setSaving(true)
    setError("")
    const okay = await onSave({ protein_g, carbs_g, fat_g, portion_assumption: portion.trim(), foods })
    setSaving(false)
    if (okay) setSaved(true)
    else setError("No se pudo guardar la revisión.")
  }

  return <div className="hf-macro-editor space-y-3 rounded-xl border border-emerald-300/20 bg-[#071b27] p-3 text-xs">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="text-sm text-white">Revisar composición</strong><p className="mt-0.5 text-slate-300">{meal.meal_description} · {Math.round(meal.estimated_calories)} kcal registradas</p></div><button type="button" onClick={estimate} disabled={loading || saving} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/25 bg-sky-400/10 px-3 py-1.5 font-semibold text-sky-200 hover:bg-sky-400/20 disabled:opacity-50">{loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Estimar con Gemini</button></div>
    <p className="text-[11px] leading-4 text-slate-400">Estimación orientativa basada en porciones declaradas o asumidas. Revisa y corrige antes de guardar; no cambia las calorías ya registradas.</p>
    <label className="block text-[11px] text-slate-300">Porción utilizada<input value={portion} onChange={(event) => setPortion(event.target.value)} maxLength={200} placeholder="Ej. 1 taza de arroz y 100 g de atún" className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-3 py-2 text-white outline-none focus:border-emerald-300/50" /></label>
    {foods.length > 0 && <div className="space-y-1 rounded-lg border border-sky-100/10 p-2"><strong className="text-slate-200">Desglose propuesto</strong>{foods.map((food, index) => <p key={`${food.name}-${index}`} className="text-slate-400">{food.name} · {food.portion} · P {food.protein_g ?? "—"} g / C {food.carbs_g ?? "—"} g / G {food.fat_g ?? "—"} g</p>)}</div>}
    <div className="grid grid-cols-3 gap-2">{([ ["protein_g", "Proteínas"], ["carbs_g", "Carbohidratos"], ["fat_g", "Grasas"] ] as const).map(([key, label]) => <label key={key} className="min-w-0 text-[11px] text-slate-300">{label} (g)<input type="number" min="0" max="1000" step="0.1" inputMode="decimal" value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} placeholder="Sin dato" className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white outline-none focus:border-emerald-300/50" /></label>)}</div>
    <div className="hf-macro-footer flex flex-wrap items-center justify-between gap-2"><span role={error ? "alert" : undefined} className={error ? "text-orange-300" : "text-emerald-300"}>{error || (saved ? "Composición guardada." : "")}</span><button type="button" onClick={save} disabled={saving || loading} className="hf-primary hf-macro-save">{saving ? "Guardando..." : "Guardar macros"}</button></div>
  </div>
}
