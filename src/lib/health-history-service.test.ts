import assert from "node:assert/strict"
import test from "node:test"
import type { SupabaseClient } from "@supabase/supabase-js"
import { fetchHealthPlanItems } from "./health-history-service"
import type { Database } from "../types/database"

test("el plan carga todas las páginas y no se detiene en cien actividades", async () => {
  const rows = Array.from({ length: 1050 }, (_, index) => ({
    id: String(index), date: "2026-10-02", category: "other", title: `Actividad ${index}`,
    scheduled_time: null, target_value: null, target_unit: null, completed: false,
  }))
  const ranges: [number, number][] = []
  class Query {
    select() { return this }
    eq() { return this }
    gte() { return this }
    lte() { return this }
    order() { return this }
    async range(start: number, end: number) {
      ranges.push([start, end])
      return { data: rows.slice(start, end + 1), error: null }
    }
  }
  const client = { from: () => new Query() } as unknown as SupabaseClient<Database>
  const items = await fetchHealthPlanItems(client, "user")
  assert.equal(items.length, 1050)
  assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]])
  assert.equal(items.at(-1)?.title, "Actividad 1049")
})
