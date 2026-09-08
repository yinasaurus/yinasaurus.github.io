/**
 * ⚠️ PLACEHOLDER COPY — this is the one file to edit.
 *
 * `blurb` shows on the collapsed card, `details` reveals when the card is
 * expanded, and `tech` renders as tags (see `./tech.js` to give a new
 * technology its own accent colour). `accent` picks the card's colour and must
 * be one of: volt | punch | jade | solar.
 */
export const PROJECTS = [
  {
    id: 'wad-grp-proj',
    name: 'wad-grp-proj',
    title: 'WAD Group Project',
    accent: 'volt',
    blurb:
      'A full-stack web application built with my team for SMU’s Web Application Development module.',
    details:
      'A multi-page web app covering the full flow: responsive UI, user accounts, and a relational database behind the scenes. I worked across the frontend and the data layer, and it was my first real taste of building something with a team instead of alone.',
    tech: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
    repo: 'https://github.com/yinasaurus/wad-grp-proj',
    live: null,
  },
  {
    id: 'dejavistaa',
    name: 'dejavistaa',
    title: 'Dejavistaa',
    accent: 'punch',
    blurb: 'A place to capture the spots you’ve been to and the ones you keep meaning to revisit.',
    details:
      'Built around the feeling of "I’ve been here before" — save locations, attach notes and photos to them, and browse them back later. Most of the work went into designing the data model and keeping the interface fast and uncluttered.',
    tech: ['JavaScript', 'HTML', 'CSS', 'Firebase'],
    repo: 'https://github.com/yinasaurus/dejavistaa',
    live: null,
  },
  {
    id: 'e-waste',
    name: 'e-waste',
    title: 'E-Waste',
    accent: 'jade',
    blurb:
      'An e-waste awareness and recycling project — making it easier to figure out where old electronics should go.',
    details:
      'Helps people find nearby drop-off points and understand what actually happens to their old devices. The goal was to remove the "I don’t know what to do with this" excuse that leaves electronics sitting in a drawer for years.',
    tech: ['Python', 'JavaScript', 'HTML', 'CSS', 'MySQL'],
    repo: 'https://github.com/yinasaurus/e-waste',
    live: null,
  },
]

/** Card accents — kept as full class strings so Tailwind can see them. */
export const ACCENTS = {
  volt: { bar: 'bg-volt', text: 'text-volt' },
  punch: { bar: 'bg-punch', text: 'text-punch' },
  jade: { bar: 'bg-jade', text: 'text-jade' },
  solar: { bar: 'bg-solar', text: 'text-solar' },
}
