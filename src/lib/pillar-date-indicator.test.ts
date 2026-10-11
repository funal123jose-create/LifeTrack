import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

test("date fields load their native-indicator override with the component", () => {
  const component = readFileSync("src/components/pillars/pillar-date-field.tsx", "utf8")
  const css = readFileSync("src/components/pillars/pillar-date-field.css", "utf8")
  assert.match(component, /import "\.\/pillar-date-field\.css"/)
  assert.match(component, /type="date" value=\{value\} min=\{min\} max=\{max\} required=\{required\}/)
  assert.match(component, /<Popover\.Trigger asChild><button type="button"/)
  assert.match(component, /<CalendarDays size=\{17\}/)
  assert.match(css, /input\[type="date"\]::-webkit-calendar-picker-indicator\s*\{[^}]*display:\s*none !important/)
  assert.match(css, /width:\s*0 !important/)
  assert.match(css, /pointer-events:\s*none/)
})
