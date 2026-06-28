export const DAYS_OF_WEEK = [
  { id: "mon", name: "Lunes", num: 1 },
  { id: "tue", name: "Martes", num: 2 },
  { id: "wed", name: "Miércoles", num: 3 },
  { id: "thu", name: "Jueves", num: 4 },
  { id: "fri", name: "Viernes", num: 5 },
  { id: "sat", name: "Sábado", num: 6 },
  { id: "sun", name: "Domingo", num: 7 },
]

export const formatLocalDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "--/--/---- --:--"
  }
}
