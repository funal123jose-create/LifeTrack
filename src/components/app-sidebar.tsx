"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
  LayoutGrid,
  Zap,
  LogOut,
  Sun,
  Moon,
  User,
  PanelTop,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Pilares", url: "/pilares", icon: Zap },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("Cargando...")

  const supabase = createClient()

  React.useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          setDisplayName(profile.full_name || profile.username || "Usuario")
        }
      }
    }

    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = React.useMemo(() => {
    if (!displayName || displayName === "Cargando...") return "LT"

    const parts = displayName
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length === 0) return "LT"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }, [displayName])

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.04] bg-[#080c14]/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* LADO IZQUIERDO: LOGO Y PATH */}
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400 transition-all group-hover:bg-blue-500/20">
              <Zap size={16} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold tracking-tight text-slate-100">
                Life<span className="font-medium text-blue-400">Track</span>
              </span>
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-white/[0.06] sm:block" />

          <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <PanelTop size={13} className="text-slate-500" />
            <span className="text-slate-500">/</span>
            <span>
              {pathname === "/pilares" ? "Pilares" : pathname.startsWith("/pilares/") ? "Detalle" : "Dashboard"}
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="hidden items-center gap-1 rounded-xl border border-white/[0.02] bg-slate-900/40 p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.url ||
              (item.url === "/pilares" && pathname.startsWith("/pilares/"))

            return (
              <Link
                key={item.title}
                href={item.url}
                className={`group relative flex h-8 items-center gap-2 overflow-hidden rounded-lg px-3.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-blue-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="top-nav-active-underline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_14px_rgba(96,165,250,0.75)]"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}

                <span
                  className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
                    isActive
                      ? "bg-blue-500/[0.035] opacity-100"
                      : "bg-white/[0.035] opacity-0 group-hover:opacity-100"
                  }`}
                />

                <Icon
                  size={13}
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-400"
                  }`}
                />
                <span className="relative z-10">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* PERFIL / ACCIONES */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] text-slate-400 transition hover:text-slate-200"
            title="Cambiar modo visual"
          >
            {mounted && theme === "dark" ? (
              <Moon size={14} />
            ) : (
              <Sun size={14} />
            )}
          </button>

          <div className="hidden items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.01] p-1 pr-3 sm:flex">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/10 text-[11px] font-bold text-blue-400">
              {initials}
            </div>
            <p className="max-w-[100px] truncate text-xs font-medium text-slate-300">
              {displayName}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 text-slate-500 transition hover:text-rose-400"
              title="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          </div>

          <Button
            onClick={handleLogout}
            className="flex h-8 w-8 rounded-lg border border-white/[0.05] bg-white/[0.02] p-0 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 sm:hidden"
            title="Cerrar sesión"
          >
            <User size={14} />
          </Button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      <div className="flex w-full gap-1 overflow-x-auto border-t border-white/[0.02] bg-slate-950/20 px-4 py-1.5 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.url ||
            (item.url === "/pilares" && pathname.startsWith("/pilares/"))

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`relative flex items-center gap-1.5 overflow-hidden rounded-md px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_14px_rgba(96,165,250,0.75)]"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}

              <span
                className={`absolute inset-0 rounded-md transition-opacity ${
                  isActive ? "bg-blue-500/[0.045] opacity-100" : "opacity-0"
                }`}
              />

              <Icon size={12} className="relative z-10" />
              <span className="relative z-10">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </header>
  )
}
