import { SITE } from '../data/site'

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-10 sm:px-10">
      <div className="flex flex-col gap-3 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-bone/70">
        <span className="micro text-ink/45 dark:text-bone/45">
          © {new Date().getFullYear()} {SITE.name} — built with React &amp; three.js
        </span>
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer"
          className="micro transition-colors hover:text-punch"
        >
          @{SITE.handle} ↗
        </a>
      </div>
    </footer>
  )
}
