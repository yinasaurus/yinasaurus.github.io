/** Same drawing as `public/favicon.svg` — keep these in lockstep. */
export function BrandMark({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden>
      <circle cx="16" cy="15" r="8.2" fill="#b5c9a5" />
      <circle cx="16" cy="15" r="8.2" fill="none" stroke="#171225" strokeWidth="1.4" />
      <polygon
        points="16,5.2 17.3,8.4 14.7,8.4"
        fill="#b5c9a5"
        stroke="#171225"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points="11.2,6.4 13.1,9.2 10.4,9.6"
        fill="#b5c9a5"
        stroke="#171225"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points="20.8,6.4 21.6,9.6 18.9,9.2"
        fill="#b5c9a5"
        stroke="#171225"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <ellipse cx="16" cy="19.4" rx="4.2" ry="3.1" fill="#e6d0a8" stroke="#171225" strokeWidth="0.8" />
      <polygon
        points="13.2,10.6 14.4,7.4 15.2,11.2"
        fill="#e6d0a8"
        stroke="#171225"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points="18.8,10.6 16.8,11.2 17.6,7.4"
        fill="#e6d0a8"
        stroke="#171225"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <circle cx="13.6" cy="15.2" r="1.15" fill="#1c1814" />
      <circle cx="18.4" cy="15.2" r="1.15" fill="#1c1814" />
    </svg>
  )
}
