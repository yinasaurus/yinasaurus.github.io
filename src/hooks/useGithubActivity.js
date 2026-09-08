import { useEffect, useState } from 'react'
import { fetchGithubActivity, placeholderActivity } from '../lib/github'

/**
 * Loads GitHub activity once per mount (and once per tab, via sessionStorage).
 * The placeholder is shown immediately so the 3D grid never pops in empty.
 */
export function useGithubActivity() {
  const [data, setData] = useState(placeholderActivity)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    fetchGithubActivity()
      .then((next) => {
        if (cancelled) return
        setData(next)
        setStatus(next.source === 'placeholder' ? 'fallback' : 'ready')
      })
      .catch(() => {
        if (cancelled) return
        setData(placeholderActivity())
        setStatus('fallback')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, status }
}
