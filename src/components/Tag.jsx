import { techAccent } from '../data/tech'

/** Square, bordered, monospaced. The only colour is the accent marker. */
export function Tag({ label }) {
  return (
    <span className="inline-flex items-center gap-2 border-2 border-ink/15 px-2.5 py-1.5 font-mono text-[0.65rem] font-medium tracking-[0.12em] uppercase dark:border-bone/15">
      <span className={`h-1.5 w-1.5 ${techAccent(label)}`} aria-hidden />
      {label}
    </span>
  )
}
