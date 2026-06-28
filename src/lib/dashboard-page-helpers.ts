export const formatDateShort = (value?: string | null) => {
  if (!value) return "—"

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    })
  } catch {
    return "—"
  }
}
