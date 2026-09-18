/* =============================================================================
   Section shell.
   Registers the element with the timeline so keyframes anchored to this id can
   resolve, and takes its scroll length from data/chapters.js so pacing lives in
   one file.
   ========================================================================== */

import { SECTIONS } from '../data/chapters.js'
import { useSection } from '../lib/useReveal.js'

export default function Section({ id, className = '', paper = false, children }) {
  const ref = useSection(id)
  const length = SECTIONS.find((s) => s.id === id)?.length ?? 100

  return (
    <section
      ref={ref}
      id={id}
      className={`chapter ${paper ? 'on-paper ' : ''}${className}`}
      style={{ minHeight: `${length}svh` }}
    >
      {children}
    </section>
  )
}

/** Label + hairline. Used at the head of every chapter. */
export function Eyebrow({ index, children, className = '' }) {
  return (
    <div className={`eyebrow ${className}`}>
      {index ? <span className="label num">{index}</span> : null}
      <span className="label">{children}</span>
    </div>
  )
}
