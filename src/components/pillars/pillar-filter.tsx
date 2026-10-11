"use client"

import { Children, isValidElement } from "react"
import { DropdownMenu } from "radix-ui"
import { Check, ChevronDown } from "lucide-react"

export function PillarFilter({ label, value, onChange, children, tone = "health", fullWidth = false }: {
  label: string; value: string | number; onChange: (value: string) => void;
  children: React.ReactNode; tone?: "health" | "career" | "care"; fullWidth?: boolean;
}) {
  const options = Children.toArray(children).filter(isValidElement<{ value: string | number; disabled?: boolean; children: React.ReactNode }>)
  const selected = options.find((option) => String(option.props.value) === String(value))
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger className={`pillar-filter-trigger ${fullWidth ? "w-full" : ""}`} aria-label={label}>
      <span>{selected?.props.children}</span><ChevronDown size={14} />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="pillar-filter-menu" data-tone={tone} sideOffset={6} collisionPadding={12} aria-label={label}>
      <DropdownMenu.RadioGroup value={String(value)} onValueChange={onChange}>
        {options.map((option) => <DropdownMenu.RadioItem key={String(option.props.value)} value={String(option.props.value)} disabled={option.props.disabled}>
          <DropdownMenu.ItemIndicator><Check size={14} /></DropdownMenu.ItemIndicator>{option.props.children}
        </DropdownMenu.RadioItem>)}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>
}
