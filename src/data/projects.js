import generated from './github-projects.json'
import { FEATURED_BLURBS, PINNED } from './project-config.js'

export {
  ACCENTS,
  EXCLUDE_REPOS,
  FEATURED_BLURBS,
  GITHUB_LOGIN,
  LANGUAGE_ACCENT,
  LANGUAGE_COLORS,
  MEDIA_OVERRIDES,
  PINNED,
  TECH_OVERRIDES,
} from './project-config.js'

export const PROJECTS = generated.projects ?? []
export const PROJECTS_FETCHED_AT = generated.fetchedAt ?? null

/** Homepage featured row: pin order from `PINNED`, at most three, skip missing. */
export function featuredProjects(projects = PROJECTS) {
  const byId = new Map(projects.map((project) => [project.id, project]))
  return PINNED.map((id) => {
    const project = byId.get(id)
    if (!project) return null
    return {
      ...project,
      impact: FEATURED_BLURBS[id] || project.blurb,
    }
  }).filter(Boolean).slice(0, 3)
}
