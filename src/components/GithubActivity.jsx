import { useReducedMotion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useGithubActivity } from '../hooks/useGithubActivity'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

// Same lazy split as the hero mascot — three.js stays out of the first paint.
const ContributionScene = lazy(() => import('./three/ContributionScene'))

/**
 * Live GitHub activity, rendered as a toy city of cubes rather than an
 * embedded widget.
 *
 * Upgrade path: `src/lib/github.js` already speaks GraphQL when
 * `VITE_GITHUB_TOKEN` is set. If you'd rather skip 3D entirely, replace the
 * canvas below with:
 *   <img alt="GitHub contributions" src="https://ghchart.rshah.org/17c79a/yinasaurus" />
 *   or a github-readme-stats card.
 */
export function GithubActivity() {
  const { isDark } = useTheme()
  const reducedMotion = useReducedMotion()
  const { data, status } = useGithubActivity()

  return (
    <Section id="activity" className="pb-20 md:pb-28">
      <SectionHeader
        index="04"
        label="Activity"
        accent="text-jade"
        stacked
        title="Shipping in public"
        lead="A year of commits, pulled live from GitHub and stacked as cubes — not a screenshot of the contribution graph."
      />

      <div className="relative mt-2 h-[380px] w-full overflow-hidden md:h-[500px]">
        <Suspense fallback={<CalendarSkeleton />}>
          <ContributionScene
            days={data.days}
            isDark={isDark}
            reducedMotion={Boolean(reducedMotion)}
          />
        </Suspense>
      </div>
      <p className="micro mt-4 text-ink/40 dark:text-bone/40">
        {status === 'loading' && `Excavating @${SITE.handle}…`}
        {status === 'ready' && (
          <>
                {data.total.toLocaleString()} contributions in {data.year}
            {data.source === 'public' && ' · public feed'}
            {data.source === 'graphql' && ' · live from GitHub'}
          </>
        )}
        {status === 'fallback' && 'Showing a stand-in grid — GitHub rate-limited or unreachable.'}
      </p>

      <dl className="mt-10 grid gap-0 md:grid-cols-3">
        <Stat label="Public repos" value={data.repos} />
        <Stat label="Followers" value={data.followers} />
        <Stat label="Contributions" value={data.total} />
      </dl>
      <div className="rule py-6">
        <p className="micro text-ink/40 dark:text-bone/40">Top languages</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.languages.length === 0 ? (
            <span className="text-sm text-ink/50 dark:text-bone/50">No languages yet</span>
          ) : (
            data.languages.map((lang) => <Tag key={lang.name} label={lang.name} />)
          )}
        </div>
      </div>
      <div className="rule" />
    </Section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rule py-5 md:px-1">
      <dt className="micro text-ink/40 dark:text-bone/40">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-bold tabular-nums md:text-4xl">{value}</dd>
    </div>
  )
}

function CalendarSkeleton() {
  return <div className="h-full w-full border-2 border-ink/10 dark:border-bone/10" />
}

