import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

const HOT = 'a, button, [role="button"], .cursor-pointer, label, summary, input, textarea, select'

/**
 * Desktop-only paw cursor. CSS `url()` SVG cursors rasterize poorly on
 * Windows (tiny, boxed, hotspot drift), so this follows the pointer as a
 * real SVG — same print as the section marks, just big enough to read.
 */
export function SiteCursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const node = useRef(null)
  const hot = useRef(false)

  useEffect(() => {
    if (!fine) {
      document.documentElement.classList.remove('has-site-cursor')
      return
    }

    const el = node.current
    if (!el) return

    document.documentElement.classList.add('has-site-cursor')

    const move = (event) => {
      el.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      el.dataset.ready = 'true'
      const next = Boolean(event.target.closest?.(HOT))
      if (next !== hot.current) {
        hot.current = next
        el.dataset.hot = next ? 'true' : 'false'
      }
    }
    const down = () => {
      el.dataset.down = 'true'
    }
    const up = () => {
      el.dataset.down = 'false'
    }
    const hide = () => {
      el.dataset.ready = 'false'
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    document.documentElement.addEventListener('mouseleave', hide)

    return () => {
      document.documentElement.classList.remove('has-site-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      document.documentElement.removeEventListener('mouseleave', hide)
    }
  }, [fine])

  if (!fine) return null

  return (
    <div ref={node} aria-hidden className="site-cursor">
      <svg viewBox="0 0 16 16" width="22" height="22">
        <ellipse cx="8" cy="11.2" rx="3.4" ry="2.6" />
        <circle cx="3.4" cy="6.4" r="1.45" />
        <circle cx="6.6" cy="4.6" r="1.45" />
        <circle cx="9.6" cy="4.6" r="1.45" />
        <circle cx="12.6" cy="6.4" r="1.45" />
      </svg>
    </div>
  )
}
