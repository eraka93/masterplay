/** Date helpers operating on plain `YYYY-MM-DD` strings in local time, used across services/UI. */

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function addDaysIso(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split('-').map(Number) as [number, number, number]
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function yesterdayOf(dateIso: string): string {
  return addDaysIso(dateIso, -1)
}

export function isoDateRangeEndingToday(days: number): string[] {
  const today = todayIso()
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(addDaysIso(today, -i))
  }
  return dates
}

export function startOfWeekIso(dateIso: string): string {
  const [year, month, day] = dateIso.split('-').map(Number) as [number, number, number]
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay() // 0 = Sunday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // week starts Monday
  date.setDate(date.getDate() + diff)
  return toIsoDate(date)
}

export function startOfMonthIso(dateIso: string): string {
  return `${dateIso.slice(0, 7)}-01`
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatRelativeDate(dateIso: string): string {
  const today = todayIso()
  if (dateIso === today) return 'Today'
  if (dateIso === yesterdayOf(today)) return 'Yesterday'
  const [year, month, day] = dateIso.split('-').map(Number) as [number, number, number]
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
