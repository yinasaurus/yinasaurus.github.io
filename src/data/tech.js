/**
 * Technologies are tagged with one of the four accent colours, shown as a small
 * square marker beside the label. The tag itself is always the same square,
 * bordered, monospaced shape — the colour is the only thing that varies, which
 * keeps a row of eight tags from turning into confetti.
 *
 * Add new entries here as you add new tech; anything missing gets the violet.
 */
const TECH_ACCENT = {
  React: 'bg-jade',
  'React Three Fiber': 'bg-jade',
  'Vue.js': 'bg-jade',
  'Node.js': 'bg-jade',
  Supabase: 'bg-jade',
  'Tailwind CSS': 'bg-jade',

  JavaScript: 'bg-solar',
  Python: 'bg-solar',
  Firebase: 'bg-solar',
  Cloud: 'bg-solar',

  HTML: 'bg-punch',
  Java: 'bg-punch',
  MySQL: 'bg-punch',
  Figma: 'bg-punch',
  Git: 'bg-punch',
  Cybersecurity: 'bg-punch',
}

export const techAccent = (name) => TECH_ACCENT[name] ?? 'bg-volt'

/** Grouped skills rendered by the TechStack section. */
export const TECH_GROUPS = [
  {
    title: 'Frontend',
    items: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    title: 'Backend & Data',
    items: ['Python', 'Java', 'Node.js', 'Flask', 'MySQL', 'Firebase'],
  },
  {
    title: 'Exploring',
    items: ['Cybersecurity', 'Machine Learning', 'Cloud', 'React Three Fiber'],
  },
]
