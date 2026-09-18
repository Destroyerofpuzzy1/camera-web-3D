/* =============================================================================
   06 FEATURES
   Four editorial spreads. Each crops a still into a hard-edged window on one
   side of the page and sets the copy against it on the other. The window flips
   sides between panels, which is what makes the section read as a sequence of
   spreads rather than one long scroll.

   These four use generated stills rather than the live 3D: the camera angles
   this section needs are close product crops, and a still holds its framing at
   every viewport where a scrubbed 3D crop does not. The gate geometry is
   unchanged, so the layout does not know the difference.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat } from '../lib/ticker.js'
import { useNarrow } from '../lib/useNarrow.js'
import Gate from '../ui/Gate.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.gallery
const STOPS = [0.27, 0.52, 0.78, 1]

/* Window geometry per side. Edges are distances from the top / left.
   Centres land at 71 % and 29 %, which is where the choreography's frame
   offsets of +0.42 and -0.42 put the subject. */
const WINDOW = {
  right: { t: '9%', b: '91%', l: '47%', r: '96%' },
  left: { t: '9%', b: '91%', l: '4%', r: '53%' },
}

/* Stacked: the crop takes the upper half and the copy takes the floor. */
const WINDOW_NARROW = { t: '11%', b: '50%', l: '4%', r: '96%' }

/** One image per panel, all mounted so a panel change cross-fades. */
const PLATES = c.panels.map((panel) => ({ id: panel.id, ...panel.plate }))

export default function Gallery() {
  const beat = useBeat('gallery', STOPS)
  const narrow = useNarrow()
  // Odd panels put the copy on the right, so the window goes left.
  const copyRight = beat % 2 === 1
  const side = copyRight ? 'left' : 'right'

  return (
    <Section id="gallery" className="gal">
      <div className="sticky gal__stick">
        <Gate
          window={narrow ? WINDOW_NARROW : WINDOW[side]}
          plates={PLATES}
          active={c.panels[beat]?.id}
        />

        {c.panels.map((panel, i) => {
          const right = i % 2 === 1
          return (
            <div className="gal__panel" key={panel.id} data-on={beat === i}>
              <span
                className={`gal__ghost ${right ? 'gal__ghost--r' : 'gal__ghost--l'}`}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="shell grid12 gal__grid">
                <div className={right ? 'gal__body gal__body--r' : 'gal__body'}>
                  <Eyebrow index={`${c.index}.${i + 1}`}>{c.eyebrow}</Eyebrow>
                  <h2 className="gal__t">{panel.t}</h2>
                  <p className="gal__d">{panel.d}</p>
                  <div className="gal__meta">
                    <span className="label">{panel.meta}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
