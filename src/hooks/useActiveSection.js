import { useEffect, useState } from 'react'

/** Returns the id of whichever section is currently closest to the top. */
export function useActiveSection(ids) {
  // Starts null so nothing is highlighted while the hero (not a nav target) is
  // on screen.
  const [active, setActive] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      // The band sits below the sticky navbar and above the fold's bottom half,
      // so a section counts as "active" once it fills the reading area.
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [ids])

  return active
}
