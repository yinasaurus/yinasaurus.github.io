/** Three short scratches — a claw, not a bullet. */
export function ClawMark({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <path
        d="M3 12.5 6.2 3.5M8 13 11 3.2M13 12.2 14.6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** One small triceratops print, used in section breaks. */
export function PawPrint({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <ellipse cx="8" cy="11.2" rx="3.4" ry="2.6" fill="currentColor" />
      <circle cx="3.4" cy="6.4" r="1.45" fill="currentColor" />
      <circle cx="6.6" cy="4.6" r="1.45" fill="currentColor" />
      <circle cx="9.6" cy="4.6" r="1.45" fill="currentColor" />
      <circle cx="12.6" cy="6.4" r="1.45" fill="currentColor" />
    </svg>
  )
}
