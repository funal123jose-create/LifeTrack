import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"
import React from "react"
import { JSDOM } from "jsdom"

test("final detail preserves career handlers and rich editor data operations", () => {
  const body = (path: string, name: string) => {
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const fn = source.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name) as ts.FunctionDeclaration
    assert.ok(fn.body)
    return fn.body.statements.filter(n => !ts.isReturnStatement(n)).map(n => n.getText(source))
  }
  for (const [path, name] of [["src/app/(dashboard)/pilares/carrera/page.tsx", "DataCarreraPage"], ["src/components/career/rich-task-document-editor.tsx", "RichTaskDocumentEditor"]]) {
    assert.deepEqual(body(path, name), body(join("docs/design-2026/backups/final-detail-20261010", path + ".snapshot"), name))
  }
})

test("detail tabs keep drafts mounted and expose selected sections", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost", pretendToBeVisual: true })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    getComputedStyle: { value: dom.window.getComputedStyle.bind(dom.window), configurable: true },
    requestAnimationFrame: { value: dom.window.requestAnimationFrame.bind(dom.window), configurable: true },
    cancelAnimationFrame: { value: dom.window.cancelAnimationFrame.bind(dom.window), configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  const { render, fireEvent, cleanup } = await import("@testing-library/react")
  const { CareerDetailSections } = await import("./career-detail-sections")
  const ui = render(<CareerDetailSections labels={["General", "Stack"]}><div><input aria-label="Synthetic draft" defaultValue="Original" /></div><div>Mock stack</div></CareerDetailSections>)
  const draft = ui.getByLabelText("Synthetic draft") as HTMLInputElement
  fireEvent.change(draft, { target: { value: "Draft remains" } })
  fireEvent.mouseDown(ui.getByRole("tab", { name: "Stack" }), { button: 0, ctrlKey: false })
  assert.equal(ui.getByRole("tab", { name: "Stack" }).getAttribute("aria-selected"), "true")
  assert.equal(draft.isConnected, true)
  assert.equal(draft.value, "Draft remains")
  fireEvent.mouseDown(ui.getByRole("tab", { name: "General" }), { button: 0, ctrlKey: false })
  assert.equal(ui.getByRole("tab", { name: "General" }).getAttribute("aria-selected"), "true")
  assert.equal(draft.value, "Draft remains")
  cleanup()
  dom.window.close()
})
