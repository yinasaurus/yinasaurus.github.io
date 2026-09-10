import { motion, useReducedMotion } from 'framer-motion'
import { TECH_GROUPS } from '../data/tech'
import { scrollReveal } from '../lib/motion'
import { ClawMark } from './DinoMarks'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

export function TechStack() {
  const reduced = useReducedMotion()

  return (
    <Section id="stack" className="pb-20 md:pb-28">
      <SectionHeader
        index="02"
        label="Skills"
        accent="text-jade"
        title="Things I build with"
        lead="A quick scan — languages I write, tools I ship with, and what I’m currently poking at."
      />

      {/* Rows rather than a card grid — the label sits in the margin and the
          tags run across the measure, so the eye reads down the labels. */}
      <div>
        {TECH_GROUPS.map((group) => (
          <motion.div
            key={group.title}
            className="rule grid gap-4 py-7 md:grid-cols-12 md:gap-8"
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={reduced ? undefined : scrollReveal}
          >
              <h3 className="micro flex items-center gap-2 pt-2 text-ink/55 md:col-span-3 dark:text-bone/55">
              <ClawMark className="h-2.5 w-2.5" />
              {group.title}
            </h3>
            <ul className="flex flex-wrap gap-2 md:col-span-9">
              {group.items.map((item) => (
                <li key={item}>
                  <Tag label={item} />
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
        <div className="rule" />
      </div>
    </Section>
  )
}
