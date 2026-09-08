import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { PRESS } from '../lib/motion'
import { ThemeToggle } from './ThemeToggle'

const NAV_IDS = NAV_LINKS.map((link) => link.id)

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection(NAV_IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (event, id) => {
    event.preventDefault()
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      // A flat bar flush to the page edges: no floating pill, no rounded
      // corners, no drop shadow. It gains a hard rule once you start scrolling.
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b-2 border-ink bg-paper dark:border-bone/70 dark:bg-void'
          : 'border-b-2 border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="#hero" onClick={(event) => scrollTo(event, 'hero')} className="flex items-center gap-2.5">
          <FacetMark />
          <span className="font-display text-lg font-bold">
            {SITE.name.toUpperCase()}
            <span className="text-punch">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(event) => scrollTo(event, link.id)}
                className={`micro relative block py-1 transition-colors ${
                  active === link.id
                    ? 'text-ink dark:text-bone'
                    : 'text-ink/45 hover:text-ink dark:text-bone/45 dark:hover:text-bone'
                }`}
              >
                {link.label}
                {active === link.id && (
                  // Shared layout id slides the marker between links.
                  <motion.span
                    layoutId="nav-marker"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-punch"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            type="button"
            whileTap={{ x: 2, y: 2 }}
            transition={PRESS}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center border-2 border-ink md:hidden dark:border-bone"
          >
            <span className="flex flex-col gap-[3px]">
              <span className={`block h-0.5 w-4 bg-current ${menuOpen ? 'hidden' : ''}`} />
              <span className={`block h-0.5 w-4 bg-current ${menuOpen ? 'hidden' : ''}`} />
              <span className={`block h-0.5 w-4 bg-current ${menuOpen ? 'hidden' : ''}`} />
              {menuOpen && <span className="block text-sm leading-none">✕</span>}
            </span>
          </motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t-2 border-ink bg-paper md:hidden dark:border-bone/70 dark:bg-void"
          >
            <ul className="px-6 py-4">
              {NAV_LINKS.map((link, i) => (
                <li key={link.id} className={i > 0 ? 'rule' : ''}>
                  <a
                    href={`#${link.id}`}
                    onClick={(event) => scrollTo(event, link.id)}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className="micro text-volt">0{i + 1}</span>
                    <span className="font-display text-2xl font-bold">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Small faceted mark — the mascot's silhouette reduced to three planes. */
function FacetMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M12 2 22 9l-4 3z" fill="#ff4d8d" />
      <path d="M12 2 2 9l10 13z" fill="#6c3bf4" />
      <path d="M22 9 12 22l6-10z" fill="#17c79a" />
    </svg>
  )
}
