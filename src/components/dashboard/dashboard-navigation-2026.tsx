"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, ArrowUpRight, BriefcaseBusiness, ChevronDown, HeartPulse, LoaderCircle, LogOut, Menu, Moon, Sun, UserRound, type LucideIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {
  items: { title: string; url: string; icon: LucideIcon }[]
  displayName: string; initials: string; theme: string | undefined
  setTheme: (theme: string) => void; mounted: boolean; onLogout: () => Promise<void>
}

export function DashboardNavigation2026({ items, displayName, initials, theme, setTheme, mounted, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const dark = mounted && theme === "dark"
  const pillars = [
    { label: "Salud física", href: "/pilares/salud", tone: "health", icon: HeartPulse },
    { label: "Data & Carrera", href: "/pilares/carrera", tone: "career", icon: BriefcaseBusiness },
    { label: "Cuidado personal", href: "/pilares/cuidado-personal", tone: "care", icon: UserRound },
  ]
  const active = (href: string) => pathname === href || (href === "/pilares" && pathname.startsWith("/pilares/"))
  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try { await onLogout() } finally { setLoggingOut(false) }
  }
  const brand = <Link href="/dashboard" aria-label="LifeTrack, ir al Dashboard" className="lt26-brand"><Image src="/images/lifetrack/2026/lifetrack-mark.svg" alt="" width={36} height={36} unoptimized /><span>LifeTrack</span></Link>
  const appearance = <button className="lt26-icon-button" type="button" disabled={!mounted} onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Cambiar modo visual" title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>{dark ? <Moon size={18} /> : <Sun size={18} />}</button>
  return <>
    <a className="lt26-skip" href="#lt26-content">Ir al contenido</a>
    <header className="lt26-topbar">
      <div className="lt26-topbar-inner">
        {brand}
        <nav aria-label="Navegación principal" className="lt26-topnav">
          {items.map(({ title, url, icon: Icon }) => url === "/pilares" ? <DropdownMenu key={url} modal={false}>
            <DropdownMenuTrigger asChild><button type="button" className="lt26-topnav-item" data-current={active(url) || undefined}><Icon size={17} strokeWidth={1.7} /><span>{title}</span><ChevronDown size={14} className="lt26-menu-chevron" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={10} className="lt26-nav-popover lt26-pillars-popover">
              {pillars.map(({ label, href, tone, icon: PillarIcon }) => <DropdownMenuItem key={href} asChild><Link href={href} data-tone={tone}><PillarIcon size={19} /><span>{label}</span><ArrowUpRight size={15} /></Link></DropdownMenuItem>)}
              <DropdownMenuItem asChild><Link href="/pilares" className="lt26-all-pillars"><Activity size={17} /><span>Ver todos los pilares</span><ArrowUpRight size={15} /></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> : <Link key={url} href={url} className="lt26-topnav-item" aria-current={active(url) ? "page" : undefined}><Icon size={17} strokeWidth={1.7} /><span>{title}</span></Link>)}
        </nav>
        <div className="lt26-topbar-controls">
          <span className="lt26-desktop-appearance">{appearance}</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild><button type="button" className="lt26-user-trigger" aria-label={`Menú de ${displayName}`} title={displayName}><span className="lt26-initials">{initials}</span><span className="lt26-user-name">{displayName.split(" ")[0]}</span><ChevronDown size={14} className="lt26-menu-chevron" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="lt26-nav-popover lt26-user-popover">
              <div className="lt26-menu-identity"><strong>{displayName}</strong><span>Mi espacio personal</span></div>
              <DropdownMenuItem disabled={!mounted} onSelect={() => setTheme(dark ? "light" : "dark")}><Moon size={17} /><span>{dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}</span></DropdownMenuItem>
              <DropdownMenuItem disabled={loggingOut} onSelect={() => { void logout() }}>{loggingOut ? <LoaderCircle size={17} /> : <LogOut size={17} />}<span>{loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><button type="button" className="lt26-icon-button lt26-navigation-toggle" aria-label="Abrir navegación"><Menu size={22} /></button></SheetTrigger>
            <SheetContent side="right" className="lt26-mobile-menu">
              <SheetHeader className="sr-only"><SheetTitle>Navegación de LifeTrack</SheetTitle><SheetDescription>Accede a tus registros, proyectos y pilares.</SheetDescription></SheetHeader>
              {brand}
              <nav aria-label="Navegación móvil" className="lt26-nav">
                {items.map(({ title, url, icon: Icon }) => <Link key={url} href={url} aria-current={active(url) ? "page" : undefined} onClick={() => setOpen(false)}><Icon size={18} strokeWidth={1.7} /><span>{title}</span></Link>)}
              </nav>
              <div className="lt26-nav-divider" />
              <nav aria-label="Pilares de LifeTrack" className="lt26-nav lt26-pillar-nav">
                {pillars.map(({ label, href, tone, icon: Icon }) => <Link key={href} href={href} data-tone={tone} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span><ArrowUpRight size={15} /></Link>)}
              </nav>
              <div className="lt26-mobile-controls">{appearance}<span>Modo {dark ? "oscuro" : "claro"}</span><button type="button" className="lt26-icon-button" disabled={loggingOut} onClick={() => { void logout() }} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  </>
}
