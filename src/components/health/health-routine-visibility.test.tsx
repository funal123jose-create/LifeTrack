import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { JSDOM } from "jsdom"

const css = readFileSync("src/app/(dashboard)/pilares/pillars-2026.css", "utf8")
const rules = css.split("\n").filter(line => line.includes(".health-detail-secondary") && line.includes("div:first-child")).join("\n")

for (const content of [
  '<div><button type="button">Cardio: 27 min de cardio.</button></div>',
  '<div>No hay ejercicios guardados para este dia.</div>',
  '<div>Selecciona un dia en el planificador semanal para ver tus tareas.</div>',
]) {
  test(`training checklist remains visible: ${content}`, () => {
    const dom = new JSDOM(`<style>${rules}</style><main class="pillar-2026"></main>
      <div class="health-detail-secondary">
        <section data-slot="card" data-health-panel="routine" data-routine-checklist>
          <div data-slot="card-content">${content}</div>
        </section>
        <section data-slot="card" data-health-panel="progress">
          <div data-slot="card-content"><div id="physical-art">Decorative art</div></div>
        </section>
      </div>`)
    const checklist = dom.window.document.querySelector("[data-routine-checklist] [data-slot=card-content] > div")!
    assert.notEqual(dom.window.getComputedStyle(checklist).display, "none")
    assert.equal(dom.window.getComputedStyle(dom.window.document.getElementById("physical-art")!).display, "none")
    dom.window.close()
  })
}
