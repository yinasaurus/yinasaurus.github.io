import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACCENTS } from '../data/projects'
import { useIsTouch } from '../hooks/useMediaQuery'
import { ProjectCover } from './ProjectCover'
import { Tag } from './Tag'

const TILT_SPRING = { stiffness: 220, damping: 18, mass: 0.6 }
const MAX_TILT = 6

export function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [open, setOpen] = useState(false)
  const isTouch = useIsTouch()
  const accent = ACCENTS[project.accent] ?? ACCENTS.jade

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), TILT_SPRING)
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), TILT_SPRING)

  const handlePointerMove = (event) => {
    if (isTouch || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const handlePointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <>
      <motion.article style={{ perspective: 1000 }} className="h-full">
        <motion.div
          ref={cardRef}
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setOpen(true)
            }
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            rotateX: isTouch ? 0 : rotateX,
            rotateY: isTouch ? 0 : rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={isTouch ? undefined : { x: -4, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="panel group flex h-full cursor-pointer flex-col shadow-hard"
        >
          <div className={`h-2 w-full ${accent.bar}`} />

          <div className="relative aspect-[16/10] overflow-hidden">
            <ProjectCover project={project} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent px-5 pt-16 pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {project.tech.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 4).map((tech) => (
                    <li key={tech}>
                      <Tag label={tech} />
                    </li>
                  ))}
                </ul>
              )}
              <span className="micro text-paper">View project →</span>
            </div>
          </div>

          <div className="flex h-full flex-col p-6" style={{ transform: 'translateZ(22px)' }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`font-mono text-xs font-bold ${accent.text}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.name} on GitHub`}
                onClick={(event) => event.stopPropagation()}
                className="text-ink/35 transition-colors hover:text-ink dark:text-bone/35 dark:hover:text-bone"
              >
                <GithubIcon />
              </a>
            </div>

            <h3 className="mt-5 text-2xl leading-tight font-bold">{project.title}</h3>
            <p className="mt-1.5 font-mono text-[0.7rem] tracking-wider text-ink/40 dark:text-bone/40">
              {project.name}
            </p>
            <p className="mt-4 line-clamp-3 leading-relaxed text-ink/70 dark:text-bone/70">
              {project.blurb}
            </p>
          </div>
        </motion.div>
      </motion.article>

      <ProjectModal project={project} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function ProjectModal({ project, open, onClose }) {
  const closeRef = useRef(null)
  const accent = ACCENTS[project.accent] ?? ACCENTS.jade

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            aria-label="Close project"
            className="absolute inset-0 bg-ink/55 dark:bg-void/75"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-${project.id}-title`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="panel relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-hard-lg"
          >
            <div className={`h-2 w-full ${accent.bar}`} />
            <div className="aspect-[16/9] w-full">
              <ProjectCover project={project} className="h-full w-full" />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`micro ${accent.text}`}>{project.name}</p>
                  <h2 id={`project-${project.id}-title`} className="mt-2 text-3xl font-bold">
                    {project.title}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="micro border-2 border-ink px-3 py-2 dark:border-bone"
                >
                  Close
                </button>
              </div>
              <p className="mt-5 leading-relaxed text-ink/70 dark:text-bone/70">{project.details}</p>
              {project.tech.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {project.tech.map((tech) => (
                    <li key={tech}>
                      <Tag label={tech} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="rule mt-8 flex flex-wrap items-center gap-5 pt-5">
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="micro border-b-2 border-ink pb-0.5 hover:border-punch hover:text-punch dark:border-bone"
                >
                  GitHub ↗
                </a>
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="micro text-ink/45 hover:text-ink dark:text-bone/45 dark:hover:text-bone"
                  >
                    Live ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.15v3.19c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}
