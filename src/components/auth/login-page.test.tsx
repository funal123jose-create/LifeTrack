import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"
import React from "react"
import { JSDOM } from "jsdom"
import ts from "typescript"

test("login keeps password payload, loading, errors and success redirect without real auth", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/login" })
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true }, document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true }, HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true, writable: true },
  })
  const { render, fireEvent, cleanup, act, waitFor } = await import("@testing-library/react")
  const file = path.resolve("src/app/login/page.tsx")
  const require = createRequire(file)
  let resolveAuth!: (result: { error: { message: string } | null }) => void
  let rejectAuth!: (error: Error) => void
  const payloads: unknown[] = []
  const routes: string[] = []
  let refreshes = 0
  const hostConsole = { ...console, error: () => undefined }
  const testModule = { exports: {} as { default: React.ComponentType } }
  const primitive = (tag: string) => {
    function MockPrimitive(props: Record<string, unknown>) { return React.createElement(tag, props) }
    return MockPrimitive
  }
  function MockImage(props: Record<string, unknown>) {
    const imageProps = { ...props }
    delete imageProps.unoptimized
    return React.createElement("img", imageProps)
  }
  const mockRequire = (id: string) => {
    if (id.endsWith(".css")) return {}
    if (id === "next/image") return { __esModule: true, default: MockImage }
    if (id === "next/navigation") return { useRouter: () => ({ push: (route: string) => routes.push(route), refresh: () => refreshes++ }) }
    if (id === "next-themes") return { useTheme: () => ({ resolvedTheme: "dark", setTheme: () => undefined }) }
    if (id === "framer-motion") return { useReducedMotion: () => true }
    if (id === "@/components/auth/login-scene") return { LoginScene: () => null }
    if (id === "@/components/ui/button") return { Button: primitive("button") }
    if (id === "@/components/ui/input") return { Input: primitive("input") }
    if (id === "@/components/ui/label") return { Label: primitive("label") }
    if (id === "@/lib/supabase/client") return { createClient: () => ({ auth: { signInWithPassword: (payload: unknown) => {
      payloads.push(payload)
      return new Promise((resolve, reject) => { resolveAuth = resolve; rejectAuth = reject })
    } } }) }
    return require(id)
  }
  const js = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(js, { module: testModule, exports: testModule.exports, require: mockRequire, console: hostConsole })
  const Page = testModule.exports.default
  const ui = render(<Page />)
  try {
    const email = ui.getByLabelText("Correo electrónico") as HTMLInputElement
    const password = ui.getByLabelText("Contraseña") as HTMLInputElement
    assert.equal(email.required, true)
    assert.equal(email.type, "email")
    assert.equal(password.required, true)
    assert.equal(password.autocomplete, "current-password")
    fireEvent.change(email, { target: { value: "synthetic@example.invalid" } })
    fireEvent.change(password, { target: { value: "synthetic-password" } })
    fireEvent.click(ui.getByRole("button", { name: "Mostrar contraseña" }))
    assert.equal(password.type, "text")
    fireEvent.click(ui.getByRole("button", { name: "Ocultar contraseña" }))
    assert.equal(password.type, "password")
    fireEvent.submit(email.form!)
    assert.equal(ui.getByRole("button", { name: "Entrando..." }).hasAttribute("disabled"), true)
    assert.deepEqual(JSON.parse(JSON.stringify(payloads[0])), { email: "synthetic@example.invalid", password: "synthetic-password" })
    await act(async () => resolveAuth({ error: { message: "Invalid login credentials" } }))
    assert.equal(ui.getByRole("alert").textContent, "Error: Invalid login credentials")
    assert.equal(routes.length, 0)
    fireEvent.submit(email.form!)
    assert.equal(ui.queryByRole("alert"), null)
    await act(async () => rejectAuth(new Error("Synthetic network failure")))
    await waitFor(() => assert.ok(ui.getByRole("alert").textContent?.includes("No se pudo conectar")))
    assert.equal(ui.getByRole("button", { name: "Entrar a LifeTrack" }).hasAttribute("disabled"), false)
    fireEvent.submit(email.form!)
    await act(async () => resolveAuth({ error: null }))
    assert.deepEqual(routes, ["/dashboard"])
    assert.equal(refreshes, 1)
    assert.equal(payloads.length, 3)
    assert.equal(ui.queryByRole("alert"), null)
  } finally { cleanup(); dom.window.close() }
})
