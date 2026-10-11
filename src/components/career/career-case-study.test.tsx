import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"
import React from "react"
import { JSDOM } from "jsdom"
import ts from "typescript"
import type { ProjectCaseStudyDetail } from "@/lib/career-page-models"

test("technical dossier preserves content, links, export, close and empty states without writes", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  const { render, fireEvent, cleanup } = await import("@testing-library/react")
  const file = path.resolve("src/components/career/career-case-study.tsx")
  const require = createRequire(file)
  const testModule = { exports: {} as { CareerCaseStudy: React.ComponentType<{ study: ProjectCaseStudyDetail; onClose: () => void; actions: React.ReactNode }> } }
  function MotionDiv(props: Record<string, unknown>) {
    const clean = { ...props }
    for (const key of ["initial", "animate", "exit", "transition"]) delete clean[key]
    return React.createElement("div", clean)
  }
  function Frame({ children }: { children: React.ReactNode }) { return <div>{children}</div> }
  const mockRequire = (id: string) => {
    if (id === "framer-motion") return { motion: { div: MotionDiv }, useReducedMotion: () => true }
    if (id === "@/components/pillars/pillar-modal-frame") return { PillarModalFrame: Frame }
    return require(id)
  }
  const js = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(js, { module: testModule, exports: testModule.exports, require: mockRequire })
  const Case = testModule.exports.CareerCaseStudy
  const study = {
    project_title: "Synthetic engineering case", project_description: "Original project description", professional_score: 81.2,
    project_stack: "Python, React", task_stack: "SQL", total_tasks: 2, completed_tasks: 1, documented_tasks: 2,
    documentation_percentage: 100, total_task_skills: 3, tasks_with_skills: 2, total_assets: 1, total_images: 0, total_documents: 1,
    tasks_json: [
      { task_id: "legacy", task_title: "Legacy documentation", task_status: "COMPLETADO", total_assets: 1,
        skills: [{ skill_id: "python", name: "Python" }], documentation: { objective: "Original objective", content: "Original process", technical_notes: "Original notes", challenges: "Original challenge", solution: "Original solution", learnings: "Original learnings", result_summary: "Original result", reference_links: "Original reference" },
        assets: [{ asset_id: "file", file_name: "Original document.pdf", mime_type: "application/pdf", file_size: 1024, file_url: "https://example.invalid/original.pdf" }] },
      { task_id: "rich", task_title: "Rich documentation", task_status: "EN CURSO", skills: [], total_assets: 0, assets: [], documentation: { document_content_html: "<h2>Original heading</h2><p>Original rich content</p>" } },
    ],
  } as unknown as ProjectCaseStudyDetail
  let exports = 0
  let closes = 0
  const actions = <><button onClick={() => exports++}>Exportar</button><button onClick={() => closes++}>Cerrar caso técnico</button></>
  const ui = render(<Case study={study} actions={actions} onClose={() => closes++} />)
  try {
    for (const text of ["Original objective", "Original process", "Original notes", "Original challenge", "Original solution", "Original learnings", "Original result", "Original reference", "Original rich content", "81.2%", "Original project description"]) assert.ok(ui.container.textContent?.includes(text), text)
    const evidence = ui.getByRole("link", { name: /Original document.pdf/ })
    assert.equal(evidence.getAttribute("href"), "https://example.invalid/original.pdf")
    assert.equal(evidence.getAttribute("rel"), "noopener noreferrer")
    const index = ui.getByRole("navigation", { name: "Índice del caso técnico" })
    assert.equal(index.querySelectorAll("ol a").length, 2)
    for (const link of index.querySelectorAll("a")) assert.ok(ui.container.querySelector(`[id="${link.getAttribute("href")!.slice(1)}"]`))
    assert.equal(ui.container.querySelectorAll(".career-case-document[open]").length, 2)
    assert.ok(ui.container.querySelectorAll(".technology-mark").length >= 4)
    fireEvent.click(ui.getByRole("button", { name: "Exportar" }))
    fireEvent.click(ui.getByRole("button", { name: "Cerrar caso técnico" }))
    assert.equal(exports, 1)
    assert.equal(closes, 1)
    ui.rerender(<Case study={{ ...study, project_stack: "", task_stack: "", tasks_json: [] }} actions={actions} onClose={() => closes++} />)
    assert.ok(ui.getByText("Sin stack planificado."))
    assert.ok(ui.getByText("Sin stack aplicado en subtareas."))
    assert.ok(ui.getByText("Este proyecto aún no tiene subtareas registradas."))
  } finally { cleanup(); dom.window.close() }
})

test("project controller and all unrelated JSX remain identical to the verified backup", () => {
  const file = "src/app/(dashboard)/pilares/carrera/page.tsx"
  const before = readFileSync(`backups/career-case-20261011/${file}.snapshot`, "utf8")
  const after = readFileSync(file, "utf8")
  const scrub = (text: string) => {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const fn = source.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === "DataCarreraPage") as ts.FunctionDeclaration
    let target: ts.Node | undefined
    const visit = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === "CareerCaseStudy") target = node
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === "PillarModalFrame" && node.openingElement.attributes.getText(source).includes('title="Caso técnico del proyecto"')) target = node
      ts.forEachChild(node, visit)
    }
    visit(fn)
    assert.ok(target)
    return fn.getText(source).replace(target.getText(source), "<CASE />")
  }
  assert.equal(scrub(after), scrub(before))
})

test("subtask labels retain the original skill selection and action callbacks", () => {
  const file = "src/components/career/task-card.tsx"
  const inspect = (path: string) => {
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const fn = source.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === "TaskCard") as ts.FunctionDeclaration
    const callbacks: string[] = []
    const visit = (node: ts.Node) => {
      if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source))) callbacks.push(node.getText(source))
      ts.forEachChild(node, visit)
    }
    visit(fn)
    return { logic: fn.body!.statements.filter(n => !ts.isReturnStatement(n)).map(n => n.getText(source)), callbacks }
  }
  assert.deepEqual(inspect(file), inspect(`backups/career-case-20261011/${file}.snapshot`))
  assert.ok(readFileSync(file, "utf8").includes("getVisibleTaskSkillLinks(task.task_skills).map"))
})
