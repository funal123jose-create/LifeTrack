import assert from "node:assert/strict"
import test from "node:test"
import { JSDOM } from "jsdom"
import React from "react"
import { createRequire } from "node:module"

test("hydration presentation routes actions to mocks and renders saving/errors without writes", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  dom.window.matchMedia = (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })) as unknown as typeof dom.window.matchMedia
  const { render, fireEvent, cleanup, waitFor } = await import("@testing-library/react")
  const { HealthHydrationWorkspace, HealthEnergySummary, HealthMealAudioAction } = await import("./health-form-workspaces")
  let recordCalls = 0
  const audio = render(<HealthMealAudioAction recording={false} busy={false} onRecord={() => recordCalls++} />)
  fireEvent.click(audio.getByRole("button", { name: "Grabar descripción de comida" }))
  assert.equal(recordCalls, 1)
  audio.rerender(<HealthMealAudioAction recording busy={false} onRecord={() => recordCalls++} />)
  assert.equal(audio.getByRole("button", { name: "Detener grabación de comida" }).getAttribute("aria-pressed"), "true")
  fireEvent.click(audio.getByRole("button", { name: "Detener grabación de comida" }))
  assert.equal(recordCalls, 2)
  audio.rerender(<HealthMealAudioAction recording={false} busy onRecord={() => recordCalls++} />)
  fireEvent.click(audio.getByRole("button", { name: "Grabar descripción de comida" }))
  assert.equal(recordCalls, 2)
  assert.equal(audio.getByRole("status").textContent, "Procesando tu comida...")
  cleanup()
  const calls: string[] = []
  const props = { liters: 1, goal: 3, percent: 33, goalInput: "3", saving: false, error: "", logs: <p>Evento simulado</p>, count: 1, onInput: (value: string) => calls.push(value), onSave: () => calls.push("save"), onAdd: () => calls.push("add"), onRemove: () => calls.push("remove") }
  const ui = render(<HealthHydrationWorkspace {...props} />)
  fireEvent.change(ui.getByLabelText("Cantidad de agua"), { target: { value: "4" } })
  fireEvent.click(ui.getByRole("button", { name: "Registrar 250 ml" }))
  fireEvent.click(ui.getByRole("button", { name: "Restar 250 ml" }))
  fireEvent.click(ui.getByRole("button", { name: "Guardar meta" }))
  assert.deepEqual(calls, ["4", "add", "remove", "save"])
  ui.rerender(<HealthHydrationWorkspace {...props} liters={2} percent={67} saving error="Error simulado" />)
  assert.equal(ui.getByRole("button", { name: "Guardando..." }).hasAttribute("disabled"), true)
  assert.equal(ui.getByRole("meter").getAttribute("aria-valuenow"), "67")
  assert.equal(ui.getByRole("alert").textContent, "Error simulado")
  cleanup()
  const amounts: number[] = []
  const energy = render(<HealthEnergySummary calories={2500} target={2404} percent={104} onAdjust={(amount) => amounts.push(amount)} />)
  fireEvent.click(energy.getByRole("button", { name: "100 kcal" }))
  fireEvent.click(energy.getByRole("button", { name: "Restar 100 kcal" }))
  assert.deepEqual(amounts, [100, -100])
  assert.equal(energy.getByRole("meter").getAttribute("aria-valuenow"), "100")
  assert.ok(energy.getByText("Límite calórico excedido."))
  cleanup()
  // Node tests exercise the form callbacks; CSS is verified in the browser.
  const require = createRequire(`${process.cwd()}/package.json`)
  require.extensions[".css"] = () => undefined
  const { HealthPlanManager } = await import("./health-plan-manager")
  const { getLocalDateString } = await import("@/lib/date")
  const item = { id: "mock", date: getLocalDateString(), category: "hydration", title: "Objetivo simulado", scheduled_time: null, target_value: 3, target_unit: "L", completed: false }
  const actions: unknown[] = []
  const plan = render(<HealthPlanManager items={[item]} workouts={[]} weekOffset={0} onAdd={async (input) => { actions.push(input); return true }} onToggleItem={(entry) => actions.push(entry.id)} onDeleteItem={(id) => actions.push(`delete:${id}`)} onToggleWorkout={() => actions.push("workout")} />)
  fireEvent.click(plan.getByRole("button", { name: "Agregar al plan" }))
  assert.equal(actions.length, 0)
  assert.equal(plan.getByRole("alert").textContent, "Revisa la fecha, el nombre y el objetivo.")
  fireEvent.change(plan.getByLabelText("Actividad"), { target: { value: "Registrar agua de prueba" } })
  fireEvent.click(plan.getByRole("button", { name: "Agregar al plan" }))
  await waitFor(() => assert.equal((plan.getByLabelText("Actividad") as HTMLInputElement).value, ""))
  assert.deepEqual(actions[0], { date: getLocalDateString(), category: "nutrition", title: "Registrar agua de prueba", scheduled_time: null, target_value: null, target_unit: null })
  fireEvent.click(plan.getByRole("checkbox", { name: "Marcar completado: Objetivo simulado" }))
  fireEvent.click(plan.getByRole("button", { name: "Eliminar Objetivo simulado" }))
  assert.deepEqual(actions.slice(1), ["mock", "delete:mock"])
  cleanup()
  const failed = render(<HealthPlanManager items={[]} workouts={[]} weekOffset={0} onAdd={async () => false} onToggleItem={() => {}} onDeleteItem={() => {}} onToggleWorkout={() => {}} />)
  fireEvent.change(failed.getByLabelText("Actividad"), { target: { value: "Objetivo de prueba" } })
  fireEvent.click(failed.getByRole("button", { name: "Agregar al plan" }))
  await waitFor(() => assert.equal(failed.getByRole("alert").textContent, "No se pudo guardar el objetivo."))
  cleanup()
  const historical = render(<HealthPlanManager items={[]} workouts={[]} weekOffset={1} onAdd={async () => false} onToggleItem={() => {}} onDeleteItem={() => {}} onToggleWorkout={() => {}} />)
  assert.equal(historical.queryByRole("button", { name: "Agregar al plan" }), null)
  assert.ok(historical.getByText(/Vista histórica de solo lectura/))
  cleanup()
  dom.window.close()
})
