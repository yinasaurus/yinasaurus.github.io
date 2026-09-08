/**
 * Placeholder while the mascot chunk loads — an egg with a growing crack.
 * CSS only; no three.js on the loading path.
 */
export function EggLoader() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="status"
      aria-label="Hatching mascot"
    >
      <div className="egg-loader relative h-20 w-14">
        <div className="egg-shell absolute inset-0 rounded-[50%_50%_48%_48%] border-2 border-ink bg-[#ead7b0] dark:border-bone" />
        <div className="egg-split absolute inset-x-[18%] top-[38%] h-px origin-left bg-ink dark:bg-bone" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}
