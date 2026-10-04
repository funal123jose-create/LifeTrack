import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { createClient } from "@/lib/supabase/server"
import { getGeminiApiKey } from "@/lib/env/server"
import { sanitizeNutritionResponse } from "@/lib/nutrition"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.getClaims()

    if (authError || !data?.claims) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 })
    }

    let geminiApiKey: string

    try {
      geminiApiKey = getGeminiApiKey()
    } catch {
      return NextResponse.json({ error: "Servicio de nutricion no configurado." }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey })
    const { text, audio, mimeType, mode } = await req.json()

    // --- MODO 1: TRANSCRIBIR AUDIO A TEXTO ---
    if (mode === "transcribe" && audio && mimeType) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          "Eres un transcriptor experto de audio a texto. Tu única tarea es escuchar el audio adjunto y escribir exactamente lo que el usuario dijo de forma limpia, sin agregar comentarios, introducciones ni explicaciones. Si no logras escuchar nada claro, responde con una cadena de texto vacía.",
          {
            inlineData: {
              data: audio,
              mimeType: mimeType,
            },
          },
        ],
      })

      return NextResponse.json({ text: response.text?.trim() || "" })
    }

    // --- MODO 2: CALCULAR CALORÍAS DESDE TEXTO ---
    if (text) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          `Analiza la descripción de alimentos para un registro personal de nutrición. Responde solo con el JSON solicitado.

Separa desayuno, almuerzo, cena y snacks en comidas independientes. Para cada comida, identifica cada alimento o componente (incluidos aceites, salsas y bebidas) en foods. Usa las cantidades indicadas por el usuario. Si falta cantidad, declara una porción casera asumida en texto y, solo si es razonable, su peso estimado en gramos. No atribuyas cantidades exactas a una descripción ambigua.

Estima calorías, proteína, carbohidratos y grasas por alimento a partir de su composición alimentaria habitual y la porción declarada o asumida. Suma los componentes para los macros de la comida; comprueba que calorías y macros sean aproximadamente coherentes (4 kcal/g proteína, 4 kcal/g carbohidratos y 9 kcal/g grasas). Incluye aceites o grasas de cocción solo cuando la preparación los sugiera, indicándolo en la porción asumida. No conviertas una categoría alimentaria en un valor fijo: atún e hígado aportan proteínas; fruta aporta principalmente carbohidratos, según porción.

Si no puedes estimar responsablemente un nutriente o una porción, devuelve null para ese valor, nunca 0 por ausencia de datos. 0 solo significa ausencia razonable de ese nutriente. confidence es high si alimento y porción están claros, medium si la porción es asumida, low si hay ambigüedad. No des consejos médicos ni simules mediciones de laboratorio. Si no hay alimentos claros, devuelve meals vacío y totalCalories 0. Tipos: breakfast, lunch, dinner, snack, pre_workout, post_workout, other. Estas cifras son estimaciones revisables por el usuario, no valores clínicos.`,
          text,
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalCalories: {
                type: Type.INTEGER,
                description: "Suma total de calorías estimadas de todos los alimentos descritos.",
              },
              meals: {
                type: Type.ARRAY,
                description: "Lista de comidas detectadas y separadas por tipo de comida.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    meal_type: {
                      type: Type.STRING,
                      description:
                        "Tipo de comida. Valores permitidos: breakfast, lunch, dinner, snack, pre_workout, post_workout, other.",
                    },
                    description: {
                      type: Type.STRING,
                      description: "Descripción corta y limpia de la comida detectada.",
                    },
                    estimated_calories: {
                      type: Type.INTEGER,
                      description: "Calorías estimadas para esta comida específica.",
                    },
                    confidence: {
                      type: Type.STRING,
                      description: "Nivel de confianza de la estimación. Valores: low, medium, high.",
                    },
                    portion_assumption: {
                      type: Type.STRING,
                      description: "Suposición breve de porción usada para calcular calorías.",
                    },
                    protein_g: { type: Type.NUMBER, nullable: true, description: "Proteínas estimadas en gramos o null si no hay base suficiente." },
                    carbs_g: { type: Type.NUMBER, nullable: true, description: "Carbohidratos estimados en gramos o null si no hay base suficiente." },
                    fat_g: { type: Type.NUMBER, nullable: true, description: "Grasas estimadas en gramos o null si no hay base suficiente." },
                    foods: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          portion: { type: Type.STRING },
                          estimated_grams: { type: Type.NUMBER, nullable: true },
                          estimated_calories: { type: Type.NUMBER, nullable: true },
                          protein_g: { type: Type.NUMBER, nullable: true },
                          carbs_g: { type: Type.NUMBER, nullable: true },
                          fat_g: { type: Type.NUMBER, nullable: true },
                        },
                        required: ["name", "portion", "estimated_grams", "estimated_calories", "protein_g", "carbs_g", "fat_g"],
                      },
                    },
                  },
                  required: ["meal_type", "description", "estimated_calories", "confidence", "portion_assumption", "protein_g", "carbs_g", "fat_g", "foods"],
                },
              },
            },
            required: ["totalCalories", "meals"],
          },
        },
      })

      const rawJson = JSON.parse(response.text || '{"totalCalories":0,"meals":[]}')
      const sanitized = sanitizeNutritionResponse(rawJson)

      return NextResponse.json(sanitized)
    }

    return NextResponse.json({ error: "Parámetros inválidos o faltantes." }, { status: 400 })
  } catch (error: unknown) {
    console.error("Error en el endpoint de nutrición:", error)
    const message = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
