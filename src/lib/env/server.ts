function getRequiredServerEnv(name: "GEMINI_API_KEY") {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }

  return value
}

export const getGeminiApiKey = () => getRequiredServerEnv("GEMINI_API_KEY")
