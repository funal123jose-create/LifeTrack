import { createClient } from "@/lib/supabase/server"
import { careerEmailConfigured, sendCareerDeadlineEmail } from "@/lib/career-deadline-email"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 })
  if (!careerEmailConfigured()) return Response.json({ configured: false, sent: 0 })
  try { return Response.json(await sendCareerDeadlineEmail()) }
  catch (error) { console.error("Error procesando correos de vencimiento:", error); return Response.json({ error: "No se pudo procesar el correo" }, { status: 500 }) }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 })
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return new Response("Unauthorized", { status: 401 })
  if (!careerEmailConfigured() || user.id !== process.env.CAREER_ALERT_USER_ID) return Response.json({ configured: false, sent: 0 })
  try { return Response.json(await sendCareerDeadlineEmail()) }
  catch (cause) { console.error("Error procesando correo inmediato:", cause); return Response.json({ error: "No se pudo procesar el correo" }, { status: 500 }) }
}
