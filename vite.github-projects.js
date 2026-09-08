import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BLURB_OVERRIDES, EXCLUDE_REPOS, GITHUB_LOGIN, LANGUAGE_ACCENT, TITLE_OVERRIDES } from './src/data/project-config.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(ROOT, 'src/data/github-projects.json')
const REST = 'https://api.github.com'
const TTL_MS = 6 * 60 * 60 * 1000
const MIN_LANGUAGE_SHARE = 0.05

function headers() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN
  const next = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${GITHUB_LOGIN}-site`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) next.Authorization = `Bearer ${token}`
  return next
}

async function github(path, extra = {}) {
  const response = await fetch(`${REST}${path}`, { headers: { ...headers(), ...extra } })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${path} ${response.status}`)
  if (extra.Accept === 'application/vnd.github.raw') return response.text()
  return response.json()
}

function prettyTitle(name) {
  if (TITLE_OVERRIDES[name]) return TITLE_OVERRIDES[name]
  return name
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function summarizeMarkdown(markdown, sentenceCount = 2) {
  if (!markdown) return ''
  const text = markdown
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\r/g, '')

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter((block) => block.length > 24 && !/^[-|]+$/.test(block))

  const blob = paragraphs[0] || text.replace(/\s+/g, ' ').trim()
  const sentences = blob.match(/[^.!?]+[.!?]+/g) ?? (blob ? [blob] : [])
  return sentences.slice(0, sentenceCount).join(' ').trim()
}

function techFromLanguages(languages) {
  const entries = Object.entries(languages ?? {})
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
  if (!total) return []
  return entries
    .filter(([, bytes]) => bytes / total >= MIN_LANGUAGE_SHARE)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await fn(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

export async function fetchGithubProjects({ force = false } = {}) {
  if (!force) {
    try {
      const raw = await readFile(OUT, 'utf8')
      const existing = JSON.parse(raw)
      const fetchedAt = existing?.fetchedAt
      const count = existing.projects?.length ?? 0
      if (fetchedAt && count > 0 && Date.now() - new Date(fetchedAt).getTime() < TTL_MS) {
        console.log(`[projects] using cache (${count} repos, fetched ${fetchedAt})`)
        return existing
      }
    } catch {
      // First run or broken cache — hit the API.
    }
  }

  try {
    const repos = await github(`/users/${GITHUB_LOGIN}/repos?sort=updated&per_page=100`)
    if (!Array.isArray(repos)) throw new Error('repos payload was not a list')

    const excluded = new Set([GITHUB_LOGIN, ...EXCLUDE_REPOS])
    const kept = repos.filter((repo) => !repo.fork && !repo.private && !excluded.has(repo.name))

    const projects = await mapPool(kept, 4, async (repo) => {
      const [langPayload, readme] = await Promise.all([
        github(`/repos/${GITHUB_LOGIN}/${repo.name}/languages`).catch(() => ({})),
        github(`/repos/${GITHUB_LOGIN}/${repo.name}/readme`, {
          Accept: 'application/vnd.github.raw',
        }).catch(() => null),
      ])

      const languages =
        langPayload && typeof langPayload === 'object' && !Array.isArray(langPayload)
          ? langPayload
          : {}
      let tech = techFromLanguages(languages)
      if (tech.length === 0 && repo.language) tech = [repo.language]
      const dominant = tech[0] || repo.language || 'JavaScript'
      const fromReadme = summarizeMarkdown(typeof readme === 'string' ? readme : '', 2)
      const fromReadmeLong = summarizeMarkdown(typeof readme === 'string' ? readme : '', 4)
      const desc = (repo.description || '').trim()
      const stubby = desc.length > 0 && desc.length < 50
      const blurb =
        BLURB_OVERRIDES[repo.name] ||
        (!stubby && desc) ||
        fromReadme ||
        desc ||
        `A public ${dominant} project.`

      return {
        id: repo.name,
        name: repo.name,
        title: prettyTitle(repo.name),
        blurb,
        details: fromReadmeLong || blurb,
        tech,
        language: dominant,
        accent: LANGUAGE_ACCENT[dominant] ?? 'jade',
        repo: repo.html_url,
        live: repo.homepage || null,
        updatedAt: repo.updated_at,
        image: `/projects/${repo.name}.png`,
      }
    })

    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    const payload = { fetchedAt: new Date().toISOString(), projects }
    await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(`[projects] wrote ${projects.length} repos → src/data/github-projects.json`)
    return payload
  } catch (error) {
    try {
      const existing = JSON.parse(await readFile(OUT, 'utf8'))
      if (existing.projects?.length) {
        console.warn(`[projects] fetch failed (${error.message}), using snapshot`)
        return existing
      }
    } catch {
      // no snapshot
    }
    throw error
  }
}

export function githubProjectsPlugin() {
  return {
    name: 'github-projects',
    async buildStart() {
      try {
        await fetchGithubProjects({ force: process.env.PROJECTS_REFRESH === '1' })
      } catch (error) {
        console.warn(`[projects] fetch failed, keeping last snapshot: ${error.message}`)
      }
    },
  }
}
