import { useEffect, useState } from 'react'
import { fetchGithubActivity, placeholderActivity } from '../lib/github'

/**
 * Loads GitHub activity once per mount (and once per tab, via sessionStorage).
 * The placeholder is shown immediately so the 3D grid never pops in empty.
 */
export function useGithubActivity() {
  const [data, setData] = useState(() => placeholderActivity())
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const failSafe = window.setTimeout(() => {
      if (cancelled) return
      setStatus((current) => (current === 'loading' ? 'fallback' : current))
    }, 10000)

    fetchGithubActivity()
      .then((next) => {
        if (cancelled) return
        setData(next)
        if (next.source === 'rate-limited') setStatus('rate-limited')
        else if (next.source === 'placeholder') setStatus('fallback')
        else setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setData(placeholderActivity())
        setStatus('fallback')
      })
    return () => {
      cancelled = true
      window.clearTimeout(failSafe)
    }
  }, [])

  return { data, status }
}
