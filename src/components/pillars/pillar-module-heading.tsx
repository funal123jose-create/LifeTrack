"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { type PillarTone } from "./immersive-pillar-card"
import { PillarHeroArt } from "./pillar-hero-art"

export function PillarModuleHeading({ tone, title, description, children }: {
  tone: PillarTone; title: string; description: string; children?: React.ReactNode;
}) {
  return <header className="pillar-module-heading" data-tone={tone}>
    <div className="pillar-module-title">
      <Link href="/pilares" className="pillar-back"><ArrowLeft size={16} />Pilares</Link>
      <h1>{title}</h1><p>{description}</p>
      {children && <div className="pillar-module-actions">{children}</div>}
    </div>
    <PillarHeroArt tone={tone} />
  </header>
}
