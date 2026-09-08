/**
 * Section scaffolding.
 *
 * Sections are separated by a rule and announced by a numbered mono label
 * rather than being wrapped in a panel — boxes are reserved for project cards,
 * which are the only card-shaped thing on the page.
 *
 * Nothing here animates on scroll. See `src/lib/motion.js`.
 */
export function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 sm:px-10 ${className}`}>
      {children}
    </section>
  )
}

export function SectionHeader({
  index,
  label,
  title,
  lead,
  accent = 'text-volt',
  stacked = false,
}) {
  return (
    <header className="rule pt-10 pb-12 md:pt-14 md:pb-16">
      <div className="flex items-center gap-4">
        <span className={`micro ${accent}`}>{index}</span>
        <span className="micro text-ink/45 dark:text-bone/45">{label}</span>
        {/* Rule that runs out to the right margin, tying the label to the page
            edge instead of floating it in the middle of a card. */}
        <span className="h-px flex-1 bg-ink/15 dark:bg-bone/15" />
      </div>

      {stacked ? (
        <div className="mt-8">
          {lead && (
            <p className="max-w-xl text-base leading-relaxed text-ink/60 dark:text-bone/60">
              {lead}
            </p>
          )}
          <h2 className="mt-10 text-4xl leading-[1.05] font-bold md:mt-14 md:text-6xl">
            {title}
          </h2>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-start">
          <h2 className="min-w-0 text-4xl leading-[1.05] font-bold md:col-span-7 md:text-6xl">
            {title}
          </h2>
          {lead && (
            <p className="min-w-0 text-base leading-relaxed text-ink/60 md:col-span-5 dark:text-bone/60">
              {lead}
            </p>
          )}
        </div>
      )}
    </header>
  )
}
