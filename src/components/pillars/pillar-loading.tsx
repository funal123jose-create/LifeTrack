import type { PillarTone } from "./immersive-pillar-card"

export function PillarLoading({ tone, label }: { tone: PillarTone; label: string }) {
  return <section className="pillar-loading" data-tone={tone} role="status" aria-live="polite" aria-busy="true">
    <p>{label}</p>
    <div aria-hidden="true" className="pillar-loading-heading" />
    <div className="pillar-loading-metrics" aria-hidden="true">{[0, 1, 2, 3].map((item) => <div key={item}><span /><span /></div>)}</div>
    <div className="pillar-loading-body" aria-hidden="true"><div /><div /></div>
  </section>
}
