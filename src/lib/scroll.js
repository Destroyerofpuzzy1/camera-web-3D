/* =============================================================================
   Smooth scrolling and the per-frame scroll value.
   Lenis drives the page; `scrollState` is the mutable handoff to the 3D loop.
   ========================================================================== */

import { useEffect } from 'react'
import Lenis from 'lenis'
import { locate, measure, registerSection } from './timeline.js'
import { useStore } from './useStore.js'

/** Read by useFrame every frame. Never put this in React state. */
export const scrollState = {
  y: 0,
  /** 0..1 across the whole document, for the progress indicator. */
  progress: 0,
  /** 0..1 within the current section. */
  local: 0,
  section: 'hero',
  /** Signed scroll velocity, used for small motion accents. */
  velocity: 0,
}

let lenis = null

export const getLenis = () => lenis

/** Programmatic navigation that respects the smooth scroller. */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.7, ...options })
  } else if (typeof target === 'number') {
    window.scrollTo(0, target)
  } else {
    document.querySelector(target)?.scrollIntoView()
  }
}

/**
 * Installs Lenis, keeps `scrollState` fresh, and re-measures the timeline when
 * layout changes. Mounted once, by App.
 */
export function useSmoothScroll() {
  const setChapter = useStore((s) => s.setChapter)
  const motion = useStore((s) => s.motion)

  useEffect(() => {
    const reduced = motion === 'reduced'

    const instance = new Lenis({
      // A long, heavy glide. Short durations read as "webby"; this reads as mass.
      duration: reduced ? 0.1 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      // Native momentum on touch beats an emulated one.
      syncTouch: false,
    })
    lenis = instance

    const onScroll = ({ scroll, velocity, limit }) => {
      scrollState.y = scroll
      scrollState.velocity = velocity
      scrollState.progress = limit > 0 ? scroll / limit : 0
      const where = locate(scroll)
      scrollState.local = where.local
      if (where.id !== scrollState.section) {
        scrollState.section = where.id
        setChapter(where.id)
      }
    }
    instance.on('scroll', onScroll)

    let raf = 0
    const loop = (time) => {
      instance.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Measure now, again once the display face lands (it changes section
    // heights), and on every resize.
    const remeasure = () => {
      measure()
      instance.resize()
      onScroll({
        scroll: instance.scroll,
        velocity: 0,
        limit: instance.limit,
      })
    }
    remeasure()
    const settle = setTimeout(remeasure, 150)
    if (document.fonts) document.fonts.ready.then(remeasure)

    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
      instance.destroy()
      lenis = null
    }
  }, [motion, setChapter])
}

/** Seeds the motion preference from the OS and follows later changes. */
export function useMotionPreference() {
  const setMotion = useStore((s) => s.setMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setMotion(mq.matches ? 'reduced' : 'full')
    const onChange = (e) => setMotion(e.matches ? 'reduced' : 'full')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [setMotion])
}

/** Coarse device capability probe, run once at boot. */
export function useQualityProbe() {
  const setQuality = useStore((s) => s.setQuality)
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4
    const mem = navigator.deviceMemory ?? 4
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const narrow = window.innerWidth < 900
    setQuality(cores <= 4 || mem <= 4 || (coarse && narrow) ? 'low' : 'high')
  }, [setQuality])
}

/** Re-exported so sections import one module rather than two. */
export { registerSection }
