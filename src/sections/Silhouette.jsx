/* =============================================================================
   01 SILHOUETTE
   Five beats around the body. The instrument holds the left third while the
   right column swaps copy; a callout pins to the part currently under
   discussion, so the label and the geometry are never out of step.

   Beat boundaries here match the camera keyframes in data/chapters.js. Change
   one and change the other.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat, useInSection } from '../lib/ticker.js'
import Callout from '../ui/Callout.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.silhouette

/** Upper bound of each beat in section-local progress. */
const STOPS = [0.27, 0.47, 0.67, 0.87, 1]

/** Anchor id and label side for each beat, in the same order as the copy. */
const PINS = [
  { anchor: 'shell', side: 'right', leader: 70 },
  { anchor: 'dials', side: 'right', leader: 56 },
  { anchor: 'mount', side: 'right', leader: 82 },
  { anchor: 'display', side: 'right', leader: 64 },
  { anchor: 'grip', side: 'left', leader: 62 },
]

export default function Silhouette() {
  const beat = useBeat('silhouette', STOPS)
  const active = useInSection('silhouette')

  return (
    <Section id="silhouette" className="sil">
      <div className="sticky sil__stick">
        <Scrim side="right" reach={64} />
        <div className="shell grid12 sil__grid">
          <div className="sil__head">
            <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>
            <h2 className="display t-md" style={{ marginTop: '1.2rem' }}>
              {c.statement}
            </h2>
          </div>

          <div className="sil__col">
            {c.callouts.map((item, i) => (
              <article className="sil__beat" key={item.n} data-on={beat === i}>
                <span className="sil__n">{item.n}</span>
                <h3 className="sil__t">{item.t}</h3>
                <p className="sil__d">{item.p}</p>
                <div className="sil__spec">
                  <span className="label">{item.d}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="sil__progress" aria-hidden="true">
            {c.callouts.map((item, i) => (
              <span className="sil__pip" key={item.n} data-on={beat >= i}>
                <i />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned to the geometry, not to the layout. */}
      {PINS.map((pin, i) => (
        <Callout
          key={pin.anchor}
          anchor={pin.anchor}
          side={pin.side}
          leader={pin.leader}
          title={c.callouts[i].t}
          detail={c.callouts[i].d}
          show={active && beat === i}
        />
      ))}
    </Section>
  )
}
