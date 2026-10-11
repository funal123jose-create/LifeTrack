import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import ts from "typescript"

const routes = ["portafolio", "historial", "calendario", "pilares/carrera"]
const printer = ts.createPrinter({ removeComments: true })

function inspect(file: string) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const controller = source.statements.find((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && !!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword))
  assert.ok(controller?.body, "Route must retain its default controller")
  const logic = controller.body.statements.filter((node) => !ts.isReturnStatement(node)).map((node) => printer.printNode(ts.EmitHint.Unspecified, node, source))
  const callbacks: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source))) callbacks.push(printer.printNode(ts.EmitHint.Unspecified, node, source))
    ts.forEachChild(node, visit)
  }
  visit(source)
  return { logic, callbacks: callbacks.sort() }
}

for (const route of routes) {
  test(`${route}: queries, auth, state, calculations and all callbacks are preserved`, () => {
    const relative = `src/app/(dashboard)/${route}/page.tsx`
    const before = inspect(path.resolve("backups/final-phase-20261011", relative))
    const after = inspect(path.resolve(relative))
    assert.deepEqual(after.logic, before.logic)
    assert.deepEqual(after.callbacks, before.callbacks)
  })
}
