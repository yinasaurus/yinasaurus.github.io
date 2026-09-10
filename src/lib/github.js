import { SITE } from '../data/site'

const LOGIN = SITE.handle
const CACHE_KEY = 'yin-github-activity-v4'
const FETCH_MS = 8000
const GRAPHQL = 'https://api.github.com/graphql'
const REST = 'https://api.github.com'
const PUBLIC_CALENDAR = `https://github-contributions-api.jogruber.de/v4/${LOGIN}`

/**
 * Session-cached GitHub activity for the Activity section.
 *
 * Resolution order for the calendar:
 *   1. GraphQL `contributionsCollection` when `VITE_GITHUB_TOKEN` is set
 *   2. A public contributions API (no token — used on GitHub Pages)
 *   3. The baked placeholder in `placeholderActivity()`
 *
 * Stats always try the public REST endpoints first. A token, if present, is
 * sent as `Authorization` so the unauthenticated rate limit (60/hr) doesn't
 * trip as quickly.
 *
 * `VITE_` variables are inlined into the client bundle by Vite. Only use a
 * fine-grained PAT with no extra scopes, and never a token that can see
 * private data. Leaving the variable unset is the right default for a public
 * site.
 */

const CALENDAR_QUERY = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

/** Calendar year in progress — 1 Jan through today. */
export function calendarYearRange(now = new Date()) {
  const year = now.getFullYear()
  const from = new Date(year, 0, 1)
  const to = new Date(now)
  to.setHours(0, 0, 0, 0)
  return { year, from, to }
}

export function placeholderActivity() {
  const { year } = calendarYearRange()
  const days = buildPlaceholderDays()
  return {
    source: 'placeholder',
    year,
    days,
    total: days.reduce((sum, day) => sum + day.count, 0),
    repos: 12,
    followers: 8,
    languages: [
      { name: 'JavaScript', count: 5 },
      { name: 'Python', count: 3 },
      { name: 'HTML', count: 2 },
      { name: 'Java', count: 1 },
    ],
  }
}

export async function fetchGithubActivity() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
      if (cached?.days?.length) return cached
    } catch {
      // Private mode can throw on sessionStorage access.
    }
  }

  const token = import.meta.env.VITE_GITHUB_TOKEN

  const [calendar, profile] = await Promise.all([
    fetchCalendar(token).catch((error) => error),
    fetchProfile(token).catch(() => null),
  ])

  const fallback = placeholderActivity()
  const calendarFailed = calendar instanceof Error || !calendar
  const rateLimited =
    calendarFailed && /403|429|rate/i.test(String(calendar?.message ?? calendar))
  const goodCalendar = !calendarFailed && calendar.days?.length

  const data = {
    source: rateLimited ? 'rate-limited' : goodCalendar ? calendar.source : 'placeholder',
    year: goodCalendar ? calendar.year : fallback.year,
    days: goodCalendar ? calendar.days : fallback.days,
    total: goodCalendar ? calendar.total : fallback.total,
    repos: profile?.repos ?? fallback.repos,
    followers: profile?.followers ?? fallback.followers,
    languages: profile?.languages ?? fallback.languages,
  }

  try {
    if (data.days.length) sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignore quota / private-mode failures — the in-memory result still works.
  }

  return data
}

function headers(token) {
  const next = {
    Accept: 'application/vnd.github+json',
  }
  if (token) next.Authorization = `Bearer ${token}`
  return next
}

async function fetchCalendar(token) {
  if (token) {
    const { from, to } = calendarYearRange()
    const response = await fetch(GRAPHQL, {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(FETCH_MS),
      body: JSON.stringify({
        query: CALENDAR_QUERY,
        variables: {
          login: LOGIN,
          from: from.toISOString(),
          to: new Date(to.getTime() + 86400000 - 1).toISOString(),
        },
      }),
    })
    if (response.status === 403 || response.status === 429) {
      throw new Error(`rate ${response.status}`)
    }
    if (!response.ok) throw new Error(`graphql ${response.status}`)
    const json = await response.json()
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar) throw new Error('graphql empty')
    return {
      source: 'graphql',
      year: from.getFullYear(),
      total: calendar.totalContributions,
      days: flattenWeeks(calendar.weeks).filter((day) => inYearRange(day.date, from, to)),
    }
  }

  // No token: public calendar feed. Swap this for GraphQL later by setting
  // VITE_GITHUB_TOKEN. A github-readme-stats image is the last-resort visual
  // if even this feed is down — see `GithubActivity`.
  const response = await fetch(PUBLIC_CALENDAR, { signal: AbortSignal.timeout(FETCH_MS) })
  if (response.status === 403 || response.status === 429) {
    throw new Error(`rate ${response.status}`)
  }
  if (!response.ok) throw new Error(`calendar ${response.status}`)
  const json = await response.json()
  const { year, from, to } = calendarYearRange()

  const inYear = (json.contributions ?? [])
    .map((entry) => ({
      date: entry.date,
      count: entry.count ?? 0,
      dow: new Date(`${entry.date}T00:00:00`).getDay(),
      time: new Date(`${entry.date}T00:00:00`).getTime(),
    }))
    .filter((entry) => entry.time >= from.getTime() && entry.time <= to.getTime())
    .sort((a, b) => a.time - b.time)

  let week = 0
  const days = inYear.map((entry, index) => {
    if (index > 0 && entry.dow < inYear[index - 1].dow) week += 1
    return { date: entry.date, count: entry.count, dow: entry.dow, week }
  })
  const total = days.reduce((sum, day) => sum + day.count, 0)
  return { source: 'public', year, total, days }
}

function inYearRange(iso, from, to) {
  const time = new Date(`${iso}T00:00:00`).getTime()
  return time >= from.getTime() && time <= to.getTime()
}

async function fetchProfile(token) {
  const [userRes, reposRes] = await Promise.all([
    fetch(`${REST}/users/${LOGIN}`, {
      headers: headers(token),
      signal: AbortSignal.timeout(FETCH_MS),
    }),
    fetch(`${REST}/users/${LOGIN}/repos?per_page=100&sort=updated`, {
      headers: headers(token),
      signal: AbortSignal.timeout(FETCH_MS),
    }),
  ])
  if (!userRes.ok) throw new Error(`user ${userRes.status}`)
  if (!reposRes.ok) throw new Error(`repos ${reposRes.status}`)

  const user = await userRes.json()
  const repos = await reposRes.json()
  const tally = new Map()
  for (const repo of repos) {
    if (!repo.language || repo.fork) continue
    tally.set(repo.language, (tally.get(repo.language) ?? 0) + 1)
  }
  const languages = [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    repos: user.public_repos ?? 0,
    followers: user.followers ?? 0,
    languages,
  }
}

function flattenWeeks(weeks) {
  const days = []
  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day) => {
      const date = new Date(`${day.date}T00:00:00`)
      days.push({
        date: day.date,
        count: day.contributionCount,
        week: weekIndex,
        dow: date.getDay(),
      })
    })
  })
  return days
}

function buildPlaceholderDays() {
  const { from, to } = calendarYearRange()
  const days = []
  let week = 0
  for (const cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    const dow = cursor.getDay()
    if (dow === 0 && days.length > 0) week += 1
    const i = days.length
    const weekday = dow !== 0 && dow !== 6
    const wave = Math.sin(i / 9) + Math.sin(i / 23)
    let count = 0
    if (weekday && wave > 0.15) count = Math.min(14, Math.round((wave + 1) * 4))
    if (i % 29 === 0) count = Math.max(count, 8)
    days.push({
      date: toIsoDate(cursor),
      count,
      week,
      dow,
    })
  }
  return days
}

function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
