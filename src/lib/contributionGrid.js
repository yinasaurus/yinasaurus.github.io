/** Shared contribution-grid helpers for the 3D city and the mobile heatmap. */

export const LEVELS = ['#d4cfc4', '#17c79a', '#6c3bf4', '#ffb020', '#ff4d8d']
export const LEVELS_DARK = ['#5c5568', '#17c79a', '#8b6cff', '#ffb020', '#ff4d8d']

export function levelIndex(count, max) {
  if (count <= 0) return 0
  if (max <= 1) return 2
  const t = count / max
  if (t < 0.25) return 1
  if (t < 0.5) return 2
  if (t < 0.75) return 3
  return 4
}

export function toIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Sunday-aligned YTD rectangle so empty weekdays don't leave holes. */
export function fillGrid(days) {
  if (!days.length) return days
  const counts = new Map(days.map((day) => [day.date, day.count]))
  const times = days.map((day) => new Date(`${day.date}T00:00:00`))
  const year = new Date(Math.min(...times)).getFullYear()

  const start = new Date(year, 0, 1)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(Math.max(...times))
  end.setDate(end.getDate() + (6 - end.getDay()))

  const grid = []
  let week = 0
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const dow = cursor.getDay()
    if (dow === 0 && grid.length > 0) week += 1
    const date = toIso(cursor)
    grid.push({ date, count: counts.get(date) ?? 0, week, dow })
  }
  return grid
}
