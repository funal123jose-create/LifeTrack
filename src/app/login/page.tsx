"use client"

import { useState } from "react"
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Fingerprint,
  LineChart,
  Loader2,
  LockKeyhole,
  Mail,
  Orbit,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const systemSignals = [
  { label: "Salud fisica", value: "20%", tone: "from-emerald-300 to-cyan-300" },
  { label: "Data & Carrera", value: "32%", tone: "from-amber-300 to-orange-400" },
  { label: "Cuidado personal", value: "21%", tone: "from-fuchsia-300 to-violet-400" },
]

const floatingNodes = [
  { className: "left-[8%] top-[28%] h-2 w-2 bg-cyan-200", delay: 0 },
  { className: "left-[34%] top-[14%] h-1.5 w-1.5 bg-blue-200", delay: 0.7 },
  { className: "left-[58%] top-[74%] h-2 w-2 bg-emerald-200", delay: 1.2 },
  { className: "right-[16%] top-[22%] h-1.5 w-1.5 bg-fuchsia-200", delay: 1.7 },
  { className: "right-[9%] bottom-[18%] h-2 w-2 bg-cyan-100", delay: 2.2 },
]

const featureCards = [
  {
    icon: LineChart,
    title: "Dashboard vivo",
    description: "KPIs, progreso semanal y senales claras para decidir el siguiente paso.",
  },
  {
    icon: BrainCircuit,
    title: "Portafolio tecnico",
    description: "Proyectos, subtareas, skills, evidencias y caso profesional exportable.",
  },
  {
    icon: ShieldCheck,
    title: "Datos privados",
    description: "Sesion autenticada y registros asociados a tu propio usuario.",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert("Error: " + error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] font-sans text-white lifetrack-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(168,85,247,0.2),transparent_28%),radial-gradient(circle_at_64%_82%,rgba(20,184,166,0.18),transparent_34%)]" />
        <motion.div
          animate={{ opacity: [0.18, 0.34, 0.22], backgroundPosition: ["0px 0px", "64px 32px", "0px 0px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.052)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.04, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10"
        />
        <motion.div
          animate={{ x: [0, 24, -10, 0], y: [0, -18, 12, 0], scale: [1, 1.08, 0.98, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -18, 12, 0], y: [0, 16, -8, 0], scale: [1, 0.96, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 bottom-12 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[130px]"
        />
        {floatingNodes.map((node) => (
          <motion.span
            key={node.className}
            animate={{ opacity: [0.18, 0.85, 0.18], y: [0, -18, 0], scale: [0.8, 1.25, 0.8] }}
            transition={{ duration: 5.5, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute rounded-full shadow-[0_0_24px_currentColor] ${node.className}`}
          />
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.75, 1, 0.75] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
      />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_480px] lg:px-12">
        <div className="flex min-h-[560px] flex-col justify-between gap-10 py-4 lg:py-8">
          <motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.06 }}
                animate={{ boxShadow: ["0 0 26px rgba(34,211,238,0.20)", "0 0 48px rgba(34,211,238,0.34)", "0 0 26px rgba(34,211,238,0.20)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10"
              >
                <Zap className="h-5 w-5 text-cyan-200" fill="currentColor" />
                <motion.span
                  animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]"
                />
              </motion.div>
              <div className="min-w-0">
                <p className="text-xl font-black tracking-tight">
                  Life<span className="text-cyan-300">Track</span>
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Personal OS
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
              Sistema operativo personal
            </div>
          </motion.header>

          <div className="grid items-center gap-10 2xl:grid-cols-[minmax(0,1fr)_390px]">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <motion.div
                animate={{ opacity: [0.78, 1, 0.78] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Centro de control privado
              </motion.div>

              <h1 className="text-balance text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl 2xl:text-7xl">
                Mide tu progreso.
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Convierte tu vida en datos.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Un sistema premium para conectar salud, carrera y cuidado personal en un solo tablero con evidencias, metricas y foco profesional.
              </p>

              <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {systemSignals.map((signal, index) => (
                  <motion.div
                    key={signal.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.25 + index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                  >
                    <p className="text-xs font-semibold text-slate-500">{signal.label}</p>
                    <p className={`mt-2 bg-gradient-to-r ${signal.tone} bg-clip-text text-3xl font-black text-transparent`}>
                      {signal.value}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: signal.value }}
                        transition={{ duration: 1.2, delay: 0.5 + index * 0.12, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${signal.tone}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="relative hidden 2xl:block">
              <div className="absolute inset-8 rounded-full bg-cyan-300/10 blur-3xl" />
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
                className="relative aspect-square rounded-full border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_120px_rgba(8,47,73,0.5)] backdrop-blur"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-6 rounded-full border border-dashed border-cyan-200/20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-16 rounded-full border border-fuchsia-200/10"
                />
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.82, 1, 0.82] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-full w-full items-center justify-center rounded-full border border-cyan-300/20 bg-[#07111f]/80"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  >
                    <Orbit className="h-24 w-24 text-cyan-200/80" />
                  </motion.div>
                </motion.div>
                <div className="absolute left-8 top-16 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">
                  Salud activa
                </div>
                <div className="absolute right-2 top-1/2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200">
                  Carrera
                </div>
                <div className="absolute bottom-14 left-12 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-xs font-bold text-fuchsia-200">
                  Cuidado
                </div>
              </motion.div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {featureCards.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.55 + index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -5, borderColor: "rgba(103,232,249,0.28)" }}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl transition duration-300 hover:border-cyan-300/25 hover:bg-white/[0.06]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-200 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-bold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </motion.article>
              )
            })}
          </div>
        </div>

        <aside className="flex items-center justify-center py-4 lg:py-8">
          <div className="w-full max-w-[480px]">
            <motion.div
              initial={{ opacity: 0, x: 32, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.18, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 p-1 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
            >
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
              <motion.div
                animate={{ x: [0, -12, 0], y: [0, 12, 0], opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl"
              />
              <motion.div
                animate={{ x: [0, 14, 0], y: [0, -10, 0], opacity: [0.4, 0.76, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-28 left-8 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl"
              />

              <div className="relative rounded-[1.75rem] border border-white/[0.06] bg-[#08111f]/80 p-6 sm:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <motion.div
                      animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-300/10 text-blue-200"
                    >
                      <Fingerprint className="h-6 w-6" />
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tight text-white">Acceso neural</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Entra a tu sistema y continua registrando progreso real.
                    </p>
                  </div>

                  <motion.div
                    animate={{ opacity: [0.72, 1, 0.72] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200"
                  >
                    Seguro
                  </motion.div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Identificador
                    </Label>
                    <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@lifetrack.com"
                        required
                        className="h-14 rounded-2xl border-white/10 bg-white/[0.055] pl-11 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.55, ease: "easeOut" }}
                    className="space-y-2"
                  >
                    <div className="ml-1 flex items-center justify-between gap-4">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Clave maestra
                      </Label>
                      <a href="#" className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300 transition hover:text-cyan-100">
                        Recuperar
                      </a>
                    </div>
                    <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="h-14 rounded-2xl border-white/10 bg-white/[0.055] pl-11 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.65, ease: "easeOut" }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="group relative mt-3 h-14 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-base font-black text-white shadow-[0_18px_45px_-18px_rgba(34,211,238,0.7)] transition hover:scale-[1.01] hover:from-cyan-300 hover:via-blue-400 hover:to-fuchsia-400 active:scale-[0.99]"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-full" />
                      {isLoading ? (
                        <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <span className="relative z-10">Entrar al centro de control</span>
                          <ArrowRight className="relative z-10 h-5 w-5 transition group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.75, ease: "easeOut" }}
                  className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-400">
                      Sesion protegida por Supabase Auth. Tus registros se cargan solo cuando entras con tu usuario.
                    </p>
                  </div>
                </motion.div>

                <p className="mt-8 text-center text-xs text-slate-500">
                  Sin acceso activo?{" "}
                  <span className="font-bold text-cyan-300 transition hover:text-cyan-100">
                    Contactar administrador
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </aside>
      </section>
    </main>
  )
}
