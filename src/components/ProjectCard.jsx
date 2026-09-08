import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { ACCENTS } from '../data/projects'
import { useIsTouch } from '../hooks/useMediaQuery'
import { Tag } from './Tag'

const TILT_SPRING = { stiffness: 220, damping: 18, mass: 0.6 }
const MAX_TILT = 7 // degrees

/**
 * Project cards are the only boxed element on the page — hard border, worn
 * fossil-egg corners, solid offset shadow. That's deliberate: nothing else is
 * a card, so the grid reads as the centre of gravity.
 */
export function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const isTouch = useIsTouch()
  const accent = ACCENTS[project.accent] ?? ACCENTS.volt

  // Cursor position within the card, normalised to -0.5 → 0.5.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  // Tilt away from the cursor. Springs keep it from feeling twitchy, and both
  // stay at 0 on touch devices where there's no hover to speak of.
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
    <motion.article
      layout
      // The parent needs perspective for the child's rotateX/rotateY to read as
      // depth rather than a flat skew.
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        layout
        style={{
          rotateX: isTouch ? 0 : rotateX,
          rotateY: isTouch ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        // Lifting the card up and left widens the gap to its fixed shadow.
        whileHover={isTouch ? undefined : { x: -4, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="panel flex h-full flex-col shadow-hard"
      >
        {/* Accent bar — the card's only flat colour */}
        <div className={`h-2 w-full ${accent.bar}`} />

        <div className="flex h-full flex-col p-6" style={{ transform: 'translateZ(26px)' }}>
          <div className="flex items-baseline justify-between gap-3">
            <span className={`font-mono text-xs font-bold ${accent.text}`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.name} on GitHub`}
              className="text-ink/35 transition-colors hover:text-ink dark:text-bone/35 dark:hover:text-bone"
            >
              <GithubIcon />
            </a>
          </div>

          <h3 className="mt-6 text-2xl leading-tight font-bold">{project.title}</h3>
          <p className="mt-1.5 font-mono text-[0.7rem] tracking-wider text-ink/40 dark:text-bone/40">
            {project.name}
          </p>

          <p className="mt-4 leading-relaxed text-ink/70 dark:text-bone/70">{project.blurb}</p>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="rule mt-5 pt-5 leading-relaxed text-ink/55 dark:text-bone/55">
                  {project.details}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="mt-6 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <li key={tech}>
                <Tag label={tech} />
              </li>
            ))}
          </ul>

          <div className="rule mt-auto flex items-center gap-5 pt-5">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="micro cursor-pointer border-b-2 border-ink pb-0.5 transition-colors hover:border-punch hover:text-punch dark:border-bone"
            >
              {expanded ? 'Less' : 'Details'}
            </button>
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="micro text-ink/45 transition-colors hover:text-ink dark:text-bone/45 dark:hover:text-bone"
            >
              Code ↗
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="micro text-ink/45 transition-colors hover:text-ink dark:text-bone/45 dark:hover:text-bone"
              >
                Live ↗
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.15v3.19c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}
