import { useReducedMotion } from 'framer-motion'
import { createContext, useContext, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { triggerProjectsEnter, triggerProjectsExit } from '../lib/projectsWipe'

const WipeNavigateContext = createContext((to) => {
  window.location.assign(to)
})

export function useWipeNavigate() {
  return useContext(WipeNavigateContext)
}

/**
 * Mouth wipe around / ↔ /projects. Programmatic nav waits until the jaws
 * close, then changes the route. Back/forward still get the overlay.
 */
export function WipeNavigateProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const skip = useRef(false)
  const prev = useRef(location.pathname)

  const go = (to) => {
    const path = typeof to === 'string' ? to.split('#')[0] || '/' : to.pathname || '/'
    const current = location.pathname
    const crossing =
      (path === '/projects' && current !== '/projects') ||
      (path !== '/projects' && current === '/projects')

    if (!crossing || reducedMotion) {
      skip.current = true
      navigate(to)
      return
    }

    skip.current = true
    if (path === '/projects') triggerProjectsEnter()
    else triggerProjectsExit()
    window.setTimeout(() => navigate(to), 200)
  }

  useEffect(() => {
    const previous = prev.current
    prev.current = location.pathname
    if (skip.current) {
      skip.current = false
      return
    }
    if (previous === location.pathname) return
    if (location.pathname === '/projects' && previous !== '/projects') {
      triggerProjectsEnter()
    }
    if (previous === '/projects' && location.pathname !== '/projects') {
      triggerProjectsExit()
    }
  }, [location.pathname])

  return <WipeNavigateContext.Provider value={go}>{children}</WipeNavigateContext.Provider>
}
