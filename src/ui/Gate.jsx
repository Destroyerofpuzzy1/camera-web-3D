/* =============================================================================
   FILM GATE
   -----------------------------------------------------------------------------
   Four mattes that crop the layer beneath into a hard-edged window, plus a
   hairline frame and corner ticks.

   The window can be filled two ways:
     - left empty, it crops the live 3D canvas behind the page
     - given `plates`, it holds editorial stills instead

   Either way the geometry, the crop and the frame are the same, so a section
   can swap its visual source without the layout knowing.

   Edges are given as distances from the top / left of the section, the way a
   crop is described on a contact sheet.

   The open/closed decision is read from the element's own position in the
   viewport rather than from shared scroll state. A closed gate is a full-screen
   matte, so a stale scroll reading would black out the page; this way the gate
   can only ever be wrong about itself.
   ========================================================================== */

import { useEffect, useRef } from 'react'
import { useTicker } from '../lib/ticker.js'
import { clamp } from '../lib/math.js'

const CLOSED = { t: '50%', b: '50%', l: '50%', r: '50%' }

/** How far the plate drifts across the window, in percent of its own height. */
const PARALLAX = 3.6

export default function Gate({
  /** Window edges as distances from the top / left, e.g. { t: '14%', r: '92%' }. */
  window: win,
  tone = 'ink',
  rule,
  /** Optional stills: [{ id, src, alt, position }]. All render; `active` shows. */
  plates,
  active,
}) {
  const ref = useRef(null)
  const stack = useRef(null)
  /** Last geometry written, so a window that moves between panels re-applies. */
  const applied = useRef('')

  // Start closed, so scrolling into the section reads as an aperture opening.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    for (const [k, v] of Object.entries(CLOSED)) el.style.setProperty(`--gate-${k}`, v)
  }, [])

  useTicker(() => {
    const el = ref.current
    if (!el) return

    // The gate lives inside a sticky container pinned to top: 0, so "pinned"
    // is simply its top edge having reached the top of the viewport.
    const rect = el.getBoundingClientRect()
    const vh = globalThis.innerHeight || 1
    const should = rect.top <= 2 && rect.bottom > vh * 0.4

    const box = should ? win : CLOSED
    const key = String(should) + JSON.stringify(box)
    if (key !== applied.current) {
      applied.current = key
      for (const [k, v] of Object.entries(box)) el.style.setProperty(`--gate-${k}`, v)
    }

    // Scroll-linked drift, so a still plate is not a dead sticker. Measured
    // against the host chapter rather than the pinned gate, which does not move.
    if (stack.current) {
      const host = el.closest('.chapter')
      if (host) {
        const hr = host.getBoundingClientRect()
        const travel = Math.max(1, hr.height - vh)
        const p = clamp(-hr.top / travel)
        stack.current.style.transform = `translate3d(0, ${((p - 0.5) * -PARALLAX).toFixed(2)}%, 0)`
      }
    }
  }, [JSON.stringify(win)])

  return (
    <div
      ref={ref}
      className="gate"
      data-tone={tone}
      style={{
        '--gate-tone': tone === 'paper' ? 'var(--paper)' : 'var(--ink)',
        '--gate-rule': rule ?? (tone === 'paper' ? 'var(--paper-rule)' : 'var(--rule)'),
      }}
      aria-hidden={plates ? undefined : 'true'}
    >
      {/* Plates sit inside the window, below the mattes that crop them. */}
      {plates ? (
        <div className="gate__plates">
          <div className="gate__stack" ref={stack}>
            {plates.map((plate) => (
              <img
                key={plate.id}
                className="gate__plate"
                src={plate.src}
                alt={plate.alt}
                loading="lazy"
                decoding="async"
                width="1168"
                height="880"
                data-on={plate.id === active}
                style={plate.position ? { objectPosition: plate.position } : undefined}
              />
            ))}
          </div>
        </div>
      ) : null}

      <span className="gate__bar gate__bar--t" />
      <span className="gate__bar gate__bar--b" />
      <span className="gate__bar gate__bar--l" />
      <span className="gate__bar gate__bar--r" />
      <span className="gate__frame">
        <span className="gate__tick gate__tick--tl" />
        <span className="gate__tick gate__tick--br" />
      </span>
    </div>
  )
}
