"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"
import {
  Heart,
  Briefcase,
  Target,
  ArrowRight,
  Activity,
  Code,
  Sparkles,
  Zap,
  ShieldCheck,
  Orbit,
  Flame,
  TrendingUp,
  CalendarCheck2,
  Dumbbell,
  Database,
  BrainCircuit,
  CheckCircle2,
  CircleDotDashed
} from "lucide-react"
import Link from "next/link"

function AnimatedLifeGrid() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_55%_88%,rgba(249,115,22,0.14),transparent_34%),linear-gradient(135deg,#020617_0%,#030712_46%,#09090b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:78px_78px] [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />

      <motion.div
        animate={{ x: [0, 28, -18, 0], y: [0, -18, 22, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[16%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -24, 18, 0], y: [0, 20, -18, 0], scale: [1, 0.94, 1.09, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 18, -20, 0], y: [0, -24, 16, 0], scale: [1, 1.1, 0.98, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[4%] left-[42%] h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.82)_100%)]" />
    </div>
  )
}

export default function PilaresMenuPage() {

  // Configuración de las tarjetas de los 3 Pilares
  const pilares = [
    {
      title: "Salud Física",
      subtitle: "Cuerpo en alto rendimiento",
      description: "Monitorea tu hidratación diaria, presupuesto calórico y planifica tu calendario semanal de entrenamiento.",
      longDescription: "Convierte tus rutinas, calorías y hábitos físicos en un sistema visual para mantener energía, disciplina y constancia semana tras semana.",
      icon: <Heart className="text-emerald-300" size={26} />,
      heroIcon: Dumbbell,
      badge: "Sincronizado",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
      href: "/pilares/salud",
      actionText: "Gestionar Salud",
      borderHover: "group-hover:border-emerald-400/35",
      gradient: "from-emerald-500/22 via-teal-400/10 to-transparent",
      glow: "group-hover:shadow-[0_28px_70px_-28px_rgba(16,185,129,0.65)]",
      accent: "text-emerald-300",
      ring: "border-emerald-400/20 bg-emerald-500/10",
      stats: ["Hidratación", "Calorías", "Rutina semanal"],
      extraInfo: <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium"><Activity size={12} /> Métricas de Bio-telemetría activas</div>
    },
    {
      title: "Data & Carrera",
      subtitle: "Portafolio profesional",
      description: "Gestiona tu portafolio de proyectos, tecnologías dominadas y haz seguimiento a tus metas profesionales.",
      longDescription: "Organiza tu evolución como profesional tech: proyectos, stacks, entregables, avances y objetivos de carrera en una matriz centralizada.",
      icon: <Briefcase className="text-blue-300" size={26} />,
      heroIcon: Database,
      badge: "Sincronizado",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-400/20",
      href: "/pilares/carrera",
      actionText: "Gestionar Proyectos",
      borderHover: "group-hover:border-blue-400/35",
      gradient: "from-blue-500/22 via-cyan-400/10 to-transparent",
      glow: "group-hover:shadow-[0_28px_70px_-28px_rgba(59,130,246,0.65)]",
      accent: "text-blue-300",
      ring: "border-blue-400/20 bg-blue-500/10",
      stats: ["Proyectos", "Tecnologías", "Metas tech"],
      extraInfo: <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium"><Code size={12} /> Control de CRUD de proyectos</div>
    },
    {
      title: "Hábitos & Crecimiento",
      subtitle: "Disciplina diaria",
      description: "Construye tu disciplina diaria. Añade, edita y realiza el checklist de tus hábitos personalizados.",
      longDescription: "Diseña un sistema de mejora continua para sostener hábitos, ordenar prioridades y mantener enfoque personal todos los días.",
      icon: <Target className="text-orange-300" size={26} />,
      heroIcon: BrainCircuit,
      badge: "Por configurar",
      badgeColor: "bg-orange-500/10 text-orange-300 border-orange-400/20",
      href: "/pilares/habitos",
      actionText: "Gestionar Hábitos",
      borderHover: "group-hover:border-orange-400/35",
      gradient: "from-orange-500/24 via-amber-400/10 to-transparent",
      glow: "group-hover:shadow-[0_28px_70px_-28px_rgba(249,115,22,0.68)]",
      accent: "text-orange-300",
      ring: "border-orange-400/20 bg-orange-500/10",
      stats: ["Checklist", "Rachas", "Crecimiento"],
      extraInfo: <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium"><Sparkles size={12} /> Matriz de hábitos diarios</div>
    }
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 26, scale: 0.96, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 110, damping: 18 }
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-14 pt-6 text-slate-100 antialiased md:px-8">
      <AnimatedLifeGrid />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Encabezado Principal de la Sección */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_65%_0%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_92%_65%,rgba(249,115,22,0.14),transparent_32%)]" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/40 via-blue-400/40 to-transparent" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.38em] text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
                <Target size={14} className="animate-pulse" /> Sistema de Núcleos
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
                  Gestión de <span className="bg-gradient-to-r from-emerald-300 via-blue-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(59,130,246,0.22)]">Pilares de Vida</span>
                </h2>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Selecciona un pilar fundamental para registrar actividades, auditar proyectos, planificar rutinas y controlar tu evolución personal desde un solo centro visual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/[0.07] bg-slate-950/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <div className="rounded-2xl bg-emerald-500/[0.08] px-4 py-4 text-center">
                <ShieldCheck className="mx-auto mb-2 text-emerald-300" size={18} />
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">Salud</p>
                <p className="mt-1 text-2xl font-black text-white">01</p>
              </div>
              <div className="rounded-2xl bg-blue-500/[0.08] px-4 py-4 text-center">
                <TrendingUp className="mx-auto mb-2 text-blue-300" size={18} />
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-300/80">Carrera</p>
                <p className="mt-1 text-2xl font-black text-white">02</p>
              </div>
              <div className="rounded-2xl bg-orange-500/[0.08] px-4 py-4 text-center">
                <CalendarCheck2 className="mx-auto mb-2 text-orange-300" size={18} />
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-300/80">Hábitos</p>
                <p className="mt-1 text-2xl font-black text-white">03</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid de los 3 Pilares */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 lg:grid-cols-3"
        >
          {pilares.map((pilar, index) => {
            const HeroIcon = pilar.heroIcon

            return (
              <motion.div variants={cardVariants} key={index} className="group min-h-[540px]">
                <Card className={`relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/[0.075] bg-white/[0.045] shadow-[0_24px_75px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-all duration-500 ${pilar.borderHover} ${pilar.glow} hover:-translate-y-2`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${pilar.gradient} opacity-90 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%)] opacity-70" />
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.045] blur-3xl transition-all duration-700 group-hover:scale-125" />
                  <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />

                  <div className="relative">
                    <CardHeader className="space-y-6 p-6 pb-4">
                      {/* Icono + Badge de Estado */}
                      <div className="flex items-center justify-between">
                        <motion.div
                          animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
                          transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border ${pilar.ring} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-500 group-hover:scale-110`}
                        >
                          <div className="absolute inset-0 rounded-2xl bg-white/[0.04]" />
                          {pilar.icon}
                        </motion.div>

                        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${pilar.badgeColor}`}>
                          {pilar.badge}
                        </span>
                      </div>

                      <div className="relative flex min-h-[150px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-slate-950/35">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                          className="absolute h-36 w-36 rounded-full border border-dashed border-white/10"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                          className="absolute h-24 w-24 rounded-full border border-dashed border-white/10"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 1, 0.55] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className={`relative flex h-20 w-20 items-center justify-center rounded-full border ${pilar.ring}`}
                        >
                          <HeroIcon size={34} className={pilar.accent} />
                        </motion.div>

                        <Orbit size={18} className="absolute right-5 top-5 text-white/20" />
                        <Zap size={16} className="absolute bottom-5 left-5 text-white/20" />
                      </div>

                      {/* Títulos */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${pilar.accent}`}>{pilar.subtitle}</p>
                          <CardTitle className="text-2xl font-black tracking-tight text-white md:text-3xl">
                            {pilar.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-sm font-medium leading-relaxed text-slate-400">
                          {pilar.description}
                        </CardDescription>
                        <p className="text-xs font-medium leading-relaxed text-slate-500">
                          {pilar.longDescription}
                        </p>
                      </div>
                    </CardHeader>
                  </div>

                  {/* Footer de la tarjeta con acción */}
                  <CardContent className="relative space-y-5 p-6 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                      {pilar.stats.map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.055] bg-slate-950/38 px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <CircleDotDashed size={13} className={`mx-auto mb-1.5 ${pilar.accent}`} />
                          <p className="text-[8px] font-black uppercase leading-tight tracking-widest text-slate-400">{stat}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/[0.055] bg-slate-950/35 p-4">
                      <div className="flex items-center justify-between gap-3">
                        {pilar.extraInfo}
                        <CheckCircle2 size={15} className={pilar.accent} />
                      </div>
                    </div>

                    <Link href={pilar.href} className="block w-full">
                      <Button className="group/btn relative h-12 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_16px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100">
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                        <span className="relative flex items-center justify-center gap-2">
                          {pilar.actionText}
                          <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.65 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_88%_50%,rgba(249,115,22,0.10),transparent_24%)]" />
          <div className="relative flex flex-col gap-3 text-center md:flex-row md:items-center md:justify-center md:text-left">
            <Flame className="mx-auto text-orange-300 md:mx-0" size={18} />
            <p className="text-xs font-semibold leading-relaxed text-slate-400 md:text-sm">
              Cada pilar funciona como un módulo independiente de tu sistema personal: cuerpo, carrera y disciplina trabajando como una sola arquitectura de crecimiento.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
