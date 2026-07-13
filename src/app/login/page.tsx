"use client"

import { useState } from "react"
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Flame,
  HeartPulse,
  Loader2,
  LockKeyhole,
  Mail,
  Play,
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

const leftStats = [
  { label: "Salud", value: "20%", tone: "from-cyan-200 to-emerald-300" },
  { label: "Carrera", value: "32%", tone: "from-blue-200 to-cyan-300" },
  { label: "Cuidado", value: "21%", tone: "from-violet-200 to-fuchsia-300" },
]

const navItems = ["Inicio", "Habitos", "Carrera", "Salud", "Cuidado"]

const accessBenefits = [
  { icon: BarChart3, label: "Dashboard vivo" },
  { icon: HeartPulse, label: "Rutinas y salud" },
  { icon: ShieldCheck, label: "Datos privados" },
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#111419] font-sans text-white lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(29,78,216,0.20),transparent_28%),radial-gradient(circle_at_72%_76%,rgba(34,211,238,0.13),transparent_28%),linear-gradient(90deg,#111419_0%,#12151b_58%,#17181d_100%)]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 gap-3 p-3 lg:h-screen lg:grid-cols-[minmax(0,1.52fr)_minmax(420px,0.88fr)] lg:gap-0 lg:p-4 xl:p-5">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[640px] overflow-hidden rounded-[1.15rem] border border-white/[0.035] bg-[#102a63] shadow-[0_32px_120px_rgba(0,0,0,0.45)] lg:min-h-[calc(100vh-2rem)] xl:min-h-[calc(100vh-2.5rem)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(88,54,235,0.94),rgba(69,105,238,0.82)_46%,rgba(96,91,238,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,rgba(255,255,255,0.16),transparent_20%),radial-gradient(circle_at_62%_22%,rgba(34,211,238,0.13),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(167,139,250,0.18),transparent_28%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(0deg,rgba(18,24,70,0.28),transparent)]" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.20]">
            <div className="absolute left-[6%] top-[23%] h-56 w-80 rounded-[45%] bg-white/18 blur-[1px]" />
            <div className="absolute right-[12%] top-[9%] h-72 w-64 rounded-[42%] bg-blue-100/12 blur-[1px]" />
            <div className="absolute left-[16%] bottom-[31%] h-64 w-72 rounded-[44%] bg-cyan-100/12 blur-[1px]" />
          </div>

          <div className="pointer-events-none absolute bottom-[-7%] left-[-2%] h-[43%] w-[78%] rotate-[12deg] rounded-[2.5rem] border border-white/10 bg-white/[0.10] opacity-45 blur-[0.2px] shadow-[0_28px_90px_rgba(15,23,42,0.24)]" />
          <div className="pointer-events-none absolute bottom-[10%] left-[2%] h-[16%] w-[68%] rotate-[12deg] rounded-xl bg-white/[0.12] opacity-35">
            <div className="absolute inset-x-8 top-5 grid grid-cols-8 gap-4">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={index} className="h-3 rounded-sm bg-white/18" />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute right-[7%] top-[16%] hidden w-[34%] space-y-3 font-mono text-[12px] leading-none text-blue-50/20 lg:block">
            <p>{"const progreso = medir(habitos)"}</p>
            <p>{"if (enfoque) sincronizarSemana()"}</p>
            <p>{"salud.map((dia) => energia + datos)"}</p>
            <p>{"career.track({ skills, evidencia })"}</p>
            <p>{"return vida.convertidaEnDatos()"}</p>
          </div>

          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-28 h-72 w-72 rounded-[5rem] bg-white/10 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 22, 0], rotate: [0, -7, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-16 top-20 h-80 w-72 rounded-[6rem] bg-cyan-200/10 blur-sm"
          />
          <motion.div
            animate={{ opacity: [0.28, 0.58, 0.28], scale: [1, 1.06, 1] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-20 h-[340px] w-[520px] rounded-full bg-blue-200/12 blur-3xl"
          />

          <div className="relative flex min-h-full flex-col px-7 py-7 sm:px-12 sm:py-10 lg:px-16 xl:px-24">
            <motion.header
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.06 }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100/20 bg-white/10 shadow-[0_0_34px_rgba(34,211,238,0.28)]"
                >
                  <Zap className="h-5 w-5 text-cyan-100" fill="currentColor" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
                </motion.div>
                <div>
                  <p className="text-lg font-black tracking-tight text-white">
                    Life<span className="text-cyan-200">Track</span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100/55">Personal OS</p>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-bold text-cyan-50/80 backdrop-blur-md md:flex">
                <Sparkles className="h-3.5 w-3.5 text-cyan-100" />
                Seguimiento inteligente
              </div>
            </motion.header>

            <div className="flex flex-1 items-center py-14 lg:py-10">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
                className="w-full max-w-[760px]"
              >
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-50 shadow-[0_14px_42px_rgba(8,47,73,0.24)] backdrop-blur-md">
                  <Activity className="h-4 w-4" />
                  Centro de control personal
                </div>

                <h1 className="max-w-[720px] text-balance text-[clamp(3.4rem,6.7vw,6.7rem)] font-black leading-[0.96] tracking-[-0.045em] text-white drop-shadow-[0_22px_55px_rgba(15,23,42,0.30)]">
                  Mide tu progreso.
                  <span className="block">Convierte tu vida en datos.</span>
                </h1>

                <p className="mt-7 max-w-[610px] text-base leading-8 text-blue-50/78 sm:text-lg">
                  Organiza salud, carrera y cuidado personal en un solo sistema visual para tomar mejores decisiones cada semana.
                </p>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <motion.button
                    type="button"
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex h-16 w-fit items-center gap-4 rounded-full bg-[#15191f] px-5 pr-7 text-sm font-black text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)] transition"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cyan-100 transition group-hover:bg-cyan-300/20">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                    Ver experiencia
                  </motion.button>

                  <div className="grid grid-cols-3 gap-3">
                    {leftStats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.45 + index * 0.08, ease: "easeOut" }}
                        className="min-w-[92px] rounded-2xl border border-white/12 bg-white/[0.075] px-3 py-2.5 backdrop-blur-md"
                      >
                        <p className="text-[11px] font-bold text-blue-50/58">{stat.label}</p>
                        <p className={`mt-1 bg-gradient-to-r ${stat.tone} bg-clip-text text-xl font-black text-transparent`}>
                          {stat.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.nav
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
              className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-semibold text-blue-50/62"
            >
              {navItems.map((item) => (
                <span key={item} className="transition hover:text-white">
                  {item}
                </span>
              ))}
            </motion.nav>
          </div>
        </motion.div>

        <aside className="relative flex min-h-[640px] items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/[0.015] bg-[#181a20] px-6 py-10 shadow-[inset_1px_0_0_rgba(255,255,255,0.018)] lg:min-h-[calc(100vh-2rem)] lg:rounded-l-none xl:min-h-[calc(100vh-2.5rem)] xl:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_18%,rgba(37,99,235,0.16),transparent_26%),radial-gradient(circle_at_24%_86%,rgba(168,85,247,0.14),transparent_28%)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.035] to-transparent" />

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[430px]"
          >
            <div className="mb-8">
              <motion.div
                animate={{ rotate: [0, 6, -6, 0], opacity: [0.74, 1, 0.74] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="mb-7 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100"
              >
                <Flame className="h-4 w-4" />
              </motion.div>

              <h2 className="max-w-[360px] text-balance text-3xl font-black leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                Entra a tu sistema de progreso personal
              </h2>
              <p className="mt-4 max-w-[360px] text-sm leading-7 text-slate-400">
                Continua midiendo habitos, avances profesionales y bienestar desde tu tablero privado de LifeTrack.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="sr-only">
                  Correo electronico
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@lifetrack.com"
                    required
                    className="h-[54px] rounded-lg border-white/[0.075] bg-[#1d2027] pl-12 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition placeholder:text-slate-500 hover:border-blue-300/18 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20 [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(29,32,39,0.98)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.43, ease: "easeOut" }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="sr-only">
                  Clave de acceso
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Clave de acceso"
                    required
                    className="h-[54px] rounded-lg border-white/[0.075] bg-[#1d2027] pl-12 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition placeholder:text-slate-500 hover:border-blue-300/18 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20 [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(29,32,39,0.98)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.51, ease: "easeOut" }}
                className="flex items-center justify-between gap-4 pt-1"
              >
                <label className="flex min-w-0 items-center gap-3 text-xs font-semibold leading-5 text-slate-400">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.36)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  Sesion protegida por Supabase Auth
                </label>
                <a href="#" className="shrink-0 text-xs font-bold text-blue-300 transition hover:text-cyan-200">
                  Ayuda
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.59, ease: "easeOut" }}
                className="pt-3"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative h-[56px] w-full overflow-hidden rounded-lg border-0 bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 text-sm font-black text-white shadow-[0_18px_42px_rgba(37,99,235,0.30)] transition hover:translate-y-[-1px] hover:from-blue-400 hover:to-cyan-300 active:translate-y-0 disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                  {isLoading ? (
                    <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Entrar a LifeTrack</span>
                      <ArrowRight className="relative z-10 h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-xs font-semibold text-slate-500">Tu avance en un solo lugar</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {accessBenefits.map((benefit, index) => {
                const Icon = benefit.icon

                return (
                  <motion.div
                    key={benefit.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.7 + index * 0.08, ease: "easeOut" }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 text-center transition hover:border-blue-300/20 hover:bg-white/[0.055]"
                  >
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#20242d] text-cyan-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-[11px] font-bold leading-4 text-slate-400">{benefit.label}</p>
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-8 text-center text-xs font-semibold text-slate-500">
              Sin acceso activo?{" "}
              <span className="font-black text-blue-300 transition hover:text-cyan-200">
                Contactar administrador
              </span>
            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              <Fingerprint className="h-3.5 w-3.5" />
              Privado
              <ChevronRight className="h-3.5 w-3.5" />
              Seguro
              <ChevronRight className="h-3.5 w-3.5" />
              Medible
            </div>
          </motion.div>
        </aside>
      </section>
    </main>
  )
}
