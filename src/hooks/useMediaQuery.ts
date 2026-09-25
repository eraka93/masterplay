import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = () => setMatches(mediaQueryList.matches)
    listener()
    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [query])

  return matches
}

export const DESKTOP_BREAKPOINT = '(min-width: 900px)'

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_BREAKPOINT)
}
