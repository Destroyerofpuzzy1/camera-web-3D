/* =============================================================================
   05 HANDLING
   Three mechanical beats: the display swinging on its real axle, the grip, and
   the top deck. The motion here is deliberately shorter and firmer than the
   rest of the page, because the subject is a mechanism rather than a form.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat, useInSection } from '../lib/ticker.js'
import Callout from '../ui/Callout.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.handling

const STOPS = [0.5, 0.78, 1]

/** Which part each beat pins a label to, and which side the label sits on. */
const PINS = [
  { anchor: 'display', title: 'Two-axis hinge', detail: '180 000 cycles', side: 'right' },
  { anchor: 'shutter', title: 'Shutter release', detail: 'Under the index finger', side: 'right' },
  { anchor: 'dials', title: 'Command dials', detail: '1.4 N·cm detent', side: 'left' },
]

export default function Handling() {
  const beat = useBeat('handling', STOPS)
  const active = useInSection('handling')

  return (
    <Section id="handling" className="hand">
      <div className="sticky hand__stick">
        <Scrim side={beat === 1 ? 'left' : 'right'} reach={62} />
        <Scrim side="bottom" reach={38} strength={0.9} />
        <div className="shell grid12 hand__grid" style={{ width: '100%' }}>
          <div className={`hand__col ${beat === 1 ? 'hand__beat--left' : 'hand__col--r'}`}>
            {c.blocks.map((b, i) => (
              <article className="hand__beat" key={b.t} data-on={beat === i}>
                {i === 0 ? (
                  <Eyebrow index={c.index} className="hand__eyebrow">
                    {c.eyebrow}
                  </Eyebrow>
                ) : (
                  <div className="eyebrow">
                    <span className="label num">
                      {c.index}.{i + 1}
                    </span>
                  </div>
                )}
                <h2 className="display t-md" style={{ margin: '1.1rem 0 1rem' }}>
                  {b.t}
                </h2>
                <p className="prose">{b.p}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="hand__figures">
          {c.beats.map(([v, k], i) => (
            <div className="hand__fig" key={k} data-reveal="" style={{ '--reveal-delay': `${i * 90}ms` }}>
              <b>{v}</b>
              <span className="label label-sm">{k}</span>
            </div>
          ))}
        </div>
      </div>

      {PINS.map((pin, i) => (
        <Callout
          key={pin.anchor}
          anchor={pin.anchor}
          side={pin.side}
          leader={58}
          title={pin.title}
          detail={pin.detail}
          show={active && beat === i}
        />
      ))}
    </Section>
  )
}
