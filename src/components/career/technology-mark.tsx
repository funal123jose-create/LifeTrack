import Image from "next/image"
import { Code2, Database } from "lucide-react"
import {
  siDatabricks, siFigma, siGit, siGithub, siGooglebigquery, siJavascript,
  siJupyter, siMysql, siNextdotjs, siPostgresql, siPython, siReact,
  siSqlite, siSupabase, siTypescript,
} from "simple-icons"

const marks = {
  python: siPython, react: siReact, javascript: siJavascript, typescript: siTypescript,
  databricks: siDatabricks, supabase: siSupabase, "next.js": siNextdotjs,
  nextjs: siNextdotjs, bigquery: siGooglebigquery, "google bigquery": siGooglebigquery,
  postgresql: siPostgresql, postgres: siPostgresql, mysql: siMysql, sqlite: siSqlite,
  figma: siFigma, git: siGit, github: siGithub, jupyter: siJupyter,
} as const

export function TechnologyMark({ name, size = 16 }: { name: string; size?: number }) {
  const key = name.trim().toLowerCase()
  if (key === "power bi" || key === "azure" || key === "microsoft azure") {
    return <Image src={`/images/lifetrack/tech/${key === "power bi" ? "power-bi" : "azure"}.svg`} alt="" width={size} height={size} className="technology-mark" />
  }
  const mark = marks[key as keyof typeof marks]
  if (mark) return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="technology-mark" style={{ color: mark.hex === "000000" ? "inherit" : `#${mark.hex}` }}><path fill="currentColor" d={mark.path} /></svg>
  if (key === "sql") return <Database size={size} aria-hidden="true" className="technology-mark" />
  return <Code2 size={size} aria-hidden="true" className="technology-mark" />
}

export function TechnologyList({ stack, label }: { stack: string | null; label: string }) {
  const names = (stack || "").split(/[,|;]/).map((name) => name.trim()).filter(Boolean)
  return <div className="technology-list" aria-label={label}>{names.length ? names.map((name) => <span key={name}><TechnologyMark name={name} />{name}</span>) : <p>Sin tecnologías registradas.</p>}</div>
}
