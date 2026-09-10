import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useWipeNavigate } from '../context/WipeNavigate'
import { NAV_LINKS, SITE } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { PRESS } from '../lib/motion'
import { ThemeToggle } from './ThemeToggle'

const SECTION_IDS = NAV_LINKS.filter((link) => link.hash).map((link) => link.id)

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const go = useWipeNavigate()
  const sectionActive = useActiveSection(SECTION_IDS)
  const active = location.pathname.startsWith('/projects') ? 'projects' : sectionActive

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onNav = (event, link) => {
    event.preventDefault()
    setMenuOpen(false)
    if (link.to === '/projects') {
      go('/projects')
      return
    }
    if (location.pathname !== '/') {
      go({ pathname: '/', hash: link.hash })
      return
    }
    document.getElementById(link.hash || 'hero')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const onHome = (event) => {
    event.preventDefault()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      go('/')
      return
    }
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b-2 border-ink bg-paper dark:border-bone/70 dark:bg-void'
          : 'border-b-2 border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="/" onClick={onHome} className="flex min-h-11 min-w-0 items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none">
          <FacetMark />
          <span className="truncate font-display text-base font-bold md:text-lg">
            {SITE.name}
            <span className="text-punch">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.to ?? `/#${link.hash}`}
                onClick={(event) => onNav(event, link)}
                className={`micro relative block py-2 transition-colors focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:outline-none ${
                  active === link.id
                    ? 'text-ink dark:text-bone'
                    : 'text-ink/60 hover:text-ink dark:text-bone/60 dark:hover:text-bone'
                }`}
              >
                {link.label}
                {active === link.id && (
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
          <a
            href={SITE.resume}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border-2 border-ink px-3 text-ink focus-visible:ring-2 focus-visible:ring-volt focus-visible:outline-none dark:border-bone dark:text-bone"
          >
            <DownloadIcon />
            <span className="micro hidden sm:inline">Resume</span>
          </a>
          <ThemeToggle />
          <motion.button
            type="button"
            whileTap={{ x: 2, y: 2 }}
            transition={PRESS}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center border-2 border-ink focus-visible:ring-2 focus-visible:ring-volt focus-visible:outline-none md:hidden dark:border-bone"
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
                    href={link.to ?? `/#${link.hash}`}
                    onClick={(event) => onNav(event, link)}
                    className="flex min-h-11 items-baseline gap-4 py-4"
                  >
                    <span className="micro text-volt">0{i + 1}</span>
                    <span className="font-display text-2xl font-bold">{link.label}</span>
                  </a>
                </li>
              ))}
              <li className="rule">
                <a
                  href={SITE.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-4 py-4"
                >
                  <DownloadIcon />
                  <span className="font-display text-2xl font-bold">Resume</span>
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0-3.5-3.5M12 15l3.5-3.5M5 19h14" />
    </svg>
  )
}

function FacetMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
      <path d="M12 2 22 9l-4 3z" fill="#ff4d8d" />
      <path d="M12 2 2 9l10 13z" fill="#6c3bf4" />
      <path d="M22 9 12 22l6-10z" fill="#17c79a" />
    </svg>
  )
}
