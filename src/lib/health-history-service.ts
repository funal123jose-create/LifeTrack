import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { dateDaysAgo, type HealthHistory, type NutritionHistory, type WeightGoal } from "@/lib/health-analytics"
import { getCurrentWeekEndString, getLocalDateString } from "@/lib/date"
import { healthDateRange } from "@/lib/health-periods"
import type { HealthPlanItem } from "@/lib/health-plan"

type Client = SupabaseClient<Database>

export async function fetchHealthHistory(client: Client, userId: string): Promise<HealthHistory> {
  const from = dateDaysAgo(400)
  const [body, tracker, water, routine, plans] = await Promise.all([
    client.from("body_progress_logs").select("date, created_at, weight_kg, energy_level").eq("user_id", userId).order("date", { ascending: true }).order("created_at", { ascending: true }).limit(1000),
    client.from("daily_health_tracker").select("date, calories_ingested, is_workout_day, water_ingested_liters, water_target_liters").eq("user_id", userId).gte("date", from).order("date", { ascending: true }).limit(1000),
    client.from("water_logs").select("date, amount_liters").eq("user_id", userId).gte("date", from).order("date", { ascending: true }).limit(3000),
    client.from("health_routine_completions").select("date, week_start, dia_semana, routine_type, completed").eq("user_id", userId).gte("date", from).order("date", { ascending: true }).limit(1000),
    client.from("health_weekly_plans").select("week_start, planned_days, planned_routines").eq("user_id", userId).gte("week_start", from).order("week_start", { ascending: true }).limit(1000),
  ])
  if (body.error || tracker.error || water.error || routine.error || plans.error) throw body.error || tracker.error || water.error || routine.error || plans.error
  return {
    body: (body.data || []).map((row) => ({ date: row.date, created_at: row.created_at, weight_kg: row.weight_kg == null ? null : Number(row.weight_kg), energy_level: row.energy_level })),
    tracker: (tracker.data || []).map((row) => ({ date: row.date, calories_ingested: Number(row.calories_ingested), is_workout_day: !!row.is_workout_day, water_ingested_liters: Number(row.water_ingested_liters || 0), water_target_liters: row.water_target_liters == null ? null : Number(row.water_target_liters) })),
    water: (water.data || []).map((row) => ({ date: row.date, amount_liters: Number(row.amount_liters) })),
    routine: routine.data || [],
    plans: plans.data || [],
  }
}

export async function fetchNutritionHistory(client: Client, userId: string): Promise<NutritionHistory> {
  const from = dateDaysAgo(400)
  const [meals, tracker] = await Promise.all([
    client.from("meal_logs").select("id, date, created_at, meal_type, meal_description, estimated_calories, portion_assumption, food_breakdown, protein_g, carbs_g, fat_g").eq("user_id", userId).gte("date", from).order("created_at", { ascending: false }).limit(1000),
    client.from("daily_health_tracker").select("date, calorie_target, calories_ingested, calorie_manual_adjustment").eq("user_id", userId).gte("date", from).order("date", { ascending: false }).limit(1000),
  ])
  if (meals.error || tracker.error) throw meals.error || tracker.error
  return {
    meals: (meals.data || []).map((row) => ({ ...row, estimated_calories: Number(row.estimated_calories), protein_g: row.protein_g == null ? null : Number(row.protein_g), carbs_g: row.carbs_g == null ? null : Number(row.carbs_g), fat_g: row.fat_g == null ? null : Number(row.fat_g) })),
    tracker: (tracker.data || []).map((row) => ({ date: row.date, calorie_target: Number(row.calorie_target), calories_ingested: Number(row.calories_ingested), calorie_manual_adjustment: Number(row.calorie_manual_adjustment || 0) })),
  }
}

export async function fetchWeightGoal(client: Client, userId: string): Promise<WeightGoal | null> {
  const { data, error } = await client.from("health_weight_goals")
    .select("id, start_date, start_weight_kg, target_weight_kg, target_date")
    .eq("user_id", userId).maybeSingle()
  if (error) throw error
  return data ? { id: data.id, start_date: data.start_date, start_weight_kg: Number(data.start_weight_kg), target_weight_kg: Number(data.target_weight_kg), target_date: data.target_date } : null
}

export async function fetchWeightGoalHistory(client: Client, userId: string) {
  const { data, error } = await client.from("health_weight_goal_history")
    .select("id, start_date, start_weight_kg, target_weight_kg, target_date, final_weight_kg, status, closed_at")
    .eq("user_id", userId).order("closed_at", { ascending: false }).limit(50)
  if (error) throw error
  return data || []
}

export async function fetchHealthStreak(client: Client) {
  const { data, error } = await client.rpc("health_streak_summary", { p_today: getLocalDateString() })
  if (error) throw error
  const row = data?.[0]
  return {
    current: Number(row?.current_streak || 0),
    best: Number(row?.best_streak || 0),
    recentDays: Array.isArray(row?.recent_days) ? row.recent_days.filter((day): day is string => typeof day === "string") : [],
  }
}

export async function fetchHealthPlanItems(client: Client, userId: string) {
  const pageSize = 500
  const from = healthDateRange("week", 7).start
  const through = getCurrentWeekEndString()
  const items: HealthPlanItem[] = []
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from("health_plan_items")
      .select("id, date, category, title, scheduled_time, target_value, target_unit, completed")
      .eq("user_id", userId)
      .gte("date", from)
      .lte("date", through)
      .order("date", { ascending: true })
      .order("scheduled_time", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1)
    if (error) throw error
    items.push(...(data || []))
    if (!data || data.length < pageSize) break
  }
  return items
}
