import { useId, useState } from 'react'
import { ACCENTS, LANGUAGE_COLORS } from '../data/projects'
import { youtubeThumb, youtubeVideoId } from '../lib/youtube'

export function projectMedia(project) {
  if (project?.media?.type) return project.media
  return { type: 'none', src: '' }
}

/**
 * Card/modal media. YouTube thumbs on the card, an embed in the modal,
 * screenshots when configured, otherwise the dino-hatch placeholder.
 */
export function ProjectCover({ project, index = 0, className = '', mode = 'card' }) {
  const media = projectMedia(project)
  const accent = ACCENTS[project.accent] ?? ACCENTS.jade
  const color = LANGUAGE_COLORS[project.language] ?? accent.hex
  const videoId = media.type === 'youtube' ? youtubeVideoId(media.src) : null

  if (mode === 'modal' && videoId) {
    return (
      <div className={`relative overflow-hidden bg-ink ${className}`}>
        <iframe
          title={`${project.title} video`}
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={`project-cover relative overflow-hidden ${className}`}>
      <AbstractCover name={project.name} color={color} paper="#f5f2ec" index={index} />
      {media.type === 'image' && media.src && (
        <CoverImage src={media.src} />
      )}
      {videoId && <YoutubeThumb id={videoId} showPlay={mode === 'card'} />}
    </div>
  )
}

function CoverImage({ src }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setOk(false)}
    />
  )
}

function YoutubeThumb({ id, showPlay }) {
  const [ok, setOk] = useState(true)
  if (!ok) {
    return showPlay ? <PlayBadge /> : null
  }
  return (
    <>
      <img
        src={youtubeThumb(id)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setOk(false)}
      />
      {showPlay && <PlayBadge />}
    </>
  )
}

function PlayBadge() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center bg-ink/25"
    >
      <span className="flex h-14 w-14 items-center justify-center border-2 border-paper bg-ink text-paper shadow-hard-sm">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
    </span>
  )
}

function AbstractCover({ name, color, paper, index = 0 }) {
  const uid = useId().replace(/:/g, '')
  const scaleId = `scale-${uid}`
  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const rot = ((seed * 13) % 36) - 18
  const tints = ['#6c3bf4', '#ff4d8d', '#17c79a', '#ffb020']
  const tint = tints[index % tints.length]

  return (
    <svg
      viewBox="0 0 400 250"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id={scaleId}
          width="32"
          height="28"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${rot})`}
        >
          <polygon
            points="16,1.5 29,8.5 29,19.5 16,26.5 3,19.5 3,8.5"
            fill={paper}
            fillOpacity="0.16"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.9"
          />
          <polygon
            points="0,-12.5 13,-5.5 13,5.5 0,12.5 -13,5.5 -13,-5.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
          <polygon
            points="32,-12.5 45,-5.5 45,5.5 32,12.5 19,5.5 19,-5.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={color} />
      <rect width="400" height="250" fill={paper} opacity="0.32" />
      <rect width="400" height="250" fill={tint} opacity="0.14" />
      <rect width="400" height="250" fill={`url(#${scaleId})`} />
      <g fill={color} opacity="0.45" transform="translate(18 188) scale(2.1)">
        <ellipse cx="8" cy="11.2" rx="3.4" ry="2.6" />
        <circle cx="3.4" cy="6.4" r="1.45" />
        <circle cx="6.6" cy="4.6" r="1.45" />
        <circle cx="9.6" cy="4.6" r="1.45" />
        <circle cx="12.6" cy="6.4" r="1.45" />
      </g>
    </svg>
  )
}
