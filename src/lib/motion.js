/**
 * Motion is deliberately concentrated in one place: the hero load.
 *
 * Sections below the fold render immediately with no scroll-triggered reveal —
 * repeating the same fade-and-slide on every block is what made the page feel
 * templated. Everything else that moves is a direct response to input (hover,
 * press, cursor position).
 */

export const PRESS = { type: 'spring', stiffness: 500, damping: 22 }

export const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
}

/** For text set in a `overflow-hidden` wrapper: the line rises into view. */
export const heroLine = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
}

export const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

/** One-shot draw-in when a below-the-fold block enters the viewport. */
export const scrollReveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}
