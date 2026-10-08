import { createHash } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { deadlineAlerts, formatProjectDate, limaToday } from "@/lib/career-deadlines"
import { publicEnv } from "@/lib/env/public"

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!)

export function careerEmailConfigured(): boolean {
  return process.env.CAREER_EMAIL_ENABLED === "true" && Boolean((process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) && process.env.CAREER_ALERT_USER_ID && process.env.CAREER_ALERT_EMAIL && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

export async function sendCareerDeadlineEmail() {
  if (!careerEmailConfigured()) return { configured: false, sent: 0 }

  const userId = process.env.CAREER_ALERT_USER_ID!
  const admin = createClient(publicEnv.supabaseUrl, (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: projects, error: projectError } = await admin.from("projects")
    .select("id,title,status,start_date,end_date,progress,project_tasks(status)")
    .eq("user_id", userId)
  if (projectError) throw projectError

  const alerts = deadlineAlerts(projects || [], limaToday())
  const claimed: typeof alerts = []
  const claims: string[] = []
  const stale = new Date(Date.now() - 15 * 60_000).toISOString()

  for (const alert of alerts) {
    const key = { project_id: alert.project.id, due_date: alert.project.end_date!, kind: alert.kind }
    const { data: existing, error: lookupError } = await admin.from("career_deadline_email_deliveries")
      .select("id,status,claimed_at").match(key).maybeSingle()
    if (lookupError) throw lookupError
    if (existing?.status === "sent") continue

    let claimId: string | undefined
    if (existing) {
      if (existing.claimed_at >= stale) continue
      const { data, error } = await admin.from("career_deadline_email_deliveries")
        .update({ claimed_at: new Date().toISOString() }).eq("id", existing.id).eq("status", "pending")
        .eq("claimed_at", existing.claimed_at).select("id")
      if (error) throw error
      claimId = data?.[0]?.id
    } else {
      const { data, error } = await admin.from("career_deadline_email_deliveries")
        .insert({ ...key, user_id: userId }).select("id")
      if (error && error.code !== "23505") throw error
      claimId = data?.[0]?.id
    }
    if (claimId) { claimed.push(alert); claims.push(claimId) }
  }

  if (!claimed.length) return { configured: true, sent: 0 }

  const rows = claimed.map(({ project, kind }) => `<tr><td style="padding:12px 10px;border-bottom:1px solid #244253;color:#f5f7fa;font-weight:600">${escapeHtml(project.title)}</td><td style="padding:12px 10px;border-bottom:1px solid #244253;color:#a9bfcc">${escapeHtml(project.status || "Backlog")}</td><td style="padding:12px 10px;border-bottom:1px solid #244253;color:#ffbd81">${formatProjectDate(project.end_date!)}</td><td style="padding:12px 10px;border-bottom:1px solid #244253;color:${kind === "overdue" ? "#fda4af" : "#ffbd81"}">${kind === "overdue" ? "Vencido" : "Vence mañana"}</td></tr>`).join("")
  const html = `<div style="background:#061724;padding:32px;font-family:Arial,sans-serif;color:#f5f7fa"><div style="max-width:680px;margin:auto;background:#0a2230;border:1px solid #365064;border-radius:8px;overflow:hidden"><div style="border-top:3px solid #fb923c;padding:24px"><p style="margin:0;color:#fb923c;font-size:12px;font-weight:bold;letter-spacing:1px">LIFETRACK · DATA & CARRERA</p><h1 style="margin:12px 0 6px;font-size:24px">Proyectos que requieren atención</h1><p style="margin:0;color:#b6c6d2;font-size:14px">Revisa los plazos y gestiona los proyectos desde la aplicación.</p></div><div style="overflow-x:auto;padding:0 18px 24px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:#8fa8b8;text-align:left"><th style="padding:10px">Proyecto</th><th style="padding:10px">Estado</th><th style="padding:10px">Límite</th><th style="padding:10px">Alerta</th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`
  const digest = createHash("sha256").update(claimed.map(({ project, kind }) => `${project.id}:${project.end_date}:${kind}`).sort().join("|")).digest("hex")

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `career-deadlines-${digest}` },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [process.env.CAREER_ALERT_EMAIL], subject: "Proyectos de Data & Carrera por vencer", html }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`El proveedor de correo respondió ${response.status}`)
    const { error } = await admin.from("career_deadline_email_deliveries")
      .update({ status: "sent", sent_at: new Date().toISOString() }).in("id", claims)
    if (error) throw error
    return { configured: true, sent: claimed.length }
  } catch (error) {
    // Failed requests release the claims; retries use the same provider idempotency key.
    await admin.from("career_deadline_email_deliveries").delete().in("id", claims).eq("status", "pending")
    throw error
  }
}
