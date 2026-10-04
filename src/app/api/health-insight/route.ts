import { GoogleGenAI, Type } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { getGeminiApiKey } from "@/lib/env/server"
import { HEALTH_AI_REFERENCES, buildHealthAiSnapshot, createHealthAiPrompt, parseHealthAiText } from "@/lib/health-ai-reading"
import { fetchHealthHistory, fetchNutritionHistory, fetchWeightGoal } from "@/lib/health-history-service"
import { createClient } from "@/lib/supabase/server"

const noStore = { "Cache-Control": "private, no-store, max-age=0" }

function todayInBogota() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const part = (type: string) => parts.find((item) => item.type === type)?.value || ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

async function authenticatedClient() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  return { supabase, userId: error ? null : data?.claims?.sub || null }
}

export async function GET() {
  const { userId } = await authenticatedClient()
  if (!userId) return NextResponse.json({ error: "No autorizado." }, { status: 401, headers: noStore })
  const enabled = process.env.GEMINI_HEALTH_PAID_TIER_VERIFIED === "true" && !!process.env.GEMINI_API_KEY
  return NextResponse.json({ enabled }, { headers: noStore })
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin")
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Origen no permitido." }, { status: 403, headers: noStore })
    }
    const { supabase, userId } = await authenticatedClient()
    if (!userId) return NextResponse.json({ error: "No autorizado." }, { status: 401, headers: noStore })
    if (process.env.GEMINI_HEALTH_PAID_TIER_VERIFIED !== "true") {
      return NextResponse.json({ error: "Confirma la cuota de pago de Gemini antes de enviar datos de salud." }, { status: 503, headers: noStore })
    }

    let apiKey: string
    try {
      apiKey = getGeminiApiKey()
    } catch {
      return NextResponse.json({ error: "Gemini no está configurado." }, { status: 503, headers: noStore })
    }

    const [history, nutrition, goal, profile] = await Promise.all([
      fetchHealthHistory(supabase, userId),
      fetchNutritionHistory(supabase, userId),
      fetchWeightGoal(supabase, userId),
      supabase.from("user_physical_profiles").select("water_goal_ml").eq("user_id", userId).maybeSingle(),
    ])
    if (profile.error) throw profile.error
    const waterGoal = Number(profile.data?.water_goal_ml)
    const snapshot = buildHealthAiSnapshot(history, nutrition, goal, todayInBogota(), Number.isFinite(waterGoal) && waterGoal > 0 ? waterGoal / 1000 : null)
    if (!snapshot.hasData) {
      return NextResponse.json({ error: "Todavía no hay registros suficientes para generar una lectura." }, { status: 422, headers: noStore })
    }

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createHealthAiPrompt(snapshot),
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            avance: { type: Type.STRING, description: "Progreso verificable y breve basado en registros." },
            atencion: { type: Type.STRING, description: "Brecha o limitación de datos más importante, sin diagnóstico." },
            recomendacion: { type: Type.STRING, description: "Siguiente acción general y prudente, sin prescripción clínica." },
            limite: { type: Type.STRING, description: "Advertencia breve sobre estimaciones, registros incompletos o falta de meta individual." },
          },
          required: ["avance", "atencion", "recomendacion", "limite"],
        },
      },
    })
    const reading = parseHealthAiText(response.text || "")
    return NextResponse.json({ reading, generatedAt: new Date().toISOString(), references: HEALTH_AI_REFERENCES }, { headers: noStore })
  } catch (error) {
    console.error("No se pudo generar la lectura de salud:", error instanceof Error ? error.name : "error")
    return NextResponse.json({ error: "No se pudo generar la lectura. Intenta de nuevo más tarde." }, { status: 502, headers: noStore })
  }
}
