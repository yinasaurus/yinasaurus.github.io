import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useWipeNavigate } from '../context/WipeNavigate'
import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useIsMobile, useIsTouch } from '../hooks/useMediaQuery'
import { usePointerParallax } from '../hooks/usePointerParallax'
import { useTypewriter } from '../hooks/useTypewriter'
import { heroContainer, heroItem } from '../lib/motion'
import { Button } from './Button'
import { EggLoader } from './EggLoader'

const MascotScene = lazy(() => import('./three/MascotScene'))

/**
 * The hero is the only orchestrated animation on the site: the eyebrow, name,
 * tagline and buttons arrive in sequence, and the mascot frame follows. Every
 * section after this one renders statically.
 */
export function Hero() {
  const { isDark } = useTheme()
  const isMobile = useIsMobile()
  const isTouch = useIsTouch()
  const reducedMotion = useReducedMotion()
  const go = useWipeNavigate()
  const typed = useTypewriter(SITE.taglines)
  const parallaxOn = !isTouch
  const { x, y } = usePointerParallax({ enabled: parallaxOn, stiffness: 70, damping: 22 })
  const shiftX = useTransform(x, (value) => value * 18)
  const shiftY = useTransform(y, (value) => value * 10)

  return (
    <section id="hero" className="mx-auto w-full max-w-6xl px-6 pt-28 pb-16 sm:px-10 md:pt-36 md:pb-24">
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="grid gap-12 md:grid-cols-12 md:items-center md:gap-8"
      >
        <motion.div style={{ x: shiftX, y: shiftY }} className="min-w-0 md:col-span-6">
          <motion.p variants={heroItem} className="micro max-w-full text-pretty tracking-[0.12em] text-ink/55 sm:tracking-[0.18em] dark:text-bone/55">
            Software engineering student
            <span className="mx-2 text-punch">/</span>
            SMU Computing &amp; Information Systems
          </motion.p>

          <h1 className="mt-5 min-w-0" aria-label={`${SITE.name}.`}>
            <span className="block whitespace-nowrap text-[clamp(1.9rem,8.8vw,5.4rem)] leading-[0.92] font-bold">
              <HeroName name={SITE.name} reducedMotion={Boolean(reducedMotion)} />
            </span>
            <motion.span
              variants={heroItem}
              className="mt-3 block font-mono text-[0.8rem] font-medium tracking-[0.16em] text-ink/55 uppercase dark:text-bone/55"
            >
              // {SITE.handle}
            </motion.span>
          </h1>

          <motion.p
            variants={heroItem}
            className="mt-6 min-h-[1.2em] font-display text-xl leading-snug font-bold break-words sm:text-2xl md:text-3xl"
          >
            <span className="sr-only">
              I&apos;m a software engineer, an SMU SCIS student, and an occasional dinosaur.
            </span>
            <span aria-hidden>
              <span className="text-ink/55 dark:text-bone/55">I&apos;m </span>
              <span>{typed}</span>
              <span className="hero-caret ml-0.5 inline-block text-punch">|</span>
            </span>
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
              href="/projects"
              onClick={(event) => {
                event.preventDefault()
                go('/projects')
              }}
            >
              View projects
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
        </motion.div>

        <motion.div
          variants={heroItem}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[280px] w-full min-w-0 sm:h-[360px] md:col-span-6 md:h-[520px]"
        >
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

          <span className="absolute bottom-2 left-2 -rotate-6 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.08em] text-paper uppercase dark:border-bone dark:bg-bone dark:text-void">
            @{SITE.handle}
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}

function HeroName({ name, reducedMotion }) {
  const chars = [...name]

  return (
    <>
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={`space-${i}`} className="inline-block w-[0.28em]" aria-hidden>
            {'\u00a0'}
          </span>
        ) : (
          <motion.span
            key={`${char}-${i}`}
            aria-hidden
            className="inline-block origin-bottom"
            initial={reducedMotion ? false : { y: '0.4em', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{
              y: -8,
              scale: 1.1,
              color: '#ff4d8d',
              transition: { type: 'spring', stiffness: 520, damping: 16 },
            }}
            transition={{
              delay: reducedMotion ? 0 : 0.18 + i * 0.038,
              type: 'spring',
              stiffness: 420,
              damping: 22,
            }}
          >
            {char}
          </motion.span>
        ),
      )}
      <motion.span
        aria-hidden
        className="inline-block origin-bottom text-punch"
        initial={reducedMotion ? false : { y: '0.4em', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{
          y: -8,
          scale: 1.1,
          transition: { type: 'spring', stiffness: 520, damping: 16 },
        }}
        transition={{
          delay: reducedMotion ? 0 : 0.18 + chars.length * 0.038,
          type: 'spring',
          stiffness: 420,
          damping: 22,
        }}
      >
        .
      </motion.span>
    </>
  )
}
