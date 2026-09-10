import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACCENTS, LANGUAGE_ACCENT, LANGUAGE_COLORS } from '../data/projects'
import { useIsTouch } from '../hooks/useMediaQuery'
import { ProjectCover } from './ProjectCover'
import { Tag } from './Tag'

const ACCENT_CYCLE = ['solar', 'volt', 'jade', 'punch']

function languageHex(project) {
  return LANGUAGE_COLORS[project.language] ?? (ACCENTS[project.accent] ?? ACCENTS.jade).hex
}

function themeAccent(project, index = 0) {
  const fromLang = LANGUAGE_ACCENT[project.language]
  if (fromLang && ACCENTS[fromLang]) return ACCENTS[fromLang]
  return ACCENTS[ACCENT_CYCLE[index % ACCENT_CYCLE.length]]
}

const TILT_SPRING = { stiffness: 220, damping: 18, mass: 0.6 }
const MAX_TILT = 6

export function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [open, setOpen] = useState(false)
  const isTouch = useIsTouch()
  const accent = themeAccent(project, index)
  const swatch = languageHex(project)

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
          className="panel group flex h-full cursor-pointer flex-col shadow-hard focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="h-2 w-full" style={{ backgroundColor: swatch }} />

          <div className="relative aspect-[16/10] overflow-hidden">
            <ProjectCover project={project} index={index} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-ink/80 via-ink/35 to-transparent px-5 pt-16 pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="micro text-paper">View project →</span>
            </div>
          </div>

          <div className="flex h-full flex-col p-6" style={{ transform: 'translateZ(22px)' }}>
            <div className="flex items-center justify-between gap-3">
              <span className={`font-mono text-xs font-bold ${accent.text}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {project.language && (
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-wider text-ink/50 dark:text-bone/50">
                  <span
                    className="h-2.5 w-2.5 rounded-full border-2 border-ink dark:border-bone"
                    style={{ backgroundColor: swatch }}
                    aria-hidden
                  />
                  {project.language}
                </span>
              )}
            </div>

            <h3 className="mt-5 min-w-0 text-2xl leading-tight font-bold break-words">{project.title}</h3>
            <p className="mt-1.5 font-mono text-[0.7rem] tracking-wider text-ink/55 dark:text-bone/55">
              {project.name}
            </p>
            <p className="mt-4 line-clamp-3 leading-relaxed text-ink/70 dark:text-bone/70">
              {project.blurb}
            </p>
            {project.tech.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((tech) => (
                  <li key={tech}>
                    <Tag label={tech} />
                  </li>
                ))}
              </ul>
            )}
            <p className="micro mt-5 text-punch md:hidden">View project →</p>
          </div>
        </motion.div>
      </motion.article>

      <ProjectModal project={project} index={index} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function ProjectModal({ project, index = 0, open, onClose }) {
  const closeRef = useRef(null)
  const accent = themeAccent(project, index)
  const swatch = languageHex(project)

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
            <div className="h-2 w-full" style={{ backgroundColor: swatch }} />
            <div className="aspect-[16/9] w-full bg-ink">
              <ProjectCover project={project} index={index} mode="modal" className="h-full w-full" />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`micro ${accent.text}`}>{project.name}</p>
                  <h2 id={`project-${project.id}-title`} className="mt-2 text-2xl font-bold break-words sm:text-3xl">
                    {project.title}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="micro inline-flex min-h-11 shrink-0 items-center border-2 border-ink px-3 hover:bg-ink hover:text-paper focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none dark:border-bone dark:hover:bg-bone dark:hover:text-void"
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
              <div className="rule mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
