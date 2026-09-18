/* =============================================================================
   03 SENSOR
   The page inverts to paper and the window holds a straight-on still of the
   open mount, which shows the sensor more clearly than any angle the live
   camera can reach through the bayonet throat.

   The 3D still runs behind the matte and still detaches the lens, so the
   transitions either side of this chapter stay continuous.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useNarrow } from '../lib/useNarrow.js'
import Gate from '../ui/Gate.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.sensor

/** Window on the right half, in the proportions of a 3:2 frame. */
const WINDOW = { t: '13%', b: '87%', l: '48%', r: '94%' }
/** Stacked: crop above, copy below. */
const WINDOW_NARROW = { t: '14%', b: '42%', l: '4%', r: '96%' }

export default function Sensor() {
  const narrow = useNarrow()

  return (
    <Section id="sensor" className="sensor" paper>
      <div className="sticky sensor__stick">
        <Gate
          tone="paper"
          window={narrow ? WINDOW_NARROW : WINDOW}
          plates={[{ id: 'sensor', ...c.plate }]}
          active="sensor"
        />

        <div className="shell grid12 sensor__grid" style={{ position: 'relative', zIndex: 3 }}>
          <div className="sensor__col">
            <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>

            <h2 className="display t-lg" data-reveal="">
              {c.statement}
            </h2>

            <div data-reveal="" style={{ '--reveal-delay': '120ms' }}>
              {c.prose.map((p) => (
                <p className="prose" key={p.slice(0, 24)}>
                  {p}
                </p>
              ))}
            </div>

            <div className="sensor__figs" data-reveal="" style={{ '--reveal-delay': '240ms' }}>
              {c.figures.map(([n, unit, cap]) => (
                <div className="sensor__fig" key={cap}>
                  <div className="sensor__n">
                    {n}
                    <sub>{unit}</sub>
                  </div>
                  <div className="sensor__cap label label-sm">{cap}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </Section>
  )
}
