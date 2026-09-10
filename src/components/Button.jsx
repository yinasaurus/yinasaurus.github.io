import { motion } from 'framer-motion'
import { PRESS } from '../lib/motion'

const VARIANTS = {
  // Primary call to action. The offset shadow is fixed in place, so nudging the
  // button on hover/press makes it lift off and then sit back down into it.
  // The shadow is pink rather than the usual ink, which would be invisible
  // against a solid ink button.
  solid:
    'border-2 border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--color-punch)] dark:border-jade dark:bg-jade dark:text-void',
  // Secondary deliberately has no shadow — that's the hierarchy.
  outline:
    'border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-paper dark:border-bone dark:text-bone dark:hover:bg-bone dark:hover:text-void',
}

export function Button({ variant = 'solid', className = '', href, children, ...props }) {
  const Component = href ? motion.a : motion.button

  return (
    <Component
      href={href}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 px-5 py-3 font-mono text-xs font-medium tracking-[0.14em] uppercase select-none sm:px-6 focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none ${VARIANTS[variant]} ${className}`}
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 3, y: 4, scaleX: 1.08, scaleY: 0.9 }}
      transition={PRESS}
      {...props}
    >
      {children}
    </Component>
  )
}
