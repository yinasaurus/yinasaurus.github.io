import { access } from 'node:fs/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BLURB_OVERRIDES,
  EXCLUDE_REPOS,
  GITHUB_LOGIN,
  LANGUAGE_ACCENT,
  MEDIA_OVERRIDES,
  TECH_OVERRIDES,
  TITLE_OVERRIDES,
} from './src/data/project-config.js'
import { youtubeVideoId } from './src/lib/youtube.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(ROOT, 'src/data/github-projects.json')
const REST = 'https://api.github.com'
const TTL_MS = 6 * 60 * 60 * 1000
const MIN_LANGUAGE_SHARE = 0.05
const NESTED_PKG_DIRS = ['client', 'frontend', 'app', 'web', 'server', 'backend']

const PKG_TO_BADGE = {
  react: 'React',
  vue: 'Vue',
  nuxt: 'Nuxt',
  next: 'Next.js',
  express: 'Express',
  fastify: 'Fastify',
  koa: 'Koa',
  '@nestjs/core': 'NestJS',
  svelte: 'Svelte',
  '@angular/core': 'Angular',
  'react-native': 'React Native',
  expo: 'Expo',
  three: 'Three.js',
  '@react-three/fiber': 'React Three Fiber',
  tailwindcss: 'Tailwind CSS',
  vite: 'Vite',
  prisma: 'Prisma',
  mongoose: 'MongoDB',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  mysql2: 'MySQL',
  pg: 'PostgreSQL',
  sqlite3: 'SQLite',
  firebase: 'Firebase',
  'firebase-admin': 'Firebase',
  '@supabase/supabase-js': 'Supabase',
  electron: 'Electron',
  graphql: 'GraphQL',
  'socket.io': 'Socket.IO',
  'framer-motion': 'Framer Motion',
  'react-router-dom': 'React Router',
  jquery: 'jQuery',
  bootstrap: 'Bootstrap',
  d3: 'D3',
  'chart.js': 'Chart.js',
  flask: 'Flask',
  django: 'Django',
  fastapi: 'FastAPI',
  numpy: 'NumPy',
  pandas: 'Pandas',
  tensorflow: 'TensorFlow',
  torch: 'PyTorch',
  openai: 'OpenAI',
  telegram: 'Telegram',
  'python-telegram-bot': 'Telegram',
}

const SKIP_PKGS = new Set([
  'typescript',
  'eslint',
  'prettier',
  'vitest',
  'jest',
  'mocha',
  'chai',
  'cypress',
  'playwright',
  'puppeteer',
  'autoprefixer',
  'postcss',
  'sass',
  'less',
  'webpack',
  'rollup',
  'esbuild',
  'nodemon',
  'concurrently',
  'rimraf',
  'cross-env',
  'husky',
  'lint-staged',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react',
  '@tailwindcss/vite',
  'oxlint',
  'jsdom',
  'happy-dom',
])

const SERVER_PKGS = new Set(['express', 'fastify', 'koa', '@nestjs/core'])

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

function parsePackageJson(raw) {
  if (!raw || typeof raw !== 'string') return { badges: [], server: false }
  try {
    const pkg = JSON.parse(raw)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    const badges = []
    let server = false
    for (const name of Object.keys(deps)) {
      const key = name.toLowerCase()
      if (SKIP_PKGS.has(key) || SKIP_PKGS.has(name)) continue
      if (SERVER_PKGS.has(key)) server = true
      const badge = PKG_TO_BADGE[key] ?? PKG_TO_BADGE[name]
      if (badge) badges.push(badge)
    }
    return { badges, server }
  } catch {
    return { badges: [], server: false }
  }
}

function parsePythonDeps(raw) {
  if (!raw || typeof raw !== 'string') return []
  const badges = []
  const lines = raw.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
    const token = trimmed
      .split(/[=<>~\[]/)[0]
      .split(';')[0]
      .trim()
      .toLowerCase()
      .replace(/['"]/g, '')
    if (!token) continue
    const badge = PKG_TO_BADGE[token]
    if (badge) badges.push(badge)
  }
  for (const [pkg, badge] of Object.entries(PKG_TO_BADGE)) {
    if (raw.toLowerCase().includes(pkg) && !badges.includes(badge)) {
      if (['flask', 'django', 'fastapi', 'numpy', 'pandas', 'tensorflow', 'torch', 'openai'].includes(pkg)) {
        badges.push(badge)
      }
    }
  }
  return badges
}

function unique(list) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    if (!item || seen.has(item)) continue
    seen.add(item)
    out.push(item)
  }
  return out
}

function mergeTech(frameworks, languages) {
  return unique([...frameworks, ...languages])
}

async function imageExists(name) {
  try {
    await access(resolve(ROOT, 'public/projects', `${name}.png`))
    return true
  } catch {
    return false
  }
}

function resolveMedia({ name, readme, override, hasImage }) {
  if (override?.type) {
    if (override.type === 'youtube') {
      const id = youtubeVideoId(override.src) || override.src
      return { type: 'youtube', src: id }
    }
    return { type: override.type, src: override.src || '' }
  }
  const fromReadme = youtubeVideoId(typeof readme === 'string' ? readme : '')
  if (fromReadme) return { type: 'youtube', src: fromReadme }
  if (hasImage) return { type: 'image', src: `/projects/${name}.png` }
  return { type: 'none', src: '' }
}

async function fetchRootListing(repoName) {
  const listing = await github(`/repos/${GITHUB_LOGIN}/${repoName}/contents/`).catch(() => null)
  return Array.isArray(listing) ? listing : []
}

async function fetchRaw(repoName, path) {
  return github(`/repos/${GITHUB_LOGIN}/${repoName}/contents/${path}`, {
    Accept: 'application/vnd.github.raw',
  }).catch(() => null)
}

async function collectManifests(repoName, listing) {
  const names = new Set(listing.map((entry) => entry.name.toLowerCase()))
  const dirs = new Set(
    listing.filter((entry) => entry.type === 'dir').map((entry) => entry.name.toLowerCase()),
  )
  const jobs = []

  if (names.has('package.json')) jobs.push(['pkg', 'package.json'])
  for (const dir of NESTED_PKG_DIRS) {
    if (dirs.has(dir)) jobs.push(['pkg', `${dir}/package.json`])
  }
  if (names.has('requirements.txt')) jobs.push(['py', 'requirements.txt'])
  if (names.has('pyproject.toml')) jobs.push(['py', 'pyproject.toml'])
  if (names.has('pipfile')) jobs.push(['py', 'Pipfile'])

  const frameworks = []
  let server = false
  const fetched = await Promise.all(
    jobs.map(async ([kind, path]) => [kind, await fetchRaw(repoName, path)]),
  )
  for (const [kind, raw] of fetched) {
    if (!raw || typeof raw !== 'string') continue
    if (kind === 'pkg') {
      const parsed = parsePackageJson(raw)
      frameworks.push(...parsed.badges)
      if (parsed.server) server = true
    } else {
      frameworks.push(...parsePythonDeps(raw))
    }
  }
  if (server) frameworks.unshift('Node.js')
  return unique(frameworks)
}

function printTechTable(rows) {
  console.log('\n[projects] tech audit')
  for (const row of rows) {
    const media =
      row.media?.type === 'none' || !row.media
        ? 'none'
        : `${row.media.type} ${row.media.src}`
    console.log(`\n  ${row.name}`)
    console.log(`    languages : ${(row.languages || []).join(', ') || '—'}`)
    console.log(`    frameworks: ${(row.frameworks || []).join(', ') || '—'}`)
    console.log(`    badges    : ${(row.tech || []).join(', ') || '—'}`)
    console.log(`    media     : ${media}`)
  }
  console.log('')
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
        printTechTable(
          existing.projects.map((project) => ({
            name: project.name,
            languages: project.languages ?? [],
            frameworks: project.frameworks ?? [],
            tech: project.tech ?? [],
            media: project.media ?? { type: 'none', src: '' },
          })),
        )
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

    const projects = await mapPool(kept, 3, async (repo) => {
      const [langPayload, readme, listing, hasImage] = await Promise.all([
        github(`/repos/${GITHUB_LOGIN}/${repo.name}/languages`).catch(() => ({})),
        github(`/repos/${GITHUB_LOGIN}/${repo.name}/readme`, {
          Accept: 'application/vnd.github.raw',
        }).catch(() => null),
        fetchRootListing(repo.name),
        imageExists(repo.name),
      ])

      const languages =
        langPayload && typeof langPayload === 'object' && !Array.isArray(langPayload)
          ? langPayload
          : {}
      const languageBadges = techFromLanguages(languages)
      if (languageBadges.length === 0 && repo.language) languageBadges.push(repo.language)
      const frameworks = await collectManifests(repo.name, listing)
      const tech = TECH_OVERRIDES[repo.name] || mergeTech(frameworks, languageBadges)
      const dominant = languageBadges[0] || frameworks[0] || repo.language || 'JavaScript'
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
      const media = resolveMedia({
        name: repo.name,
        readme,
        override: MEDIA_OVERRIDES[repo.name],
        hasImage,
      })

      return {
        id: repo.name,
        name: repo.name,
        title: prettyTitle(repo.name),
        blurb,
        details: fromReadmeLong || blurb,
        tech,
        languages: languageBadges,
        frameworks,
        language: dominant,
        accent: LANGUAGE_ACCENT[dominant] ?? LANGUAGE_ACCENT[tech[0]] ?? 'jade',
        repo: repo.html_url,
        live: repo.homepage || null,
        updatedAt: repo.updated_at,
        media,
        image: media.type === 'image' ? media.src : `/projects/${repo.name}.png`,
      }
    })

    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    const payload = { fetchedAt: new Date().toISOString(), projects }
    await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(`[projects] wrote ${projects.length} repos → src/data/github-projects.json`)
    printTechTable(projects)
    return payload
  } catch (error) {
    try {
      const existing = JSON.parse(await readFile(OUT, 'utf8'))
      if (existing.projects?.length) {
        console.warn(`[projects] fetch failed (${error.message}), using snapshot`)
        printTechTable(
          existing.projects.map((project) => ({
            name: project.name,
            languages: project.languages ?? [],
            frameworks: project.frameworks ?? [],
            tech: project.tech ?? [],
            media: project.media ?? { type: 'none', src: '' },
          })),
        )
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
