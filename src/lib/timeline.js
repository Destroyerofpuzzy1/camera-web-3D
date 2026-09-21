/* =============================================================================
   TIMELINE
   -----------------------------------------------------------------------------
   Turns the declarative keyframe table in data/chapters.js into a function of
   scroll position. Sections are measured from the live DOM, so changing a
   section's `length` in the data file is all it takes to retune pacing.

   This module holds no React state on purpose. It is read every frame from
   inside useFrame, where a re-render would be a bug.
   ========================================================================== */

import { KEYFRAMES, KEYFRAME_DEFAULTS, SECTIONS } from '../data/chapters.js'
import { clamp, ease, invLerp, lerp } from './math.js'

/** id -> the section's <section> element, filled in by useSection(). */
const elements = new Map()

/** id -> { top, height, scrubEnd } in document pixels. Rebuilt on resize. */
let metrics = new Map()

/** Keyframes resolved to absolute scroll positions, sorted. */
let resolved = []

export function registerSection(id, el) {
  if (el) elements.set(id, el)
  else elements.delete(id)
}

/**
 * Re-measures every section and re-resolves keyframe anchors.
 * Call on load, on resize, and after fonts settle.
 */
export function measure() {
  const vh = window.innerHeight
  metrics = new Map()

  for (const { id } of SECTIONS) {
    const el = elements.get(id)
    if (!el) continue
    const top = el.offsetTop
    const height = el.offsetHeight
    // Scrub across the part of the section that can actually be scrolled
    // through while it is on screen. Falls back to the full height for
    // sections shorter than the viewport.
    const scrubEnd = Math.max(1, height - vh)
    metrics.set(id, { top, height, scrubEnd })
  }

  resolved = KEYFRAMES.map((kf) => {
    const [id, t] = kf.at
    const m = metrics.get(id)
    const y = m ? m.top + m.scrubEnd * t : 0
    return { ...KEYFRAME_DEFAULTS, ...kf, y, section: id }
  }).sort((a, b) => a.y - b.y)

  return resolved.length
}

/** Which section a scroll position falls in, and how far through it is. */
export function locate(scrollY) {
  let current = SECTIONS[0].id
  let local = 0
  for (const { id } of SECTIONS) {
    const m = metrics.get(id)
    if (!m) continue
    if (scrollY >= m.top - 1) {
      current = id
      local = clamp(invLerp(m.top, m.top + m.scrubEnd, scrollY))
    }
  }
  return { id: current, local }
}

/** Scroll position that puts a section's top at the top of the viewport. */
export function sectionTop(id) {
  return metrics.get(id)?.top ?? 0
}

/**
 * Samples the choreography.
 * Writes into `out` rather than allocating, because this runs every frame.
 */
export function sample(scrollY, out) {
  if (!resolved.length) return out

  // Binary search for the segment containing scrollY.
  let lo = 0
  let hi = resolved.length - 1
  if (scrollY <= resolved[0].y) {
    lo = hi = 0
  } else if (scrollY >= resolved[hi].y) {
    lo = hi
  } else {
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (resolved[mid].y <= scrollY) lo = mid
      else hi = mid
    }
  }

  const a = resolved[lo]
  const b = resolved[Math.min(lo + 1, resolved.length - 1)]

  const raw = a === b ? 0 : clamp(invLerp(a.y, b.y, scrollY))
  const t = ease(b.ease, raw)

  for (let i = 0; i < 3; i++) {
    out.pos[i] = lerp(a.pos[i], b.pos[i], t)
    out.target[i] = lerp(a.target[i], b.target[i], t)
  }
  out.frame[0] = lerp(a.frame[0], b.frame[0], t)
  out.frame[1] = lerp(a.frame[1], b.frame[1], t)
  out.fov = lerp(a.fov, b.fov, t)
  out.spin = lerp(a.spin, b.spin, t)
  out.explode = lerp(a.explode, b.explode, t)
  out.detach = lerp(a.detach, b.detach, t)
  out.tilt = lerp(a.tilt, b.tilt, t)
  out.emit = lerp(a.emit, b.emit, t)
  // Light and colour get their own gentle curve so neither ever flickers.
  const soft = ease('soft', raw)
  out.light = lerp(a.light, b.light, soft)

  // Colour is handed over as the two endpoints plus a blend factor rather than
  // a finished value. Interpolating it here, channel by channel, would drag
  // every transition through grey — blue to lime in RGB passes through mud.
  // Scene blends these in HSL instead, so a transition travels around the
  // wheel and stays saturated the whole way.
  out.blend = soft
  for (let i = 0; i < 3; i++) {
    out.rgbA[i] = a.rgb[i]
    out.rgbB[i] = b.rgb[i]
    out.rgb2A[i] = a.rgb2[i]
    out.rgb2B[i] = b.rgb2[i]
  }
  return out
}

/** A fresh, correctly shaped sample target. */
export const createSample = () => ({
  pos: [0, 0, 0],
  target: [0, 0, 0],
  frame: [0, 0],
  fov: 30,
  spin: 0,
  explode: 0,
  detach: 0,
  tilt: 0,
  light: 0,
  emit: 0,
  blend: 0,
  rgbA: [0, 0.937, 1],
  rgbB: [0, 0.937, 1],
  rgb2A: [0.478, 0.173, 1],
  rgb2B: [0.478, 0.173, 1],
})
