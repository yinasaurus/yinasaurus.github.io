import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

/**
 * Cursor position in -1 → 1 range, stored in a ref.
 *
 * The 3D scene reads this instead of R3F's built-in `state.pointer` because
 * that one only updates while the cursor is over the canvas — we want the
 * mascot to keep watching the cursor anywhere on the page.
 */
export function useGlobalPointerRef(enabled = true) {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) {
      pointer.current = { x: 0, y: 0 }
      return
    }

    const onPointerMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [enabled])

  return pointer
}

/**
 * Tracks the cursor as normalised (-0.5 → 0.5) motion values, spring-smoothed
 * so anything bound to them drifts instead of snapping. Used for the subtle
 * background-shape parallax.
 *
 * Returns motion values rather than state so moving the mouse never triggers a
 * React re-render.
 */
export function usePointerParallax({ enabled = true, stiffness = 60, damping = 20 } = {}) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness, damping })
  const y = useSpring(rawY, { stiffness, damping })

  useEffect(() => {
    if (!enabled) {
      rawX.set(0)
      rawY.set(0)
      return
    }

    const onPointerMove = (event) => {
      rawX.set(event.clientX / window.innerWidth - 0.5)
      rawY.set(event.clientY / window.innerHeight - 0.5)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [enabled, rawX, rawY])

  return { x, y }
}
