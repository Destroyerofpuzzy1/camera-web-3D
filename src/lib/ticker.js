/* =============================================================================
   One rAF loop for every DOM element that needs to follow the 3D scene or the
   scroll position. Components subscribe rather than each starting their own
   loop, so the number of frame callbacks stays constant as sections are added.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react'
import { scrollState } from './scroll.js'

const subscribers = new Set()
let raf = 0

function loop() {
  for (const fn of subscribers) fn()
  raf = requestAnimationFrame(loop)
}

export function subscribe(fn) {
  subscribers.add(fn)
  if (!raf) raf = requestAnimationFrame(loop)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

/** Runs `fn` every frame for the lifetime of the component. */
export function useTicker(fn, deps = []) {
  const held = useRef(fn)
  held.current = fn
  useEffect(() => subscribe(() => held.current()), deps) // eslint-disable-line
}

/**
 * Which beat of a section is showing. `stops` are the upper bounds of each
 * beat in section-local progress, e.g. [0.26, 0.47, 0.68, 0.86, 1].
 * Re-renders only when the index actually changes.
 */
export function useBeat(id, stops) {
  const [index, setIndex] = useState(0)
  const last = useRef(0)
  useTicker(() => {
    if (scrollState.section !== id) return
    const t = scrollState.local
    let next = stops.length - 1
    for (let i = 0; i < stops.length; i++) {
      if (t < stops[i]) {
        next = i
        break
      }
    }
    if (next !== last.current) {
      last.current = next
      setIndex(next)
    }
  }, [id, stops.join(',')]) // eslint-disable-line
  return index
}

/** True while the given section is the one being scrolled through. */
export function useInSection(id) {
  const [active, setActive] = useState(false)
  const last = useRef(false)
  useTicker(() => {
    const now = scrollState.section === id
    if (now !== last.current) {
      last.current = now
      setActive(now)
    }
  }, [id])
  return active
}
