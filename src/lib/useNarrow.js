/* Matches the breakpoint the layout stacks at, so components can pick a
   different film-gate crop without duplicating the number in CSS and JS. */

import { useEffect, useState } from 'react'

export const NARROW_QUERY = '(max-width: 1000px)'

export function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(NARROW_QUERY).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const onChange = (e) => setNarrow(e.matches)
    setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return narrow
}
