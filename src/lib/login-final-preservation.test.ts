import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import ts from "typescript"

const printer = ts.createPrinter({ removeComments: true })
function operations(file: string) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const fn = source.statements.find((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && !!node.body)
  assert.ok(fn?.body)
  const body = fn.body.statements.filter(node => !ts.isReturnStatement(node)).map(node => printer.printNode(ts.EmitHint.Unspecified, node, source))
  const callbacks: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source))) callbacks.push(printer.printNode(ts.EmitHint.Unspecified, node, source))
    ts.forEachChild(node, visit)
  }
  visit(source)
  return { body, callbacks: callbacks.sort() }
}
for (const relative of ["src/components/health/health-ai-reading.tsx", "src/app/(dashboard)/calendario/page.tsx"]) {
  test(`${relative}: targeted final fixes preserve data operations and callbacks`, () => {
    assert.deepEqual(operations(path.resolve(relative)), operations(path.resolve("backups/login-final-20261011", relative)))
  })
}
