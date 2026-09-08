import { motion, useReducedMotion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useTypewriter } from '../hooks/useTypewriter'
import { heroContainer, heroItem, heroLine } from '../lib/motion'
import { triggerProjectsEnter } from '../lib/projectsWipe'
import { EggLoader } from './EggLoader'
import { Button } from './Button'

// three.js is a large dependency — loading it lazily lets the type paint
// immediately while the 3D scene streams in behind a placeholder.
const MascotScene = lazy(() => import('./three/MascotScene'))

/**
 * The hero is the only orchestrated animation on the site: the eyebrow, name,
 * tagline and buttons arrive in sequence, and the mascot frame follows. Every
 * section after this one renders statically.
 */
export function Hero() {
  const { isDark } = useTheme()
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const typed = useTypewriter(SITE.taglines, { reducedMotion: Boolean(reducedMotion) })

  return (
    <section id="hero" className="mx-auto w-full max-w-6xl px-6 pt-28 pb-16 sm:px-10 md:pt-36 md:pb-24">
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="grid gap-12 md:grid-cols-12 md:items-center md:gap-8"
      >
        <div className="md:col-span-6">
          <motion.p variants={heroItem} className="micro text-ink/45 dark:text-bone/45">
            Software engineering student
            <span className="mx-2 text-punch">/</span>
            SMU Computing &amp; Information Systems
          </motion.p>

          {/* Poster-scale name. The wrapper clips it so the letters rise into
              place rather than fading in. */}
          <h1 className="mt-5 overflow-hidden">
            <motion.span
              variants={heroLine}
              className="block text-[clamp(4.5rem,17vw,10.5rem)] leading-[0.86] font-bold"
            >
              {SITE.name.toUpperCase()}
              <span className="text-punch">.</span>
            </motion.span>
          </h1>

          <motion.p
            variants={heroItem}
            className="mt-6 font-display text-2xl leading-tight font-bold md:text-3xl"
            aria-live="polite"
          >
            <span className="text-ink/45 dark:text-bone/45">I&apos;m a </span>
            <span>{typed}</span>
            {!reducedMotion && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] bg-punch"
                style={{ animation: 'caret-blink 1s step-end infinite' }}
              />
            )}
          </motion.p>

          <motion.p
            variants={heroItem}
            className="mt-6 max-w-md leading-relaxed text-ink/60 dark:text-bone/60"
          >
            Undergraduate at the {SITE.school}. Most of my time goes into software
            engineering, cybersecurity and AI — and into building things just to
            find out how they break.
          </motion.p>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              href="#projects"
              onClick={(event) => {
                event.preventDefault()
                triggerProjectsEnter()
                document.getElementById('projects')?.scrollIntoView({
                  behavior: reducedMotion ? 'auto' : 'smooth',
                })
              }}
            >
              See projects
              <span aria-hidden>→</span>
            </Button>
            <Button
              variant="outline"
              href="#contact"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Get in touch
            </Button>
          </motion.div>
        </div>

        {/* ---- Mascot ---- */}
        <motion.div
          variants={heroItem}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[420px] w-full md:col-span-6 md:h-[520px]"
        >
          {/* Angular staging: an outlined square rotated behind the mascot, and
              one solid block to break the symmetry. No blurred glow. */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 aspect-square h-[76%] -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-ink/12 dark:border-bone/12"
          />
          <div aria-hidden className="absolute top-2 right-2 h-14 w-14 bg-solar" />

          <Suspense fallback={<EggLoader />}>
            <MascotScene
              isDark={isDark}
              quality={isMobile ? 'low' : 'high'}
              reducedMotion={Boolean(reducedMotion)}
            />
          </Suspense>

          {/* Sticker */}
          <span className="absolute bottom-2 left-2 -rotate-6 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.08em] text-paper uppercase dark:border-bone dark:bg-bone dark:text-void">
            @{SITE.handle}
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
