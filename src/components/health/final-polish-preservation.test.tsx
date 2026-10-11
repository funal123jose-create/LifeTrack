import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"

test("final visual polish preserves component logic and all event callbacks", () => {
  function operations(path: string) {
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const result: string[] = []
    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) && node.body && node.parent === source) {
        result.push(...node.body.statements.filter(statement => !ts.isReturnStatement(statement)).map(statement => statement.getText(source)))
      }
      if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source))) result.push(node.getText(source))
      ts.forEachChild(node, visit)
    }
    visit(source)
    return result
  }
  for (const path of ["src/app/(dashboard)/pilares/salud/page.tsx", "src/app/(dashboard)/pilares/carrera/page.tsx", "src/components/health/meal-macro-editor.tsx", "src/components/personal-care/personal-care-command-center.tsx"]) {
    assert.deepEqual(operations(path), operations(join("docs/design-2026/backups/final-polish-20261010", path + ".snapshot")), path)
  }
})
