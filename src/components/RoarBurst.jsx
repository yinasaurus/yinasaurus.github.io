import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const WORD = 'RAAAWR'
const COLORS = ['#ff4d8d', '#6c3bf4', '#17c79a', '#ffb020', '#ff4d8d', '#6c3bf4']

/**
 * Short-lived letter burst over the mascot. `token` changing remounts the
 * letters so a later click can play again.
 */
export function RoarBurst({ token }) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {token > 0 && (
        <motion.div
          key={token}
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="flex items-end font-display text-[clamp(2.4rem,8vw,4.4rem)] font-bold tracking-wide">
            <span className="sr-only">{WORD}</span>
            {[...WORD].map((letter, i) => (
              <motion.span
                key={`${token}-${i}`}
                aria-hidden
                className="inline-block origin-bottom"
                style={{ color: COLORS[i] }}
                initial={reduced ? { opacity: 0 } : { scale: 0.2, rotate: i % 2 ? 18 : -18, y: 16, opacity: 0 }}
                animate={
                  reduced
                    ? { opacity: [0, 1, 1, 0] }
                    : { scale: [0.2, 1.4, 1.05], rotate: [i % 2 ? 16 : -16, i % 2 ? -8 : 8, 0], y: [16, -10, 0], opacity: [0, 1, 1, 0] }
                }
                transition={{
                  duration: reduced ? 0.7 : 1.55,
                  delay: i * 0.045,
                  times: reduced ? [0, 0.2, 0.7, 1] : [0, 0.28, 0.48, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {letter}
              </motion.span>
            ))}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
