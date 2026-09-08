import { SITE } from '../data/site'
import { Section, SectionHeader } from './Section'

const LINKS = [
  { label: 'GitHub', value: `@${SITE.handle}`, href: SITE.github, hover: 'hover:bg-volt', wrap: 'break-words' },
  { label: 'LinkedIn', value: 'li-shiyin', href: SITE.linkedin, hover: 'hover:bg-jade', wrap: 'break-words' },
  {
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    hover: 'hover:bg-punch',
    wrap: 'break-words [overflow-wrap:anywhere]',
  },
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
              className={`group flex min-h-11 flex-col items-stretch gap-2 px-1 py-5 transition-colors duration-150 sm:flex-row sm:items-center sm:gap-5 sm:px-2 sm:py-6 md:px-4 md:py-8 ${link.hover} hover:text-paper dark:hover:text-void`}
            >
              <span className="micro shrink-0 opacity-45 transition-opacity group-hover:opacity-100 sm:w-24">
                {link.label}
              </span>
              <span
                className={`min-w-0 font-display text-xl font-semibold sm:text-2xl md:text-4xl ${link.wrap}`}
              >
                {link.label === 'Email' ? <EmailValue value={link.value} /> : link.value}
              </span>
              <span
                aria-hidden
                className="hidden text-2xl transition-transform duration-200 group-hover:translate-x-1.5 sm:ml-auto sm:inline md:text-3xl"
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

/** Prefer wrapping at @ so the SMU address doesn't split mid-token. */
function EmailValue({ value }) {
  const at = value.indexOf('@')
  if (at < 0) return value
  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  )
}
