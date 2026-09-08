import { Link } from 'react-router-dom'
import { SITE } from '../data/site'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center px-6 py-28 sm:px-10">
      <div
        aria-hidden
        className="mb-6 h-14 w-11 rounded-[50%_50%_48%_48%] border-2 border-ink bg-[#ead7b0] dark:border-bone"
      />
      <p className="micro text-ink/45 dark:text-bone/45">Error 404</p>
      <h1 className="mt-4 text-4xl leading-[1.05] font-bold md:text-6xl">This page went extinct.</h1>
      <p className="mt-4 max-w-md text-ink/60 dark:text-bone/60">
        The fossil record for this URL is empty. Wander back to camp.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex w-fit items-center gap-2 border-2 border-ink bg-ink px-6 py-3 font-mono text-xs tracking-[0.14em] text-paper uppercase shadow-[4px_4px_0_0_var(--color-punch)] dark:border-jade dark:bg-jade dark:text-void"
      >
        Back to the clearing
      </Link>
      <p className="micro mt-10 text-ink/35 dark:text-bone/35">//{SITE.handle}</p>
    </section>
  )
}
