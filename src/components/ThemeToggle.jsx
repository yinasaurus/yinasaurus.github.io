import { motion } from 'framer-motion'
import { useTheme } from '../context/theme-context'
import { PRESS } from '../lib/motion'

/** Square, bordered, no pill and no sliding knob — it matches the panels. */
export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      whileHover={{ x: -1, y: -1 }}
      whileTap={{ x: 2, y: 2 }}
      transition={PRESS}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-ink focus-visible:ring-2 focus-visible:ring-volt focus-visible:outline-none dark:border-bone ${className}`}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </motion.button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4.5" />
      <path
        strokeLinecap="round"
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinejoin="round" d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" />
    </svg>
  )
}
