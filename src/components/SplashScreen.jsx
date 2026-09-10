import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { EggLoader } from './EggLoader'

const KEY = 'yin-hatched'
const MIN_MS = 500
const MAX_MS = 1800

function shouldShowSplash(reduced) {
  if (reduced) return false
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(KEY) !== '1'
}

/**
 * First load in a tab: egg while fonts settle. Later loads in the same
 * session skip it so a refresh isn't a stall.
 */
export function SplashScreen() {
  const reduced = useReducedMotion()
  const [show, setShow] = useState(() => shouldShowSplash(reduced))

  useEffect(() => {
    if (!show) return

    let cancelled = false
    let closed = false
    const started = Date.now()

    const close = () => {
      if (cancelled || closed) return
      closed = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* private mode */
      }
      setShow(false)
    }

    const cap = window.setTimeout(close, MAX_MS)
    const afterMin = () => {
      window.setTimeout(close, Math.max(0, MIN_MS - (Date.now() - started)))
    }
    const fonts = document.fonts?.ready ?? Promise.resolve()
    fonts.then(afterMin).catch(afterMin)

    return () => {
      cancelled = true
      window.clearTimeout(cap)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-paper dark:bg-void"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <EggLoader fill={false} className="h-28 w-20" label="Hatching the site" />
          <p className="micro mt-7 text-ink/45 dark:text-bone/45">Hatching…</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
