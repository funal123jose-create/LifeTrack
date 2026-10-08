"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  phase: number
  radius: number
}

export function CareerBoardParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const board = canvas?.parentElement
    const context = canvas?.getContext("2d")
    if (!canvas || !board || !context) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointer = { x: -1000, y: -1000 }
    const particles: Particle[] = []
    let width = 0
    let height = 0
    let visible = false
    let frame = 0
    let lastDraw = 0

    function resize() {
      if (!canvas || !board) return
      const bounds = board.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      context?.setTransform(ratio, 0, 0, ratio, 0, 0)
      particles.length = 0
      const count = Math.min(72, Math.max(28, Math.round(width * height / 18500)))
      for (let index = 0; index < count; index++) {
        particles.push({
          x: ((index * 0.61803398875) % 1) * width,
          y: ((index * 0.38196601125 + Math.sin(index * 5.3) * 0.09 + 1) % 1) * height,
          phase: index * 1.73,
          radius: index % 7 === 0 ? 2.4 : 1.5,
        })
      }
      draw(0)
    }

    function draw(time: number) {
      if (!context) return
      context.clearRect(0, 0, width, height)
      const reduced = motionQuery.matches
      const points = particles.map((particle) => {
        const driftX = reduced ? 0 : Math.sin(time * 0.00023 + particle.phase) * 12
        const driftY = reduced ? 0 : Math.cos(time * 0.00018 + particle.phase) * 9
        const x = particle.x + driftX
        const y = particle.y + driftY
        const distance = Math.hypot(x - pointer.x, y - pointer.y)
        const influence = reduced ? 0 : Math.max(0, 1 - distance / 145)
        const direction = Math.atan2(y - pointer.y, x - pointer.x)
        return {
          x: x + Math.cos(direction) * influence * 23,
          y: y + Math.sin(direction) * influence * 23,
          radius: particle.radius + influence * 1.6,
          influence,
        }
      })

      for (let index = 0; index < points.length; index++) {
        const point = points[index]
        for (let next = index + 1; next < points.length; next++) {
          const other = points[next]
          const distance = Math.hypot(point.x - other.x, point.y - other.y)
          if (distance > 150) continue
          const alpha = (1 - distance / 150) * (0.24 + Math.max(point.influence, other.influence) * 0.28)
          context.strokeStyle = 'rgba(255, 151, 59, ' + alpha + ')'
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(point.x, point.y)
          context.lineTo(other.x, other.y)
          context.stroke()
        }
      }
      for (const point of points) {
        context.shadowBlur = point.influence > 0 ? 14 : 6
        context.shadowColor = "rgba(255, 135, 35, .8)"
        context.fillStyle = point.influence > 0 ? "rgba(255, 190, 99, .95)" : "rgba(255, 145, 54, .76)"
        context.beginPath()
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        context.fill()
      }
      context.shadowBlur = 0
    }

    function tick(time: number) {
      if (time - lastDraw >= 33) {
        draw(time)
        lastDraw = time
      }
      frame = window.requestAnimationFrame(tick)
    }

    function updateAnimation() {
      window.cancelAnimationFrame(frame)
      if (visible && !document.hidden && !motionQuery.matches) frame = window.requestAnimationFrame(tick)
      else draw(0)
    }

    function onPointerMove(event: PointerEvent) {
      if (!board) return
      const bounds = board.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
    }
    function onPointerLeave() {
      pointer.x = -1000
      pointer.y = -1000
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(board)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateAnimation()
    }, { threshold: 0.01 })
    intersectionObserver.observe(board)
    board.addEventListener("pointermove", onPointerMove, { passive: true })
    board.addEventListener("pointerleave", onPointerLeave)
    motionQuery.addEventListener("change", updateAnimation)
    document.addEventListener("visibilitychange", updateAnimation)
    resize()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      board.removeEventListener("pointermove", onPointerMove)
      board.removeEventListener("pointerleave", onPointerLeave)
      motionQuery.removeEventListener("change", updateAnimation)
      document.removeEventListener("visibilitychange", updateAnimation)
    }
  }, [])

  return <canvas ref={canvasRef} className="career-board-particles pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
}
