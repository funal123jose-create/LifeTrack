import Image from "next/image"

export function LifeTrackFooter() {
  return <footer className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-sky-200/10 px-1 pt-3 text-[11px] text-slate-400">
    <span className="flex items-center gap-2"><Image src="/images/lifetrack/lifetrack-mark.png" width={27} height={18} alt="" className="h-auto mix-blend-screen" /><strong className="text-sm text-slate-100">Life<span className="text-sky-300">Track</span></strong></span>
    <span>Tu vida, tus datos, un mejor tú.</span>
  </footer>
}
