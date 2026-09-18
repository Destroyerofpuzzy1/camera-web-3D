/* =============================================================================
   04 ARCHITECTURE
   A real exploded view. The GLB carries thirty-four separable rigs, so the
   whole instrument fans along its own optical axis exactly the way the
   reference photograph does, and every label tracks the part it names.

   The legend lights up in step with the fan, front group first.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat, useInSection } from '../lib/ticker.js'
import Callout from '../ui/Callout.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.exploded

/** The legend fills in across the middle of the section, as the fan opens. */
const STOPS = [0.22, 0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 1]

/** Which four parts get a pinned label. Labelling all nine would be noise. */
const PINNED = ['LENS_ROOT', 'SENSOR_RIG', 'DISPLAY_RIG', 'VIEWFINDER_RIG']

export default function Architecture() {
  const beat = useBeat('exploded', STOPS)
  const active = useInSection('exploded')

  return (
    <Section id="exploded" className="exp">
      <div className="sticky exp__stick">
        <Scrim side="bottom" reach={34} strength={0.9} />
        <Scrim side="top" reach={30} strength={0.82} />
        <div className="exp__head">
          <Eyebrow index={c.index} className="exp__eyebrow">
            {c.eyebrow}
          </Eyebrow>
          <h2 className="display t-md" style={{ margin: '1.1rem 0 1rem' }}>
            {c.statement}
          </h2>
          <p className="prose">{c.prose[0]}</p>
        </div>

        <div className="exp__legend" aria-hidden="true">
          {c.layers.map((layer, i) => (
            <div className="exp__item" key={layer.rig} data-on={beat >= i}>
              <span className="exp__no">{layer.n}</span>
              <span className="exp__t">{layer.t}</span>
              <span className="exp__d">{layer.d}</span>
            </div>
          ))}
        </div>

        <div className="exp__count">
          <span className="label">{c.prose[1]}</span>
        </div>
      </div>

      {/* Pinned to the geometry: these follow their part all the way out. */}
      {c.layers
        .filter((layer) => PINNED.includes(layer.rig))
        .map((layer, i) => (
          <Callout
            key={layer.rig}
            anchor={'x:' + layer.rig}
            side={i % 2 === 0 ? 'right' : 'left'}
            leader={48}
            title={`${layer.n} / ${layer.t}`}
            detail={layer.d}
            show={active && beat >= 3}
          />
        ))}
    </Section>
  )
}
