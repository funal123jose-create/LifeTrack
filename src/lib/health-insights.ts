import { dateDaysAgo, nutritionTotals, waterTotalsForRange, type HealthHistory, type NutritionHistory, type WeightGoal } from "@/lib/health-analytics"
import { comparablePreviousRange, healthDateRange, inHealthRange } from "@/lib/health-periods"
import { trainingStatsForRange, type trainingStats } from "@/lib/health-training"

export type HealthInsight = {
  positive: string
  attention: string
  action: string
  basis: string
  signals: { label: string; value: string; detail: string }[]
}

export function streakDayDetails(history: HealthHistory, nutrition: NutritionHistory, date: string) {
  const meals = nutrition.meals.filter((row) => row.date === date).length
  const water = history.water.filter((row) => row.date === date).reduce((sum, row) => sum + row.amount_liters, 0)
  const routines = history.routine.filter((row) => row.date === date && row.completed).length
  const body = history.body.filter((row) => row.date === date)
  const weight = body.some((row) => row.weight_kg !== null)
  const energy = body.some((row) => row.energy_level !== null)
  const manualCalories = nutrition.tracker.some((row) => row.date === date && row.calorie_manual_adjustment !== 0)
  const sources = [
    meals > 0 ? `${meals} comida${meals === 1 ? "" : "s"}` : null,
    water > 0 ? `${water.toFixed(2)} L de agua` : null,
    routines > 0 ? `${routines} rutina${routines === 1 ? "" : "s"}` : null,
    weight ? "peso registrado" : null,
    energy ? "energía registrada" : null,
    body.length > 0 && !weight && !energy ? "progreso físico registrado" : null,
    manualCalories ? "ajuste de calorías" : null,
  ].filter((source): source is string => source !== null)
  return { sources, active: sources.length > 0 }
}

export function deriveHealthInsight(history: HealthHistory, nutrition: NutritionHistory, goal: WeightGoal | null, training: ReturnType<typeof trainingStats>, today = new Date()): HealthInsight {
  const yesterday = dateDaysAgo(1, today)
  const week = healthDateRange("week", 0, today)
  const previousWeek = comparablePreviousRange(week, today)
  const currentWater = waterTotalsForRange(history, week)
  const previousWater = waterTotalsForRange(history, previousWeek)
  const completeWeekWater = yesterday >= week.start ? waterTotalsForRange(history, { ...week, end: yesterday }) : null
  const currentWaterDays = new Set(history.water.filter((row) => inHealthRange(row.date, week)).map((row) => row.date)).size
  const previousWaterDays = new Set(history.water.filter((row) => inHealthRange(row.date, previousWeek)).map((row) => row.date)).size
  const previousTraining = trainingStatsForRange(history, previousWeek, today)
  const recentWater = [1, 2, 3].map((days) => {
    const date = dateDaysAgo(days, today)
    const tracker = history.tracker.find((row) => row.date === date)
    const liters = history.water.filter((row) => row.date === date).reduce((sum, row) => sum + row.amount_liters, 0)
    return { tracker, liters }
  })
  const threeLowWaterDays = recentWater.every(({ tracker, liters }) => tracker?.water_target_liters && liters < tracker.water_target_liters * 0.75)
  const weights = history.body.filter((row) => row.weight_kg !== null)
  const latest = weights.at(-1)?.weight_kg ?? null
  const previous = weights.at(-2)?.weight_kg ?? null
  const towardGoal = goal && latest !== null && previous !== null && (goal.target_weight_kg < goal.start_weight_kg ? latest < previous : latest > previous)
  const awayFromGoal = goal && latest !== null && previous !== null && (goal.target_weight_kg < goal.start_weight_kg ? latest > previous : latest < previous)
  const nutritionData = nutritionTotals(nutrition)
  const comparableTraining = previousTraining.plannedDays !== null || previousTraining.completedDays > 0
  const signals = [
    {
      label: "Agua / día registrado",
      value: currentWaterDays ? `${(currentWater.liters / currentWaterDays).toFixed(2)} L` : "—",
      detail: currentWaterDays ? `${currentWaterDays} día${currentWaterDays === 1 ? "" : "s"} con agua${previousWaterDays ? ` · antes ${(previousWater.liters / previousWaterDays).toFixed(2)} L` : ""}` : "Sin agua registrada esta semana",
    },
    {
      label: "Rutina semanal",
      value: `${training.completedDays}${training.plannedDays === null ? "" : `/${training.plannedDays}`}`,
      detail: comparableTraining ? `Antes: ${previousTraining.completedDays} día${previousTraining.completedDays === 1 ? "" : "s"} al mismo punto` : "Sin base anterior comparable",
    },
    {
      label: "Último peso",
      value: latest === null ? "—" : `${latest} kg`,
      detail: previous === null || latest === null ? "Sin registro anterior" : `${latest - previous > 0 ? "+" : ""}${Number((latest - previous).toFixed(1))} kg frente al anterior`,
    },
  ]

  const positive = comparableTraining && training.completedDays > previousTraining.completedDays
    ? `Completaste ${training.completedDays} días de rutina: ${training.completedDays - previousTraining.completedDays} más que al mismo punto de la semana anterior.`
    : towardGoal
      ? `El último peso se acercó a tu meta de ${goal!.target_weight_kg} kg.`
      : currentWater.percent !== null && currentWater.percent >= 100
        ? `Alcanzaste el ${currentWater.percent}% de las metas de agua registradas esta semana.`
        : training.completedDays > 0
          ? `Completaste ${training.completedDays} día${training.completedDays === 1 ? "" : "s"} de rutina esta semana.`
          : nutritionData.mealCount > 0
            ? `Registraste ${nutritionData.mealCount} comida${nutritionData.mealCount === 1 ? "" : "s"} esta semana.`
            : "Aún no hay registros suficientes para identificar una mejora."

  if (threeLowWaterDays) return {
    positive,
    attention: "La hidratación quedó por debajo del 75% de la meta en los tres días completos más recientes.",
    action: "Revisa cómo distribuyes el agua durante el día y ajusta tu meta si no refleja tu objetivo actual.",
    basis: `Eventos de agua y metas del tracker · hasta ${yesterday}`,
    signals,
  }
  if (nutritionData.mealCount > 0 && nutritionData.proteinKnown < nutritionData.mealCount) return {
    positive,
    attention: `${nutritionData.mealCount - nutritionData.proteinKnown} comida${nutritionData.mealCount - nutritionData.proteinKnown === 1 ? "" : "s"} del periodo no tiene${nutritionData.mealCount - nutritionData.proteinKnown === 1 ? "" : "n"} proteínas estimadas. El total visible es parcial.`,
    action: "Revisa las porciones de esas comidas y completa sus macros antes de interpretar la distribución nutricional.",
    basis: "Comidas registradas · macros parciales",
    signals,
  }
  if (completeWeekWater && completeWeekWater.targetDays >= 2 && completeWeekWater.percent !== null && completeWeekWater.percent < 75) return {
    positive,
    attention: `En los días completos de esta semana registraste el ${completeWeekWater.percent}% de tus metas de agua.`,
    action: "Consulta la hidratación por fecha y revisa si tu meta diaria sigue siendo adecuada.",
    basis: `Agua y metas registradas · ${week.start} a ${yesterday}`,
    signals,
  }
  if (awayFromGoal) return {
    positive,
    attention: `El último peso se alejó de la meta de ${goal!.target_weight_kg} kg frente al registro anterior.`,
    action: "Consulta las fechas de tus pesajes antes de interpretar el cambio como tendencia.",
    basis: "Dos últimos registros de peso y meta activa",
    signals,
  }
  if (comparableTraining && training.completedDays < previousTraining.completedDays) return {
    positive,
    attention: `Llevas ${previousTraining.completedDays - training.completedDays} día${previousTraining.completedDays - training.completedDays === 1 ? "" : "s"} de rutina menos que al mismo punto de la semana anterior.`,
    action: "Revisa las sesiones pendientes del plan de esta semana.",
    basis: "Cumplimiento semanal · mismo tramo de días",
    signals,
  }
  if (training.plannedDays !== null && training.plannedDays > 0 && training.completedDays < training.plannedDays) return {
    positive,
    attention: `Hay ${training.plannedDays - training.completedDays} día${training.plannedDays - training.completedDays === 1 ? "" : "s"} de entrenamiento planificado aún sin completar.`,
    action: "Consulta el plan semanal y marca las sesiones realizadas; ajusta las pendientes si tu agenda cambió.",
    basis: "Plan semanal y cumplimiento registrado",
    signals,
  }
  return {
    positive,
    attention: currentWaterDays || nutritionData.mealCount || training.completedDays ? "No hay una desviación confirmada con los datos de esta semana." : "Faltan registros de esta semana para comparar hábitos.",
    action: currentWaterDays ? "Continúa registrando agua y actividad para distinguir cambios sostenidos de días aislados." : "Registra agua, comidas o rutinas para activar comparaciones semanales.",
    basis: "Eventos de agua, comidas, rutinas y peso de tu cuenta",
    signals,
  }
}
