import { useEffect, useState } from 'react'

/**
 * Cycles through `phrases`, typing and deleting one character at a time.
 * When `reducedMotion` is on it just shows the first phrase — no timer.
 */
export function useTypewriter(
  phrases,
  { typeMs = 55, deleteMs = 34, holdMs = 1700, reducedMotion = false } = {},
) {
  const [index, setIndex] = useState(0)
  const [count, setCount] = useState(reducedMotion ? phrases[0].length : 0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setCount(phrases[0].length)
      setIndex(0)
      setDeleting(false)
      return
    }

    const phrase = phrases[index]
    const doneTyping = count === phrase.length && !deleting
    const doneDeleting = count === 0 && deleting

    if (doneTyping && phrases.length === 1) return

    const delay = doneTyping ? holdMs : deleting ? deleteMs : typeMs

    const id = setTimeout(() => {
      if (doneTyping) {
        setDeleting(true)
        return
      }
      if (doneDeleting) {
        setDeleting(false)
        setIndex((current) => (current + 1) % phrases.length)
        return
      }
      setCount((current) => current + (deleting ? -1 : 1))
    }, delay)

    return () => clearTimeout(id)
  }, [count, deleting, index, phrases, typeMs, deleteMs, holdMs, reducedMotion])

  return phrases[index].slice(0, count)
}
