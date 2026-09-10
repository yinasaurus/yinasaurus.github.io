import { useReducedMotion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useGithubActivity } from '../hooks/useGithubActivity'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ContributionHeatmap } from './ContributionHeatmap'
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
  const isNarrow = useMediaQuery('(max-width: 1023px)')
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
        lead="A year of commits, pulled live from GitHub. Cubes on a wide screen; a swipeable grid on a phone."
      />

      {isNarrow ? (
        <div className="relative mt-2 w-full min-w-0">
          <ContributionHeatmap days={data.days} isDark={isDark} />
        </div>
      ) : (
        <div className="relative mt-2 h-[500px] w-full overflow-hidden">
          <Suspense fallback={<CalendarSkeleton />}>
            <ContributionScene
              days={data.days}
              isDark={isDark}
              reducedMotion={Boolean(reducedMotion)}
            />
          </Suspense>
        </div>
      )}
      <div className="rule mt-8 flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="micro text-ink/55 dark:text-bone/55">
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
        {data.languages.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <li key={lang.name}>
                <Tag label={lang.name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

function CalendarSkeleton() {
  return <div className="h-full w-full border-2 border-ink/10 dark:border-bone/10" />
}

