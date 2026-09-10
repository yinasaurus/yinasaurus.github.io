import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useGithubActivity } from '../hooks/useGithubActivity'
import { ContributionHeatmap } from './ContributionHeatmap'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

/**
 * Live GitHub year as a 2D heatmap. The 3D cube city was dropped here
 * because it often failed to paint (blank canvas / stuck suspense) while
 * the rest of the section loaded fine.
 */
export function GithubActivity() {
  const { isDark } = useTheme()
  const { data, status } = useGithubActivity()
  const days = data.days ?? []
  const hasGrid = days.length > 0

  return (
    <Section id="activity" className="pb-20 md:pb-28">
      <SectionHeader
        index="04"
        label="Activity"
        accent="text-jade"
        stacked
        title="Shipping in public"
        lead="A year of commits, pulled live from GitHub — the same grid as the contribution graph, not a screenshot."
      />

      <div className="relative mt-2 min-h-[7rem] w-full min-w-0">
        {hasGrid ? (
          <ContributionHeatmap days={days} isDark={isDark} />
        ) : (
          <p className="border-2 border-ink/15 px-4 py-8 text-sm text-ink/60 dark:border-bone/15 dark:text-bone/60">
            {status === 'rate-limited'
              ? 'GitHub rate-limited this request. Try again later.'
              : status === 'loading'
                ? `Excavating @${SITE.handle}…`
                : 'Couldn’t load the contribution grid. Showing nothing beats an infinite spinner.'}
          </p>
        )}
      </div>
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
          {status === 'fallback' && 'Stand-in grid — GitHub was unreachable.'}
          {status === 'rate-limited' && 'Rate limited — try again later.'}
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
