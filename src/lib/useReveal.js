/* =============================================================================
   Entrance reveals and section registration.
   One IntersectionObserver serves the whole page. Elements opt in with
   `data-reveal=""`; base.css owns the transition, so timing is tuned in one
   place along with the rest of the motion system.
   ========================================================================== */

import { useEffect, useLayoutEffect, useRef } from 'react'
import { registerSection } from './timeline.js'

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.reveal = 'in'
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    )

    const sync = () => {
      document.querySelectorAll('[data-reveal=""]').forEach((el) => io.observe(el))
    }
    sync()

    const mo = new MutationObserver(sync)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

/**
 * Gives a <section> its id and registers it with the timeline so keyframes
 * anchored to that id can resolve to real scroll positions.
 */
export function useSection(id) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    registerSection(id, ref.current)
    return () => registerSection(id, null)
  }, [id])
  return ref
}
