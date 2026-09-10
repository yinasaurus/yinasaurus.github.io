import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { useIsMobile, useIsTouch } from '../hooks/useMediaQuery'
import { usePointerParallax } from '../hooks/usePointerParallax'

/**
 * Page backdrop: a faint measuring grid plus a few outlined geometric shapes
 * that drift with the cursor.
 *
 * These are outlines rather than blurred colour blobs on purpose — the shapes
 * echo the faceted mascot, and nothing on the page uses a soft blur.
 */
const SHAPES = [
  { className: 'left-[-4%] top-[10%] h-56 w-56 border-2', depth: 34, tilt: 12, drift: 22 },
  { className: 'right-[4%] top-[26%] h-40 w-40 border-2', depth: 22, tilt: -6, drift: 28 },
  { className: 'left-[16%] top-[62%] h-64 w-64 border-2', depth: 30, tilt: 24, drift: 34 },
  { className: 'right-[12%] top-[78%] h-48 w-48 border-2', depth: 18, tilt: -12, drift: 26 },
]

export function Backdrop() {
  const isMobile = useIsMobile()
  const isTouch = useIsTouch()
  const { x, y } = usePointerParallax({ enabled: !isTouch })

  // On phones the parallax has no cursor to follow, so only the grid remains.
  const shapes = isMobile ? [] : SHAPES

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '76px 76px',
          color: 'color-mix(in srgb, currentColor 7%, transparent)',
        }}
      />

      {shapes.map((shape) => (
        <ParallaxShape key={shape.className} x={x} y={y} {...shape} />
      ))}

      {/* A single solid accent block, as a full-stop for the composition.
          Hidden on narrow screens, where it lands on top of the body copy. */}
      <div className="absolute top-[46%] right-[-3%] hidden h-24 w-24 rotate-45 bg-volt/10 md:block dark:bg-jade/10" />
    </div>
  )
}

function ParallaxShape({ x, y, depth, className, tilt, drift }) {
  const reduced = useReducedMotion()
  const translateX = useTransform(x, (value) => value * depth)
  const translateY = useTransform(y, (value) => value * depth)

  return (
    <motion.div
      style={{ x: translateX, y: translateY }}
      className={`absolute border-ink/[0.07] dark:border-bone/[0.07] ${className}`}
      initial={{ rotate: tilt }}
      animate={reduced ? { rotate: tilt } : { rotate: [tilt, tilt + 9, tilt - 7, tilt] }}
      transition={reduced ? undefined : { duration: drift, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
