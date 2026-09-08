import { TECH_GROUPS } from '../data/tech'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

export function TechStack() {
  return (
    <Section id="stack" className="pb-20 md:pb-28">
      <SectionHeader
        index="02"
        label="Stack"
        accent="text-jade"
        title="Things I build with"
        lead="What I've shipped with, what I'm comfortable in, and what I'm currently poking at."
      />

      {/* Rows rather than a card grid — the label sits in the margin and the
          tags run across the measure, so the eye reads down the labels. */}
      <div>
        {TECH_GROUPS.map((group) => (
          <div key={group.title} className="rule grid gap-4 py-7 md:grid-cols-12 md:gap-8">
            <h3 className="micro pt-2 text-ink/40 md:col-span-3 dark:text-bone/40">
              {group.title}
            </h3>
            <ul className="flex flex-wrap gap-2 md:col-span-9">
              {group.items.map((item) => (
                <li key={item}>
                  <Tag label={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rule" />
      </div>
    </Section>
  )
}
