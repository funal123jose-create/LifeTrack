"use client"

import { Children, isValidElement } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Select } from "radix-ui"

type OptionProps = { value: string | number; disabled?: boolean; children: React.ReactNode }

export function HealthPeriodSelect({ label, value, onChange, children }: {
  label: string
  value: string | number
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  const options = Children.toArray(children).filter(isValidElement<OptionProps>)

  return <Select.Root value={String(value)} onValueChange={onChange}>
    <Select.Trigger aria-label={label} className="health-select-trigger inline-flex min-h-8 max-w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-sky-200/15 bg-[#0b2532] px-3 py-1.5 text-left text-[11px] font-semibold text-slate-100 outline-none transition-colors hover:border-emerald-300/40 hover:bg-[#10323d] focus-visible:ring-2 focus-visible:ring-cyan-300/70 data-[state=open]:border-emerald-300/60 data-[state=open]:bg-[#113640]">
      <Select.Value />
      <Select.Icon><ChevronDown size={13} className="shrink-0 text-cyan-200 transition-transform duration-200 [[data-state=open]_&]:rotate-180" /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" sideOffset={6} collisionPadding={10} className="health-select-content z-[90] min-w-[var(--radix-select-trigger-width)] max-w-[min(90vw,320px)] overflow-hidden rounded-lg border border-cyan-200/25 bg-[#0a2330] p-1 shadow-[0_18px_45px_rgba(0,0,0,.55)] outline-none">
        <Select.Viewport className="health-plan-scroll max-h-[min(48dvh,300px)] overflow-y-auto">
          {options.map((option) => <Select.Item key={String(option.props.value)} value={String(option.props.value)} disabled={option.props.disabled} className="relative flex min-h-9 cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-[11px] text-slate-200 outline-none transition-colors hover:bg-emerald-400/10 focus:bg-emerald-400/15 focus:text-white data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[state=checked]:bg-emerald-400/12 data-[state=checked]:text-emerald-200">
            <Select.ItemIndicator className="absolute left-2 text-emerald-300"><Check size={14} /></Select.ItemIndicator>
            <Select.ItemText>{option.props.children}</Select.ItemText>
          </Select.Item>)}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
}
