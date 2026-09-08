import generated from './github-projects.json'

export {
  ACCENTS,
  EXCLUDE_REPOS,
  GITHUB_LOGIN,
  LANGUAGE_ACCENT,
  LANGUAGE_COLORS,
} from './project-config.js'

export const PROJECTS = generated.projects ?? []
export const PROJECTS_FETCHED_AT = generated.fetchedAt ?? null
