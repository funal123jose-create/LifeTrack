export const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const getLocalDateString = () => formatDateToLocalString(new Date())

export const getCurrentWeekStartString = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const day = today.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)

  return formatDateToLocalString(monday)
}

export const getCurrentWeekEndString = () => {
  const monday = new Date(`${getCurrentWeekStartString()}T00:00:00`)
  monday.setDate(monday.getDate() + 6)

  return formatDateToLocalString(monday)
}

export const getDateForWeekdayNum = (weekStart: string, diaSemana: number) => {
  const baseDate = new Date(`${weekStart}T00:00:00`)
  baseDate.setDate(baseDate.getDate() + (diaSemana - 1))

  return formatDateToLocalString(baseDate)
}
