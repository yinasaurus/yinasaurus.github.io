import { useCallback, useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query and re-renders when it flips. */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** Below this width we simplify the 3D scene and drop the parallax shapes. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

/** Desktop activity calendar — 3D cubes at 1024px and up. */
export const useIsWide = () => useMediaQuery('(min-width: 1024px)')

/** Coarse pointers (touch) get no hover-tilt and no cursor-follow. */
export const useIsTouch = () => useMediaQuery('(hover: none)')
