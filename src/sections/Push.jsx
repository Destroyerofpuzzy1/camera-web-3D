/* =============================================================================
   01 CLOSER
   SHOT 2: the camera push. One long dolly toward the front element, reusing
   the original optics push verbatim (see data/chapters.js). The colour bleeds
   from electric blue into hot magenta across the section, so the "world
   changing colour" read starts here, immediately after the hero.

   Copy sits in a single left column, out of the way of the model, which the
   choreography keeps framed to the right (`frame` is positive throughout this
   section) — the same proven technique the original page used everywhere.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useInSection } from '../lib/ticker.js'
import Callout from '../ui/Callout.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.push

export default function Push() {
  const active = useInSection('push')

  return (
    <Section id="push" className="push">
      <div className="sticky push__stick">
        <Scrim side="left" reach={58} />

        <div className="shell push__grid">
          <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>
          <h2 className="display push__word" data-reveal="">
            {c.word}
          </h2>
          <p className="lede push__lede" data-reveal="" style={{ '--reveal-delay': '120ms' }}>
            {c.lede}
          </p>
        </div>
      </div>

      {c.pins.map((pin) => (
        <Callout
          key={pin.anchor}
          anchor={pin.anchor}
          side="right"
          leader={54}
          title={pin.title}
          detail={pin.detail}
          show={active}
        />
      ))}
    </Section>
  )
}
