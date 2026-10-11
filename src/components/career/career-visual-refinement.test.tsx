import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"
import React from "react"
import { JSDOM } from "jsdom"

test("career refinement preserves page handlers and overview calculations", () => {
  const root = process.cwd()
  const declarations = (path: string, name: string) => {
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const fn = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name) as ts.FunctionDeclaration
    assert.ok(fn?.body, `Function ${name} exists`)
    return fn.body.statements.filter(node => !ts.isReturnStatement(node)).map(node => node.getText(source))
  }
  for (const [path, name] of [["src/app/(dashboard)/pilares/carrera/page.tsx", "DataCarreraPage"], ["src/components/career/career-command-overview.tsx", "CareerCommandOverview"]]) {
    assert.deepEqual(declarations(join(root, path), name), declarations(join(root, "docs/design-2026/backups/career-refinement-20261010", path + ".snapshot"), name))
  }
})

test("board navigation scrolls presentation only and keeps all synthetic test columns", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  dom.window.matchMedia = (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })) as unknown as typeof dom.window.matchMedia
  let disconnected = false
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class { observe() {} disconnect() { disconnected = true } } })
  Object.defineProperties(dom.window.HTMLElement.prototype, {
    clientWidth: { configurable: true, get: () => 350 }, scrollWidth: { configurable: true, get: () => 2160 },
  })
  const calls: ScrollToOptions[] = []
  dom.window.HTMLElement.prototype.scrollBy = options => { calls.push(options as ScrollToOptions) }
  const { render, fireEvent, cleanup, waitFor } = await import("@testing-library/react")
  const { CareerBoardViewport } = await import("./career-board-viewport")
  const ui = render(<CareerBoardViewport>{Array.from({ length: 6 }, (_, i) => <div key={i}>Synthetic test column {i + 1}</div>)}</CareerBoardViewport>)
  const region = ui.getByRole("region", { name: "Estados de proyectos" })
  assert.equal(region.children.length, 6)
  const previous = ui.getByRole("button", { name: "Ver columnas anteriores" }) as HTMLButtonElement
  assert.equal(previous.disabled, true)
  fireEvent.click(ui.getByRole("button", { name: "Ver columnas siguientes" }))
  assert.equal(calls[0].left, 12)
  fireEvent.keyDown(region, { key: "ArrowRight" })
  assert.equal(calls.length, 2)
  region.scrollLeft = 1810
  fireEvent.scroll(region)
  await waitFor(() => assert.equal((ui.getByRole("button", { name: "Ver columnas siguientes" }) as HTMLButtonElement).disabled, true))
  assert.equal(previous.disabled, false)
  cleanup()
  assert.equal(disconnected, true)
  dom.window.close()
})
