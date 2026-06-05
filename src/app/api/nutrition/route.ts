import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const ALLOWED_MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
  "other",
] as const

type MealType = typeof ALLOWED_MEAL_TYPES[number]
type ConfidenceLevel = "low" | "medium" | "high"

type NutritionMeal = {
  meal_type: MealType
  description: string
  estimated_calories: number
  confidence?: ConfidenceLevel
  portion_assumption?: string
}

type NutritionResponse = {
  totalCalories: number
  meals: NutritionMeal[]
}

function normalizeMealType(value: unknown): MealType {
  const raw = String(value || "").toLowerCase().trim()

  if (ALLOWED_MEAL_TYPES.includes(raw as MealType)) {
    return raw as MealType
  }

  if (raw.includes("desay")) return "breakfast"
  if (raw.includes("almuerzo") || raw.includes("almorc")) return "lunch"
  if (raw.includes("cena") || raw.includes("noche")) return "dinner"
  if (raw.includes("snack") || raw.includes("merienda") || raw.includes("piqueo")) return "snack"
  if (raw.includes("pre")) return "pre_workout"
  if (raw.includes("post")) return "post_workout"

  return "other"
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  const raw = String(value || "").toLowerCase().trim()

  if (raw === "high" || raw === "medium" || raw === "low") {
    return raw as ConfidenceLevel
  }

  return "medium"
}

function applyRealisticFloor(meal: NutritionMeal): NutritionMeal {
  const text = meal.description.toLowerCase()
  let floor = 0

  if (text.includes("pollo a la brasa")) floor = Math.max(floor, 850)
  if (text.includes("arroz con pollo")) floor = Math.max(floor, 650)
  if (text.includes("papa a la huanca") || text.includes("huancaína") || text.includes("huancaina")) floor = Math.max(floor, 300)

  if (
    text.includes("arroz con pollo") &&
    (text.includes("papa a la huanca") || text.includes("huancaína") || text.includes("huancaina"))
  ) {
    floor = Math.max(floor, 950)
  }

  if (text.includes("lomo saltado")) floor = Math.max(floor, 850)
  if (text.includes("tallarín") || text.includes("tallarin")) floor = Math.max(floor, 650)
  if (text.includes("chaufa")) floor = Math.max(floor, 700)
  if (text.includes("tamal")) floor = Math.max(floor, 320)
  if (text.includes("jugo") && !text.includes("sin azúcar") && !text.includes("sin azucar")) floor = Math.max(floor, 120)
  if (text.includes("pringles") || text.includes("papitas") || text.includes("snack")) floor = Math.max(floor, 250)
  if (text.includes("tortilla de huevo")) floor = Math.max(floor, 160)
  if (text.includes("tortilla de maíz") || text.includes("tortilla de maiz")) floor = Math.max(floor, 60)

  if (floor > 0 && meal.estimated_calories < floor) {
    return {
      ...meal,
      estimated_calories: floor,
      confidence: meal.confidence || "medium",
      portion_assumption: meal.portion_assumption || "Porción peruana promedio ajustada por piso calórico",
    }
  }

  return meal
}

function sanitizeNutritionResponse(value: any): NutritionResponse {
  const rawMeals = Array.isArray(value?.meals) ? value.meals : []

  const meals: NutritionMeal[] = rawMeals
    .map((item: any) => {
      const description = String(item?.description || "").trim()
      const estimatedCalories = Math.max(0, Math.round(Number(item?.estimated_calories || 0)))

      if (!description || estimatedCalories <= 0) return null

      const meal: NutritionMeal = {
        meal_type: normalizeMealType(item?.meal_type),
        description,
        estimated_calories: estimatedCalories,
        confidence: normalizeConfidence(item?.confidence),
        portion_assumption: String(item?.portion_assumption || "Porción promedio").trim(),
      }

      return applyRealisticFloor(meal)
    })
    .filter(Boolean) as NutritionMeal[]

  const calculatedTotal = meals.reduce((sum, item) => sum + item.estimated_calories, 0)
  const fallbackTotal = Math.max(0, Math.round(Number(value?.totalCalories || 0)))

  return {
    totalCalories: calculatedTotal > 0 ? calculatedTotal : fallbackTotal,
    meals,
  }
}

export async function POST(req: NextRequest) {
  try {
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
          `Eres un asistente experto en estimación nutricional práctica para una app personal de seguimiento de salud.

Tu tarea es analizar la descripción de alimentos del usuario y devolver un JSON estructurado.

Objetivo principal:
Calcular calorías aproximadas de forma realista. No busques exactitud clínica, pero evita subestimar comidas completas, especialmente platos peruanos o comidas con arroz, papa, frituras, salsas, cremas, aceite, pollo, pan, snacks o bebidas azucaradas.

Reglas importantes:
1. Si el usuario menciona desayuno, almuerzo, cena, snack, pre-entreno o post-entreno, separa cada comida en un elemento distinto dentro de "meals".
2. Si el usuario menciona varias comidas en una sola frase o audio, NO las unas en un solo registro.
3. Si no se especifica cantidad, asume una porción casera peruana promedio, no una porción pequeña.
4. Para platos de almuerzo/cena como arroz con pollo, pollo a la brasa, lomo saltado, chaufa, tallarines, arroz con menestra, papa a la huancaína o platos con salsas, estima como plato completo.
5. Si una comida incluye dos componentes principales, suma ambos. Ejemplo: "arroz con pollo y papa a la huancaína" debe considerar arroz con pollo + papa a la huancaína.
6. Si el usuario dice bebida zero, sin azúcar o light, estima 0 a 10 kcal para esa bebida.
7. Si el usuario dice jugo y no aclara "sin azúcar", asume jugo normal con posible azúcar.
8. Devuelve también confidence:
   - "high" si el alimento y porción están claros.
   - "medium" si el alimento está claro pero la porción es asumida.
   - "low" si la descripción es ambigua.
9. Devuelve portion_assumption explicando brevemente qué porción asumiste.
10. No des consejos médicos, no expliques nada fuera del JSON.
11. Si no hay alimentos claros, devuelve totalCalories 0 y meals vacío.

Guía de referencia para porciones promedio:
- Tamal de pollo promedio: 320 a 450 kcal.
- Jugo de papaya normal: 120 a 220 kcal.
- Tortilla de 1 huevo: 90 a 140 kcal; si parece tortilla casera con aceite, 140 a 220 kcal.
- Tortilla de maíz: 50 a 80 kcal por unidad.
- Manzanilla o infusión sin azúcar: 0 a 5 kcal.
- Arroz con pollo plato promedio: 650 a 850 kcal.
- Papa a la huancaína porción promedio: 300 a 450 kcal.
- Arroz con pollo + papa a la huancaína: normalmente 950 a 1250 kcal.
- Pollo a la brasa porción promedio con papas y salsas: 900 a 1300 kcal.
- Pringles o papitas snack porción personal: 250 a 450 kcal.
- Gaseosa zero: 0 a 10 kcal.

Tipos permitidos para meal_type:
- breakfast
- lunch
- dinner
- snack
- pre_workout
- post_workout
- other

Ejemplo:
Usuario: "Desayuné tamal de pollo con jugo de papaya. Almorcé arroz con pollo y papa a la huancaína. Cené tortilla de huevo, tortilla de maíz y manzanilla."

Respuesta esperada:
{
  "totalCalories": 1760,
  "meals": [
    {
      "meal_type": "breakfast",
      "description": "Tamal de pollo con jugo de papaya",
      "estimated_calories": 560,
      "confidence": "medium",
      "portion_assumption": "Tamal promedio y vaso de jugo de papaya normal"
    },
    {
      "meal_type": "lunch",
      "description": "Arroz con pollo y papa a la huancaína",
      "estimated_calories": 1000,
      "confidence": "medium",
      "portion_assumption": "Plato casero peruano promedio con porción de papa a la huancaína"
    },
    {
      "meal_type": "dinner",
      "description": "Tortilla de huevo, tortilla de maíz y manzanilla",
      "estimated_calories": 200,
      "confidence": "medium",
      "portion_assumption": "Una tortilla de huevo, una tortilla de maíz e infusión sin azúcar"
    }
  ]
}`,
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
                  },
                  required: ["meal_type", "description", "estimated_calories", "confidence", "portion_assumption"],
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
  } catch (error: any) {
    console.error("Error en el endpoint de nutrición:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
