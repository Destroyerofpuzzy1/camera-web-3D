/* =============================================================================
   02 TEARDOWN — the centrepiece
   -----------------------------------------------------------------------------
   600vh, a little over half the page. The choreography in data/chapters.js
   owns the camera, the staged explode and the colour; this component owns only
   the labels, which change in step with it.

   Nine beats, each one a group of parts coming out of the body: housing,
   optics, barrel, mount, sensor, chassis, rear cluster, then the full fan.
   One large word and one small line per beat — the model is the content here,
   the type is a caption on it.

   Every name below is a real node in the GLB. Nothing is labelled that is not
   actually in the model.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat } from '../lib/ticker.js'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.teardown

/**
 * Upper bound of each beat in section-local progress. These line up with the
 * keyframe phases in data/chapters.js — change one and change the other.
 */
const STOPS = [0.06, 0.15, 0.26, 0.37, 0.48, 0.59, 0.7, 0.81, 1]

export default function Teardown() {
  const beat = useBeat('teardown', STOPS)

  return (
    <Section id="teardown" className="tear">
      <div className="sticky tear__stick">
        <div className="shell tear__head">
          <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>
        </div>

        <div className="shell tear__labels">
          {c.stages.map((stage, i) => (
            <div className="tear__stage" key={stage.n} data-on={beat === i}>
              <span className="tear__n">{stage.n}</span>
              <h2 className="display tear__word">{stage.t}</h2>
              <span className="tear__d">{stage.d}</span>
            </div>
          ))}
        </div>

        {/* Progress through the teardown, one tick per group. */}
        <div className="shell tear__ticks" aria-hidden="true">
          {c.stages.map((stage, i) => (
            <span className="tear__tick" key={stage.n} data-on={beat >= i} />
          ))}
        </div>
      </div>
    </Section>
  )
}
