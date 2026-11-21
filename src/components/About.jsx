import { motion, useReducedMotion } from 'framer-motion'
import { scrollReveal } from '../lib/motion'
import { ClawMark } from './DinoMarks'
import { Section, SectionHeader } from './Section'

const FACTS = [
  ['Based', 'Singapore'],
  ['Cohort', 'Class of 2028'],
  ['Open to', 'Web, data, and applied ML internships'],
]

export function About() {
  const reduced = useReducedMotion()

  return (
    <Section id="about" className="pb-20 md:pb-28">
      <SectionHeader
        index="02"
        label="About"
        title={
          <>
            How I actually
            <br />
            work.
          </>
        }
        lead="What it’s like to be on a project with me — not another intro."
      />

      <motion.div
        className="grid gap-12 md:grid-cols-12 md:gap-8"
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={reduced ? undefined : scrollReveal} className="space-y-6 md:col-span-7">
          <p className="text-base leading-relaxed text-ink/75 md:text-lg dark:text-bone/75">
            I start with a thin slice that runs, then tighten. Modules and
            hackathons are where I steal problems; the useful leftover is
            knowing how a model drifts, a rules engine cheats, or a bot dies
            in a group chat.
          </p>
          <p className="text-base leading-relaxed text-ink/75 md:text-lg dark:text-bone/75">
            Code review is the point. I want to own a slice of a real codebase
            — web, data, or the glue — and be told when I&rsquo;m wrong.
          </p>
        </motion.div>

        <motion.dl variants={reduced ? undefined : scrollReveal} className="md:col-span-5">
          {FACTS.map(([term, value], i) => (
            <div key={term} className={`flex gap-3 py-5 ${i > 0 ? 'rule' : ''}`}>
              <ClawMark className="mt-1.5 h-3 w-3 shrink-0 text-jade" />
              <div className="min-w-0">
                <dt className="micro text-ink/55 dark:text-bone/55">{term}</dt>
                <dd className="mt-2 font-display text-lg font-bold break-words">{value}</dd>
              </div>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </Section>
  )
}
