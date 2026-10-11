"use client"

import { Children, useRef, type ReactNode } from "react"
import { Tabs } from "radix-ui"

// Force-mounted panels preserve drafts, editor selection and unsaved input state.
export function CareerDetailSections({ labels, children }: { labels: string[]; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  return <Tabs.Root defaultValue="0" className="career-detail-sections" onValueChange={() => { if (contentRef.current) contentRef.current.scrollTop = 0 }}>
    <Tabs.List className="career-detail-tabs" aria-label="Secciones del proyecto">
      {labels.map((label, index) => <Tabs.Trigger key={label} value={String(index)}>{label}</Tabs.Trigger>)}
    </Tabs.List>
    <div ref={contentRef} className="career-detail-content">
      {Children.toArray(children).map((child, index) => <Tabs.Content key={index} value={String(index)} forceMount className="career-detail-section">{child}</Tabs.Content>)}
    </div>
  </Tabs.Root>
}
