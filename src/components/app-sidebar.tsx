"use client"

import * as React from "react"
import { LayoutGrid, Zap, Target, BarChart2, Settings, LogOut, Sun, Moon, User, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client" // Importación dinámica
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Resumen Hoy", url: "/dashboard", icon: LayoutGrid },
  { title: "Pilares", url: "/pilares", icon: Zap },
  { title: "Objetivos", url: "/objetivos", icon: Target },
  { title: "Analítica", url: "/stats", icon: BarChart2 },
  { title: "Configuración", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // --- Lógica de Usuario para el Sidebar ---
  const [displayName, setDisplayName] = React.useState("Cargando...")
  const supabase = createClient()

  React.useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          // Si existe nombre completo lo usamos, si no el username
          setDisplayName(profile.full_name || profile.username || "Usuario")
        }
      }
    }
    fetchUser()
  }, [supabase])
  // ----------------------------------------

  return (
    <Sidebar className="sticky top-0 h-screen shrink-0 overflow-hidden border-r border-white/[0.06] bg-[#02040a] shadow-[18px_0_55px_rgba(0,0,0,0.34)]">
      {/* FONDO DARK CLEAN DEL SIDEBAR */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.13),transparent_30%),radial-gradient(circle_at_80%_92%,rgba(249,115,22,0.07),transparent_34%),linear-gradient(180deg,#050914_0%,#030712_46%,#02040a_100%)]" />
      <div className="absolute inset-0 z-0 opacity-[0.22] bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.030)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <motion.div
        animate={{ y: ["-20%", "120%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 top-0 z-0 h-36 w-full bg-gradient-to-b from-transparent via-blue-300/[0.035] to-transparent"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [0.96, 1.08, 0.96] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-16 z-0 h-52 w-52 rounded-full bg-blue-500/[0.08] blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.13, 0.05], scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 bottom-20 z-0 h-48 w-48 rounded-full bg-orange-500/[0.07] blur-3xl"
      />

      {/* Línea superior sutil */}
      <div className="absolute left-0 top-0 z-0 h-px w-full bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

      <SidebarHeader className="relative z-10 p-5 pb-4">
        <motion.div
          whileHover={{ scale: 1.015 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="group flex cursor-pointer items-center gap-3 rounded-[1.35rem] border border-white/[0.055] bg-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
        >
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/[0.18] shadow-[0_0_24px_rgba(37,99,235,0.22)]"
          >
            <Zap size={21} fill="white" className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
          </motion.div>
          <div className="min-w-0">
            <span className="block truncate text-[1.35rem] font-black tracking-[-0.06em] text-white">
              Life<span className="bg-gradient-to-r from-blue-300 to-sky-200 bg-clip-text text-transparent">Track</span>
            </span>
            <span className="block text-[8px] font-black uppercase tracking-[0.32em] text-slate-500">
              Personal OS
            </span>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 flex-1 overflow-y-auto px-4 py-2">
        <SidebarMenu className="gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`
                    group/nav relative h-11 overflow-hidden rounded-2xl px-3.5 transition-all duration-300
                    ${isActive 
                      ? "border border-blue-400/20 bg-blue-500/[0.13] text-blue-200 shadow-[0_12px_28px_rgba(37,99,235,0.13)]" 
                      : "border border-transparent text-slate-500 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100"
                    }
                  `}
                >
                  <a href={item.url} className="flex w-full items-center gap-3">
                    {isActive && (
                      <>
                        <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.70)]" />
                        <motion.div layoutId="activeNavGlow" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/[0.12] via-blue-500/[0.04] to-transparent" />
                      </>
                    )}

                    <span
                      className={`
                        relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-300
                        ${isActive
                          ? "border-blue-300/18 bg-blue-500/[0.12] text-blue-300"
                          : "border-white/[0.04] bg-white/[0.018] text-slate-500 group-hover/nav:border-white/[0.08] group-hover/nav:text-slate-200"
                        }
                      `}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "drop-shadow-[0_0_10px_rgba(96,165,250,0.45)]" : ""}`} />
                    </span>

                    <span className="relative z-10 flex-1 text-sm font-bold tracking-wide">
                      {item.title}
                    </span>

                    <ChevronRight
                      size={14}
                      className={`
                        relative z-10 transition-all duration-300
                        ${isActive ? "translate-x-0 text-blue-300 opacity-100" : "-translate-x-1 text-slate-600 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100"}
                      `}
                    />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="relative z-10 mt-auto space-y-3 p-4">
        {/* INTERRUPTOR DE TEMA DARK CLEAN */}
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 360, damping: 22 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-white/[0.07] bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl transition-all hover:border-blue-300/18 hover:bg-white/[0.035]"
        >
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {mounted && (theme === 'dark' ? <Moon size={14} className="text-blue-300"/> : <Sun size={14} className="text-amber-300"/>)}
            <span>Visual Mode</span>
          </div>

          <div className="relative h-8 w-14 overflow-hidden rounded-xl border border-white/[0.055] bg-[#050914]">
            <motion.div 
              animate={{ x: theme === 'dark' ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200/20 bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.45)]"
            >
              {mounted && (theme === 'dark' ? <Moon size={12} className="text-white"/> : <Sun size={12} className="text-white"/>)}
            </motion.div>
          </div>
        </motion.div>

        {/* Perfil con Efecto Glass y Nombre Dinámico */}
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="group/profile relative overflow-hidden rounded-[1.35rem] border border-white/[0.075] bg-white/[0.035] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.11),transparent_35%),radial-gradient(circle_at_95%_80%,rgba(249,115,22,0.055),transparent_38%)] opacity-80" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-2xl border border-blue-300/20 bg-blue-500/[0.10] p-[2px] shadow-[0_0_18px_rgba(37,99,235,0.15)]">
              <div className="flex h-full w-full items-center justify-center rounded-[0.85rem] bg-[#050914]">
                <User size={16} className="text-blue-300" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-white">
                {displayName}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-blue-300/85">Core Member</p>
            </div>

            <button
              type="button"
              className="rounded-xl p-2 text-slate-500 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-300"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}
