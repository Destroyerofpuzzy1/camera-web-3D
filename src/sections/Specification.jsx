/* =============================================================================
   07 SPECIFICATION
   Paper. Grouped the way a photographer reads a spec sheet: a serif reference
   letter, the group name, then the rows. No table chrome, no zebra stripes, no
   badges.

   Unlike the other chapters this one scrolls its content rather than pinning
   it, so the paper matte is a sticky layer underneath with a tall window cut on
   the right. The instrument turns slowly in that window while you read.
   ========================================================================== */

import { COPY, SPECS } from '../data/product.js'
import Gate from '../ui/Gate.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.specs

/** Tall portrait window on the right, in the proportions of a 4:5 plate. */
const WINDOW = { t: '14%', b: '86%', l: '63%', r: '95%' }

export default function Specification() {
  return (
    <Section id="specs" className="spec" paper>
      {/* Paper matte and window, pinned for the length of the section. */}
      <div className="spec__bg" aria-hidden="true">
        <div className="spec__bgsticky">
          <Gate tone="paper" window={WINDOW} />
        </div>
      </div>

      <div className="spec__inner">
        <div className="shell grid12 spec__head">
          <div className="spec__title">
            <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>
            <h2 className="display t-lg" style={{ marginTop: '1.2rem' }} data-reveal="">
              {c.statement}
            </h2>
          </div>
          <p className="prose spec__note" data-reveal="" style={{ '--reveal-delay': '120ms' }}>
            {c.note}
          </p>
        </div>

        {SPECS.map((group, i) => (
          <div
            className="shell grid12 spec__group"
            key={group.group}
            data-reveal=""
            style={{ '--reveal-delay': `${i * 60}ms` }}
          >
            <div className="spec__ref">
              <span className="spec__glyph">{group.ref}</span>
              <span className="label">{group.group}</span>
            </div>
            <dl className="spec__rows">
              {group.rows.map(([k, v]) => (
                <div className="spec__row" key={k}>
                  <dt className="spec__k">{k}</dt>
                  <dd className="spec__v">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  )
}
