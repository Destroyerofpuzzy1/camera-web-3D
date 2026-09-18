/* =============================================================================
   CALLOUT
   -----------------------------------------------------------------------------
   A label pinned to a point on the 3D instrument. Reads the projected anchor
   position from the shared ticker and moves itself with a transform, so the
   label tracks the part through spin, explode, lens detach and display tilt
   without the section knowing anything about the scene graph.
   ========================================================================== */

import { useRef } from 'react'
import { readAnchor } from '../three/anchors.js'
import { useTicker } from '../lib/ticker.js'

export default function Callout({
  anchor,
  title,
  detail,
  side = 'right',
  leader = 56,
  show = true,
  paper = false,
}) {
  const ref = useRef(null)
  const visible = useRef(false)

  useTicker(() => {
    const el = ref.current
    if (!el) return
    const a = readAnchor(anchor)
    // Round to whole pixels: sub-pixel label movement reads as a shimmer.
    el.style.transform = `translate3d(${Math.round(a.x)}px, ${Math.round(a.y)}px, 0)`
    const on = show && a.on
    if (on !== visible.current) {
      visible.current = on
      el.dataset.on = String(on)
    }
  }, [anchor, show])

  return (
    <div
      ref={ref}
      className={`callout callout--${side}${paper ? ' on-paper-callout' : ''}`}
      style={{ '--leader': `${leader}px` }}
      aria-hidden="true"
    >
      <span className="callout__dot" />
      <span className="callout__leader" />
      <span className="callout__body">
        <span className="callout__t">{title}</span>
        {detail ? <span className="callout__d">{detail}</span> : null}
      </span>
    </div>
  )
}
