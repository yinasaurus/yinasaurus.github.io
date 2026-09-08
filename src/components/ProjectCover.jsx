import { useId, useState } from 'react'
import { ACCENTS, LANGUAGE_COLORS } from '../data/projects'

/**
 * Screenshot if `/projects/{repo}.png` exists; otherwise a faceted, hashed
 * cover in the project's language colour — never a broken-image icon.
 */
export function ProjectCover({ project, className = '' }) {
  const [status, setStatus] = useState('pending')
  const accent = ACCENTS[project.accent] ?? ACCENTS.jade
  const color = LANGUAGE_COLORS[project.language] ?? accent.hex
  const showPhoto = status === 'ready'

  return (
    <div className={`project-cover relative overflow-hidden ${className}`}>
      <AbstractCover name={project.name} color={color} paper="#f5f2ec" />
      {status !== 'missing' && (
        <img
          src={project.image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            showPhoto ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('missing')}
        />
      )}
    </div>
  )
}

function AbstractCover({ name, color, paper }) {
  const uid = useId().replace(/:/g, '')
  const id = `hatch-${uid}`
  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const shift = (seed % 18) - 9

  return (
    <svg
      viewBox="0 0 400 250"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id={id}
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${22 + shift})`}
        >
          <path d="M0 22 L22 0" stroke={color} strokeWidth="1.4" opacity="0.45" />
          <circle cx="0" cy="0" r="1.1" fill={color} opacity="0.35" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={paper} />
      <rect width="400" height="250" fill={color} opacity="0.18" />
      <rect width="400" height="250" fill={`url(#${id})`} />
      <polygon
        points={`${40 + shift},250 180,40 ${320 + shift},250`}
        fill={color}
        opacity="0.22"
      />
      <polygon points="400,0 400,140 240,0" fill={color} opacity="0.16" />
      <g fill={color} opacity="0.55" transform="translate(18 188) scale(2.1)">
        <ellipse cx="8" cy="11.2" rx="3.4" ry="2.6" />
        <circle cx="3.4" cy="6.4" r="1.45" />
        <circle cx="6.6" cy="4.6" r="1.45" />
        <circle cx="9.6" cy="4.6" r="1.45" />
        <circle cx="12.6" cy="6.4" r="1.45" />
      </g>
    </svg>
  )
}
