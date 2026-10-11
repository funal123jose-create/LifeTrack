import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "LifeTrack | Inicia sesión",
  icons: { icon: "/images/lifetrack/2026/lifetrack-mark.svg" },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
