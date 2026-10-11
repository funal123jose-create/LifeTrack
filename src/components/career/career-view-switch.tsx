"use client"

export function CareerViewSwitch({ view, onChange }: { view: "overview" | "board"; onChange: (view: "overview" | "board") => void }) {
  return <div className="pillar-segments career-view-switch" role="group" aria-label="Vista de Data y Carrera">
    <button type="button" onClick={() => onChange("overview")} aria-pressed={view === "overview"}>Resumen</button>
    <button type="button" onClick={() => onChange("board")} aria-pressed={view === "board"}>Tablero</button>
  </div>
}
