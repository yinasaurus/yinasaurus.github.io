import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PROJECTS_ENTER, PROJECTS_EXIT } from '../lib/projectsWipe'

/**
 * Mouth wipe for the / ↔ /projects route change.
 * Pointer-events stay off. ~0.8s; reduced-motion is a short fade.
 */
export function MouthWipe() {
  const reducedMotion = useReducedMotion()
  const [shot, setShot] = useState(null)
  const lockUntil = useRef(0)

  useEffect(() => {
    const play = (next) => {
      const now = performance.now()
      if (now < lockUntil.current) return
      lockUntil.current = now + 900
      setShot(next)
    }

    const onEnter = () => play('enter')
    const onExit = () => play('exit')
    window.addEventListener(PROJECTS_ENTER, onEnter)
    window.addEventListener(PROJECTS_EXIT, onExit)
    return () => {
      window.removeEventListener(PROJECTS_ENTER, onEnter)
      window.removeEventListener(PROJECTS_EXIT, onExit)
    }
  }, [])

  useEffect(() => {
    if (!shot) return
    const ms = reducedMotion ? 160 : 820
    const id = window.setTimeout(() => setShot(null), ms)
    return () => window.clearTimeout(id)
  }, [shot, reducedMotion])

  if (!shot) return null

  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-ink/40 dark:bg-void/70"
        style={{ animation: 'mouth-fade 0.16s ease-out both' }}
      />
    )
  }

  const reverse = shot === 'exit'

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[60] overflow-hidden ${
        reverse ? 'mouth-wipe-exit' : 'mouth-wipe-enter'
      }`}
    >
      <div className="mouth-gums absolute inset-0 bg-[#1b1430]/80 dark:bg-[#0f0b18]/85" />
      <div className="mouth-jaw mouth-jaw-top absolute inset-x-0 top-0 h-1/2 origin-top border-b-[5px] border-ink bg-[#b7c89c] dark:border-bone">
        <Teeth flip />
      </div>
      <div className="mouth-jaw mouth-jaw-bottom absolute inset-x-0 bottom-0 h-1/2 origin-bottom border-t-[5px] border-ink bg-[#9eaf84] dark:border-bone">
        <Teeth />
      </div>
    </div>
  )
}

function Teeth({ flip = false }) {
  return (
    <div
      className={`absolute inset-x-[8%] flex justify-between ${flip ? 'bottom-0' : 'top-0'}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`h-7 w-5 bg-[#ead7b0] md:h-10 md:w-7 ${
            flip ? 'rounded-t-[4px]' : 'rounded-b-[4px]'
          }`}
          style={{ opacity: i === 0 || i === 8 ? 0.55 : 1 }}
        />
      ))}
    </div>
  )
}
