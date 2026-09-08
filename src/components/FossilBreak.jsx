import { PawPrint } from './DinoMarks'

/**
 * A cracked hairline with a few prints on it — the section break, instead of
 * a ruled border. Quiet enough to read as a divider, not as a sticker.
 */
export function FossilBreak() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <svg
        viewBox="0 0 720 12"
        className="h-3 flex-1 text-ink/25 dark:text-bone/25"
        preserveAspectRatio="none"
      >
        <path
          d="M0 6.5 38 5.2 72 7.4 118 4.8 164 7.1 210 5 258 7.8 304 4.6 352 6.9 398 5.1 446 7.6 492 4.9 538 6.8 584 5.4 632 7.2 678 5.6 720 6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex items-center gap-2 text-ink/30 dark:text-bone/30">
        <PawPrint className="h-3 w-3" />
        <PawPrint className="h-3 w-3 -translate-y-0.5 rotate-12" />
        <PawPrint className="h-3 w-3 translate-y-0.5 -rotate-6" />
      </span>
    </div>
  )
}
