"use client"

import { usePathname } from "next/navigation"

export function DashboardContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullWidthPillar = pathname === "/pilares" || pathname === "/pilares/salud" || pathname === "/pilares/carrera" || pathname === "/pilares/cuidado-personal" || pathname === "/portafolio" || pathname === "/historial" || pathname === "/calendario"

  return (
    <div className={isFullWidthPillar
      ? "mx-auto w-full max-w-none px-0 pb-12"
      : "mx-auto w-full max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-8"}>
      {children}
    </div>
  )
}
