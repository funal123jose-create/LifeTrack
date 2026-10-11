"use client"

import { useState } from "react"
import { Popover } from "radix-ui"
import { CalendarDays } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "react-day-picker/locale"
import "react-day-picker/style.css"
import "./pillar-date-field.css"

// Keep a native input for direct entry, form validation and mobile keyboards.
export function PillarDateField({ id, label, value, onChange, min, max, required, tone = "career" }: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  min?: string; max?: string; required?: boolean; tone?: "health" | "career" | "care";
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(`${value}T12:00:00`) : undefined
  const valid = selected && !Number.isNaN(selected.getTime()) ? selected : undefined
  const disabled = [...(min ? [{ before: new Date(`${min}T00:00:00`) }] : []), ...(max ? [{ after: new Date(`${max}T23:59:59`) }] : [])]
  return <div className="pillar-date-field">
    <label htmlFor={id}>{label}</label>
    <div className="pillar-date-control">
      <input id={id} type="date" value={value} min={min} max={max} required={required} onChange={(event) => onChange(event.target.value)} />
      <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <Popover.Trigger asChild><button type="button" aria-label={`Abrir calendario: ${label}`}><CalendarDays size={17} /></button></Popover.Trigger>
        <Popover.Portal><Popover.Content className="pillar-date-popover" data-tone={tone} sideOffset={6} collisionPadding={12} aria-label={`Elegir ${label.toLowerCase()}`}>
          <DayPicker mode="single" locale={es} selected={valid} defaultMonth={valid} disabled={disabled} autoFocus
            onSelect={(date) => { if (date) { onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`); setOpen(false) } }}
            footer={valid ? valid.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) : "Selecciona una fecha"} />
        </Popover.Content></Popover.Portal>
      </Popover.Root>
    </div>
  </div>
}
