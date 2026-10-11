"use client"

import { PillarFilter } from "@/components/pillars/pillar-filter"

export function HealthPeriodSelect({ label, value, onChange, children }: {
  label: string
  value: string | number
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return <PillarFilter label={label} value={value} onChange={onChange} tone="health">{children}</PillarFilter>
}
