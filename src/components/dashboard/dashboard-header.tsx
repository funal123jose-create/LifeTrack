"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { LogOut, Menu, Moon, Sun, X, type LucideIcon } from "lucide-react"

type NavItem = { title: string; url: string; icon: LucideIcon }

type DashboardHeaderProps = {
  items: NavItem[]
  displayName: string
  initials: string
  theme: string | undefined
  setTheme: (theme: string) => void
  mounted: boolean
  onLogout: () => void
}

export function DashboardHeader({
  items, displayName, initials, theme, setTheme, mounted, onLogout,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLButtonElement>(null)
  const firstLinkRef = React.useRef<HTMLAnchorElement>(null)
  const headerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!open) return
    firstLinkRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        menuRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  const isActive = (url: string) => pathname === url || (url === "/pilares" && pathname.startsWith("/pilares/"))

  return (
    <header ref={headerRef} className="dashboard-header">
      <div className="dashboard-header__inner">
        <Link href="/dashboard" className="dashboard-header__brand" aria-label="LifeTrack, ir al Dashboard">
          <span className="dashboard-header__mark"><Image src="/images/lifetrack/lifetrack-mark.png" width={46} height={35} alt="" priority /></span>
          <span className="dashboard-header__wordmark">Life<span>Track</span></span>
        </Link>

        <nav className="dashboard-header__nav" aria-label="Navegación principal">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.url} href={item.url} aria-current={isActive(item.url) ? "page" : undefined} className={`dashboard-header__link ${isActive(item.url) ? "is-active" : ""}`}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="dashboard-header__actions">
          <button type="button" className="dashboard-header__icon-button dashboard-header__theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Cambiar modo visual" aria-label="Cambiar modo visual">
            {mounted && theme === "dark" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
          </button>
          <div className="dashboard-header__account">
            <span className="dashboard-header__avatar" aria-hidden="true">{initials}</span>
            <span className="dashboard-header__account-name" title={displayName}>{displayName}</span>
            <button type="button" className="dashboard-header__icon-button" onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={17} /></button>
          </div>
          <button ref={menuRef} type="button" className="dashboard-header__menu-button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar navegación" : "Abrir navegación"} aria-expanded={open} aria-controls="dashboard-mobile-navigation">
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="dashboard-mobile-navigation"
            className="dashboard-header__mobile-nav"
            aria-label="Navegación móvil"
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: .18, ease: "easeOut" }}
          >
            <div className="dashboard-header__mobile-list">
              {items.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    key={item.url}
                    href={item.url}
                    aria-current={isActive(item.url) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`dashboard-header__mobile-link ${isActive(item.url) ? "is-active" : ""}`}
                  >
                    <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
            <div className="dashboard-header__mobile-footer">
              <span className="dashboard-header__avatar" aria-hidden="true">{initials}</span>
              <span className="dashboard-header__account-name" title={displayName}>{displayName}</span>
              <button type="button" onClick={onLogout} className="dashboard-header__mobile-logout"><LogOut size={17} aria-hidden="true" />Salir</button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
