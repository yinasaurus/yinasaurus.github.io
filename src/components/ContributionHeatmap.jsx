import { fillGrid, LEVELS, LEVELS_DARK, levelIndex } from '../lib/contributionGrid'

const CELL = 9

/**
 * Flat GitHub-style year grid for phones. Cells stay readable; the year
 * scrolls sideways inside this box instead of shrinking to dust or
 * stretching the page.
 */
export function ContributionHeatmap({ days, isDark = false }) {
  const grid = fillGrid(days)
  const weeks = Math.max(1, ...grid.map((day) => day.week + 1))
  const max = Math.max(1, ...grid.map((day) => day.count))
  const palette = isDark ? LEVELS_DARK : LEVELS
  const byWeek = Array.from({ length: weeks }, (_, week) =>
    grid.filter((day) => day.week === week).sort((a, b) => a.dow - b.dow),
  )
  const boardH = CELL * 7 + 6
  const boardW = weeks * (CELL + 1) - 1

  return (
    <div className="w-full min-w-0">
      <p className="micro mb-2 text-ink/35 dark:text-bone/35">Swipe the year →</p>
      <div className="relative">
        <div
          data-heatmap-scroll
          className="overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] [touch-action:pan-x]"
        >
        <div className="flex items-start gap-1.5" style={{ width: boardW + 18 }}>
          <div
            className="flex w-3 shrink-0 flex-col justify-between py-px font-mono text-[0.55rem] leading-none text-ink/35 dark:text-bone/35"
            style={{ height: boardH }}
            aria-hidden
          >
            <span />
            <span>M</span>
            <span />
            <span>W</span>
            <span />
            <span>F</span>
            <span />
          </div>
          <div
            className="grid gap-px"
            style={{
              width: boardW,
              gridTemplateColumns: `repeat(${weeks}, ${CELL}px)`,
            }}
          >
            {byWeek.map((week, i) => (
              <div key={i} className="grid grid-rows-7 gap-px">
                {week.map((day) => (
                  <span
                    key={day.date}
                    title={`${day.count} on ${day.date}`}
                    className="block rounded-[1px]"
                    style={{
                      width: CELL,
                      height: CELL,
                      background: palette[levelIndex(day.count, max)],
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent dark:from-void"
        />
      </div>
    </div>
  )
}
