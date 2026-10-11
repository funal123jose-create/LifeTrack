"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CareerBoardViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [edges, setEdges] = useState({ overflow: false, start: true, end: true })
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => setEdges({ overflow: node.scrollWidth > node.clientWidth + 2, start: node.scrollLeft < 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 })
    const observer = new ResizeObserver(update)
    observer.observe(node)
    node.addEventListener("scroll", update, { passive: true })
    update()
    return () => { observer.disconnect(); node.removeEventListener("scroll", update) }
  }, [])
  const move = (direction: number) => {
    const node = ref.current
    const column = node?.firstElementChild
    if (!node || !column) return
    node.scrollBy({ left: direction * (column.getBoundingClientRect().width + 12), behavior: reduced ? "instant" : "smooth" })
  }
  return <div className="career-board-viewport">
    <div ref={ref} className="career-board-scroll career-board-columns" role="region" aria-label="Estados de proyectos" tabIndex={0}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1) } }}>
      {children}
    </div>
    {edges.overflow && <div className="career-board-navigation"><span>Estados de proyectos</span><div><button type="button" aria-label="Ver columnas anteriores" title="Columnas anteriores" disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={18} /></button><button type="button" aria-label="Ver columnas siguientes" title="Columnas siguientes" disabled={edges.end} onClick={() => move(1)}><ChevronRight size={18} /></button></div></div>}
  </div>
}
