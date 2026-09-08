import { SITE } from '../data/site'
import { Section, SectionHeader } from './Section'

const LINKS = [
  { label: 'GitHub', value: `@${SITE.handle}`, href: SITE.github, hover: 'hover:bg-volt' },
  { label: 'LinkedIn', value: 'li-shiyin', href: SITE.linkedin, hover: 'hover:bg-jade' },
  { label: 'Email', value: SITE.email, href: `mailto:${SITE.email}`, hover: 'hover:bg-punch' },
]

/**
 * Contact is a list of oversized type rows rather than a row of tiles — the
 * links are the largest thing on the page after the hero, which is the point.
 * Hovering floods the row with its accent colour.
 */
export function Contact() {
  return (
    <Section id="contact" className="pb-24 md:pb-32">
      <SectionHeader
        index="05"
        label="Contact"
        accent="text-solar"
        title="Say hello"
        lead="Internships, project ideas, or just to argue about tabs versus spaces — my inbox is open."
      />

      <ul>
        {LINKS.map((link) => (
          <li key={link.label} className="rule">
            <a
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className={`group flex items-center gap-5 px-2 py-6 transition-colors duration-150 md:px-4 md:py-8 ${link.hover} hover:text-paper dark:hover:text-void`}
            >
              <span className="micro w-24 shrink-0 opacity-45 transition-opacity group-hover:opacity-100">
                {link.label}
              </span>
              <span className="font-display text-2xl font-semibold md:text-4xl">
                {link.value}
              </span>
              <span
                aria-hidden
                className="ml-auto text-2xl transition-transform duration-200 group-hover:translate-x-1.5 md:text-3xl"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
        <li className="rule" />
      </ul>
    </Section>
  )
}
