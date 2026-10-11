"use client"

import { PillarDateField } from "@/components/pillars/pillar-date-field"

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  required?: boolean
}

export function CareerDateField({ id, label, value, onChange, min, required }: Props) {
  return <PillarDateField id={id} label={label} value={value} onChange={onChange} min={min} required={required} tone="career" />
}
