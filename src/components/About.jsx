import { SITE } from '../data/site'
import { ClawMark } from './DinoMarks'
import { Section, SectionHeader } from './Section'

const FACTS = [
  ['Studying', 'Computing & Information Systems, SMU'],
  ['Curious about', 'Cybersecurity & applied AI'],
  ['Currently', 'Building side projects and breaking them'],
]

export function About() {
  return (
    <Section id="about" className="pb-20 md:pb-28">
      <SectionHeader
        index="01"
        label="About"
        title={
          <>
            I build things,
            <br />
            then break them.
          </>
        }
        lead="Learning in public means most of what I make ends up on GitHub — rough edges and all."
      />

      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="space-y-6 md:col-span-7">
          <p className="text-lg leading-relaxed text-ink/75 dark:text-bone/75">
            I&rsquo;m an undergraduate at the {SITE.school}, where most of my time
            goes into figuring out how things work and then rebuilding them
            slightly differently.
          </p>
          <p className="text-lg leading-relaxed text-ink/75 dark:text-bone/75">
            My interests sit where software engineering, cybersecurity and AI
            overlap — which mostly means I like building something, then
            thinking about how someone else would take it apart.
          </p>
        </div>

        {/* Facts as a definition list with rules between rows: no boxes, no
            shadows, no repeated card shape. */}
        <dl className="md:col-span-5">
          {FACTS.map(([term, value], i) => (
            <div key={term} className={`flex gap-3 py-5 ${i > 0 ? 'rule' : ''}`}>
              <ClawMark className="mt-1.5 h-3 w-3 shrink-0 text-jade" />
              <div>
                <dt className="micro text-ink/40 dark:text-bone/40">{term}</dt>
                <dd className="mt-2 font-display text-lg font-bold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
