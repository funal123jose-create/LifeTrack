import assert from "node:assert/strict"
import test from "node:test"
import React from "react"
import { JSDOM } from "jsdom"
import type { NutritionHistory } from "@/lib/health-analytics"

test("macro save keeps payload and disabled/success states using a local mock", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  const { render, fireEvent, cleanup, waitFor, act } = await import("@testing-library/react")
  const { MealMacroEditor } = await import("./meal-macro-editor")
  let resolveSave!: (value: boolean) => void
  let payload: unknown
  const meal = { id: "synthetic", meal_description: "Comida de prueba", estimated_calories: 100, protein_g: 10, carbs_g: 15, fat_g: null, portion_assumption: "Porcion de prueba", food_breakdown: [] } as NutritionHistory["meals"][number]
  const ui = render(<MealMacroEditor meal={meal} onSave={async input => { payload = input; return new Promise<boolean>(resolve => { resolveSave = resolve }) }} />)
  try {
    fireEvent.click(ui.getByRole("button", { name: "Guardar macros" }))
    assert.equal(ui.getByRole("button", { name: "Guardando..." }).hasAttribute("disabled"), true)
    assert.equal(ui.getByRole("button", { name: "Estimar con Gemini" }).hasAttribute("disabled"), true)
    assert.deepEqual(payload, { protein_g: 10, carbs_g: 15, fat_g: null, portion_assumption: "Porcion de prueba", foods: [] })
    await act(async () => resolveSave(true))
    await waitFor(() => assert.ok(ui.getByText("Composición guardada.")))
    assert.equal(ui.getByRole("button", { name: "Guardar macros" }).hasAttribute("disabled"), false)
  } finally { cleanup(); dom.window.close() }
})
