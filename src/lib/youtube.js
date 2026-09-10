/** YouTube id from a bare 11-char id or a youtube.com / youtu.be URL. */
export function youtubeVideoId(src) {
  if (!src) return null
  const trimmed = String(src).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
  )
  return match?.[1] ?? null
}

export function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function youtubeEmbed(id) {
  return `https://www.youtube.com/embed/${id}?rel=0`
}
