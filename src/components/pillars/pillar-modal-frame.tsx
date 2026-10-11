"use client"

import { cloneElement, type ReactElement, type ReactNode } from "react"
import { Dialog } from "radix-ui"

export function PillarModalFrame({ title, onClose, children }: {
  title: string; onClose: () => void; children: ReactElement<{ children?: ReactNode }>;
}) {
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
    <Dialog.Portal><Dialog.Content asChild aria-describedby={undefined} onInteractOutside={(event) => event.preventDefault()}>
      {cloneElement(children, {}, <Dialog.Title className="sr-only">{title}</Dialog.Title>, children.props.children)}
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>
}
