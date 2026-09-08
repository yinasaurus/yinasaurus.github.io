/**
 * ⚠️ Edit this file to control what shows on /projects.
 *
 * Add a GitHub repo name to hide it. Forks and the profile README repo
 * (`yinasaurus`) are always filtered out.
 *
 * Optional screenshots: drop a PNG at `public/projects/{repo-name}.png`.
 */
export const GITHUB_LOGIN = 'yinasaurus'

export const EXCLUDE_REPOS = ['vvc-telebot']

/** Optional display names when kebab-case looks awkward. */
export const TITLE_OVERRIDES = {
  'yinasaurus.github.io': 'This site',
  'wad-grp-proj': 'WAD Group Project',
  'e-waste': 'E-Waste',
  sgtelemahjong: 'SG Tele Mahjong',
  organicchemgame: 'Organic Chem Game',
  tiktokjam: 'TikTok Jam',
  hack4health: 'Hack4Health',
}

/** Used when GitHub has no description / README worth showing. */
export const BLURB_OVERRIDES = {
  dejavistaa:
    'A place to capture the spots you’ve been to and the ones you keep meaning to revisit.',
  'e-waste':
    'An e-waste awareness and recycling project — making it easier to figure out where old electronics should go.',
  'wad-grp-proj':
    'A full-stack web application built with my team for SMU’s Web Application Development module.',
}

export const ACCENTS = {
  volt: { bar: 'bg-volt', text: 'text-volt', hex: '#6c3bf4' },
  punch: { bar: 'bg-punch', text: 'text-punch', hex: '#ff4d8d' },
  jade: { bar: 'bg-jade', text: 'text-jade', hex: '#17c79a' },
  solar: { bar: 'bg-solar', text: 'text-solar', hex: '#ffb020' },
}

/** GitHub-linguist-ish colours for the generated cover art. */
export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  PHP: '#4F5D95',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Vue: '#41b883',
  Dart: '#00B4AB',
  Swift: '#F05138',
  Markdown: '#083fa1',
}

export const LANGUAGE_ACCENT = {
  JavaScript: 'solar',
  TypeScript: 'volt',
  Python: 'solar',
  HTML: 'punch',
  CSS: 'volt',
  PHP: 'volt',
  Java: 'punch',
  Kotlin: 'volt',
  Go: 'jade',
  Rust: 'punch',
  Vue: 'jade',
  Dart: 'jade',
  Swift: 'punch',
  'C++': 'punch',
  'C#': 'volt',
}
