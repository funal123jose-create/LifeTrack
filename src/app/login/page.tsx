"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, AlertCircle, Eye, EyeOff, HeartPulse, BriefcaseBusiness, Leaf, Loader2, Moon, Sun, Pause, Play, ShieldCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginScene } from "@/components/auth/login-scene"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import "./login-2026.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [paused, setPaused] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErrorMessage("Error: " + error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="lt-login">
      <LoginScene paused={paused || !!reducedMotion} theme={resolvedTheme} />
      <header className="lt-login__header">
        <div className="lt-login__brand"><Image src="/images/lifetrack/2026/lifetrack-mark.svg" alt="" width={32} height={32} unoptimized /><span>LifeTrack</span></div>
        <div className="lt-login__controls">
          <button type="button" className="lt-login__icon lt-login__motion" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Reanudar animación" : "Pausar animación"} title={paused ? "Reanudar animación" : "Pausar animación"} disabled={!!reducedMotion}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
          <button type="button" className="lt-login__icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Cambiar tema" title="Cambiar tema"><Sun size={19} className="lt-login__sun" /><Moon size={19} className="lt-login__moon" /></button>
        </div>
      </header>
      <section className="lt-login__content" aria-labelledby="login-title">
        <div className="lt-login__intro">
          <Image src="/images/lifetrack/2026/lifetrack-mark.svg" alt="" width={52} height={52} unoptimized />
          <h1 id="login-title">LifeTrack</h1>
          <p>Tu progreso, en todas sus dimensiones.</p>
        </div>
        <div className="lt-login__access">
          <h2>Inicia sesión</h2><p>Continúa donde lo dejaste.</p>
          <form onSubmit={handleLogin} aria-busy={isLoading}>
            <div className="lt-login__field">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required aria-describedby={errorMessage ? "login-error" : undefined} />
            </div>
            <div className="lt-login__field">
              <Label htmlFor="password">Contraseña</Label>
              <div className="lt-login__password">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" required aria-describedby={errorMessage ? "login-error" : undefined} />
                <button type="button" className="lt-login__icon" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {errorMessage && <p id="login-error" className="lt-login__error" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{errorMessage}</span></p>}
            <Button type="submit" disabled={isLoading} className="lt-login__submit">{isLoading ? <><Loader2 size={18} className="lt-login__spinner" aria-hidden="true" /><span>Entrando...</span></> : <><span>Entrar a LifeTrack</span><ArrowRight size={18} aria-hidden="true" /></>}</Button>
            <p className="lt-login__privacy"><ShieldCheck size={14} aria-hidden="true" />Tu espacio personal, con acceso privado.</p>
          </form>
        </div>
      </section>
      <footer className="lt-login__footer" aria-label="Los tres pilares de LifeTrack">
        <span data-pillar="health"><HeartPulse size={18} aria-hidden="true" />Salud Física</span>
        <span data-pillar="career"><BriefcaseBusiness size={18} aria-hidden="true" />Data &amp; Carrera</span>
        <span data-pillar="care"><Leaf size={18} aria-hidden="true" />Cuidado Personal</span>
      </footer>
    </main>
  )
}
