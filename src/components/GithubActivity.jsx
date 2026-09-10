import { Component, Suspense, lazy, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/theme-context'
import { SITE } from '../data/site'
import { useGithubActivity } from '../hooks/useGithubActivity'
import { useIsWide } from '../hooks/useMediaQuery'
import { ContributionHeatmap } from './ContributionHeatmap'
import { Section, SectionHeader } from './Section'
import { Tag } from './Tag'

const ContributionScene = lazy(() => import('./three/ContributionScene'))

export function GithubActivity() {
  const { isDark } = useTheme()
  const isWide = useIsWide()
  const reducedMotion = useReducedMotion()
  const { data, status } = useGithubActivity()
  const days = data.days ?? []
  const version = isWide ? '3d' : '2d'

  useEffect(() => {
    const width = typeof window === 'undefined' ? 0 : window.innerWidth
    console.info('[activity]', JSON.stringify({ width, isWide, version }))
  }, [isWide, version])

  return (
    <Section id="activity" className="pb-8 md:pb-10">
      <SectionHeader
        index="03"
        label="Activity"
        accent="text-jade"
        stacked
        title="Shipping in public"
        lead="A year of commits, pulled live from GitHub. Cubes on a wide screen; a swipeable grid on a phone."
      />

      <div className="relative mt-2 w-full min-w-0" data-activity-version={version}>
        <ActivityCalendar
          days={days}
          isDark={isDark}
          isWide={isWide}
          reducedMotion={Boolean(reducedMotion)}
        />
      </div>
      <div className="rule mt-5 flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
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

function ActivityCalendar({ days, isDark, isWide, reducedMotion }) {
  const [ready3d, setReady3d] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isWide) {
      setReady3d(false)
      setFailed(false)
    }
  }, [isWide])

  useEffect(() => {
    if (!isWide || ready3d || failed) return
    const id = window.setTimeout(() => setFailed(true), 1800)
    return () => window.clearTimeout(id)
  }, [failed, isWide, ready3d])

  if (!isWide || failed || !ready3d) {
    return (
      <>
        <ContributionHeatmap days={days} isDark={isDark} />
        {isWide && !failed && (
          <div className="pointer-events-none invisible absolute inset-0">
            <CalendarErrorBoundary fallback={null} onError={() => setFailed(true)}>
              <Suspense fallback={null}>
                <ContributionScene
                  days={days}
                  isDark={isDark}
                  reducedMotion={reducedMotion}
                  onReady={() => setReady3d(true)}
                />
              </Suspense>
            </CalendarErrorBoundary>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="h-[240px] w-full overflow-hidden">
      <CalendarErrorBoundary
        fallback={<ContributionHeatmap days={days} isDark={isDark} />}
        onError={() => setFailed(true)}
      >
        <Suspense fallback={<ContributionHeatmap days={days} isDark={isDark} />}>
          <ContributionScene
            days={days}
            isDark={isDark}
            reducedMotion={reducedMotion}
            onReady={() => setReady3d(true)}
          />
        </Suspense>
      </CalendarErrorBoundary>
    </div>
  )
}

class CalendarErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[activity] 3d calendar failed, using 2d', error)
    this.props.onError?.()
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
