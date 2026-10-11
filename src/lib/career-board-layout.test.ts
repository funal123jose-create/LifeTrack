import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

test("desktop career board fits six columns from a 916px container", () => {
  const css = readFileSync("src/app/(dashboard)/pilares/carrera/career-refinement.css", "utf8")
  const rules = [...css.matchAll(/@container career-board \(min-width:(\d+)px\)\s*\{[^}]*grid-auto-columns:calc\(\(100% - (\d+)px\) \/ (\d+)\)/g)]
    .map((match) => ({ minWidth: Number(match[1]), gapTotal: Number(match[2]), columns: Number(match[3]) }))
  for (const width of [940, 1202, 1280, 1440]) {
    const rule = rules.filter((rule) => width >= rule.minWidth).at(-1)
    assert.ok(rule)
    assert.equal(rule.columns, 6)
    const columnWidth = (width - rule.gapTotal) / rule.columns
    assert.equal(columnWidth * 6 + 12 * 5, width)
  }
  assert.equal(rules.filter((rule) => 700 >= rule.minWidth).at(-1)?.columns, 3)
})
