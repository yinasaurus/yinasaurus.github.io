import { motion } from 'framer-motion'
import { PROJECTS } from '../data/projects'
import { ProjectCard } from './ProjectCard'
import { Section, SectionHeader } from './Section'

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function ProjectsGrid() {
  return (
    <Section id="projects" className="pb-20 md:pb-28">
      <SectionHeader
        index="03"
        label="Projects"
        accent="text-punch"
        title="Stuff I've built"
        lead="Public repos, newest first. Tap a card for the stack and the longer story."
      />

      {PROJECTS.length === 0 ? (
        <p className="text-ink/55 dark:text-bone/55">
          No public projects yet — or GitHub was napping when this page was built.
        </p>
      ) : (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3"
        >
          {PROJECTS.map((project, index) => (
            <motion.div key={project.id} variants={cardItem} className="h-full">
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </Section>
  )
}
