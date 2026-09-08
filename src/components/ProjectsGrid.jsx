import { PROJECTS } from '../data/projects'
import { ProjectCard } from './ProjectCard'
import { Section, SectionHeader } from './Section'

export function ProjectsGrid() {
  return (
    <Section id="projects" className="pb-20 md:pb-28">
      <SectionHeader
        index="03"
        label="Projects"
        accent="text-punch"
        title="Stuff I've built"
        lead="School projects, side quests, and things I started at 1am. Hover to tilt, open Details for the longer story."
      />

      <div className="grid items-start gap-7 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </Section>
  )
}
