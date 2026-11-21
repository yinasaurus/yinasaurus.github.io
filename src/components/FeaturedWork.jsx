import { useWipeNavigate } from '../context/WipeNavigate'
import { featuredProjects } from '../data/projects'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

export function FeaturedWork() {
  const go = useWipeNavigate()
  const projects = featuredProjects()

  if (projects.length === 0) return null

  return (
    <Section id="featured" className="pb-20 md:pb-28">
      <SectionHeader
        index="01"
        label="Work"
        accent="text-punch"
        title="Featured work"
        lead="Three I’d lead with. The full list is on the projects page."
      />

      <ul className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {projects.map((project) => (
          <li key={project.id} className="min-w-0 border-t-2 border-ink/15 pt-6 dark:border-bone/15">
            <h3 className="min-w-0 text-2xl leading-tight font-bold break-words">{project.title}</h3>
            <p className="mt-3 min-w-0 text-base leading-relaxed break-words text-ink/70 dark:text-bone/70">
              {project.impact}
            </p>
            {project.tech.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 3).map((tech) => (
                  <li key={tech}>
                    <Tag label={tech} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="micro inline-flex min-h-11 items-center border-b-2 border-ink pb-0.5 hover:border-punch hover:text-punch focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none dark:border-bone"
              >
                GitHub ↗
              </a>
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="micro inline-flex min-h-11 items-center text-ink/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none dark:text-bone/60 dark:hover:text-bone"
                >
                  Live ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10">
        <a
          href="/projects"
          onClick={(event) => {
            event.preventDefault()
            go('/projects')
          }}
          className="micro inline-flex min-h-11 items-center border-b-2 border-ink pb-0.5 hover:border-punch hover:text-punch focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none dark:border-bone"
        >
          View all projects
          <span aria-hidden className="ml-2">
            →
          </span>
        </a>
      </p>
    </Section>
  )
}
