/* =============================================================================
   02 OPTICS
   The camera crosses to the right of the frame and the camera pushes down the
   optical axis into the front element. On the left, the formula drawn as an
   optical section: fourteen elements in ten groups, with the iris where it
   actually sits.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { useBeat, useInSection } from '../lib/ticker.js'
import Callout from '../ui/Callout.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section, { Eyebrow } from './Section.jsx'

const c = COPY.lens

/* --- Optical schematic ----------------------------------------------------
   Each element is [centre x, half height, thickness, front bulge, rear bulge,
   glass type]. Positive bulge is convex. The values are drawn to match the
   cutaway: a heavy front group, the iris at the waist, a compact rear group.
   ------------------------------------------------------------------------ */

const AXIS_Y = 25
const ELEMENTS = [
  [11, 17.5, 5.0, 6.5, 1.0, 'std'],
  [20, 16.5, 3.0, 1.0, -5.0, 'std'],
  [27, 14.5, 4.2, 4.0, 3.5, 'ld'],
  [35, 13.0, 2.4, -3.0, 3.0, 'std'],
  [42, 12.0, 4.0, 4.0, 3.0, 'asph'],
  [50, 11.0, 2.4, 2.0, -2.2, 'std'],
  // iris at 59
  [69, 10.0, 3.0, 3.0, 3.0, 'std'],
  [76, 10.0, 2.4, -2.2, 3.0, 'ld'],
  [83, 10.5, 3.6, 3.2, 2.2, 'std'],
  [91, 11.0, 2.4, 2.0, -3.0, 'std'],
  [99, 11.5, 3.0, 3.0, 3.0, 'ld'],
  [107, 12.0, 2.6, -2.0, 2.2, 'std'],
  [115, 12.0, 4.0, 4.0, 2.0, 'asph'],
  [124, 11.0, 2.6, 2.0, 2.0, 'std'],
]
const IRIS_X = 59
const FLANGE_X = 134
const SENSOR_X = 148

const CLASS = { std: 'el', ld: 'el el--ld', asph: 'el el--fl' }

function elementPath([x, h, t, c1, c2]) {
  const xl = x - t / 2
  const xr = x + t / 2
  // Quadratic control points chosen so the surface apex lands exactly `c` away.
  const cl = xl - 2 * c1
  const cr = xr + 2 * c2
  const top = AXIS_Y - h
  const bot = AXIS_Y + h
  return `M ${xl} ${top} Q ${cl} ${AXIS_Y} ${xl} ${bot} L ${xr} ${bot} Q ${cr} ${AXIS_Y} ${xr} ${top} Z`
}

function Schematic() {
  return (
    <svg
      className="lens__schematic"
      viewBox="0 0 160 54"
      role="img"
      aria-label="Optical section: fourteen elements in ten groups with the iris at the waist"
    >
      {/* Optical axis */}
      <line className="axis" x1="2" y1={AXIS_Y} x2="158" y2={AXIS_Y} />

      {ELEMENTS.map((el, i) => (
        <path key={i} className={CLASS[el[5]]} d={elementPath(el)} />
      ))}

      {/* Iris: a pair of blades opened to f/1.2 */}
      <g className="iris">
        <path d={`M ${IRIS_X} ${AXIS_Y - 13} L ${IRIS_X} ${AXIS_Y - 5.5}`} />
        <path d={`M ${IRIS_X} ${AXIS_Y + 13} L ${IRIS_X} ${AXIS_Y + 5.5}`} />
        <path d={`M ${IRIS_X - 2.6} ${AXIS_Y - 13} L ${IRIS_X + 2.6} ${AXIS_Y - 13}`} />
        <path d={`M ${IRIS_X - 2.6} ${AXIS_Y + 13} L ${IRIS_X + 2.6} ${AXIS_Y + 13}`} />
      </g>

      {/* Flange and sensor plane */}
      <line className="axis" x1={FLANGE_X} y1={AXIS_Y - 15} x2={FLANGE_X} y2={AXIS_Y + 15} />
      <line
        className="el"
        x1={SENSOR_X}
        y1={AXIS_Y - 9}
        x2={SENSOR_X}
        y2={AXIS_Y + 9}
        strokeWidth="1.4"
      />

      {/* Dimension between flange and sensor: the 20 mm that defines the mount */}
      <g className="bracket">
        <path d={`M ${FLANGE_X} ${AXIS_Y + 19} L ${SENSOR_X} ${AXIS_Y + 19}`} />
        <path d={`M ${FLANGE_X} ${AXIS_Y + 16.5} L ${FLANGE_X} ${AXIS_Y + 21.5}`} />
        <path d={`M ${SENSOR_X} ${AXIS_Y + 16.5} L ${SENSOR_X} ${AXIS_Y + 21.5}`} />
      </g>

      <text className="tag" x="9" y="5">
        FRONT
      </text>
      <text className="tag" x={IRIS_X - 5} y="5">
        IRIS
      </text>
      <text className="tag" x={FLANGE_X - 12} y={AXIS_Y + 26}>
        20.0 MM
      </text>
      <text className="tag" x={SENSOR_X - 8} y="5">
        SENSOR
      </text>
    </svg>
  )
}

/** The copy clears out for the last third so the macro can go full bleed. */
const STOPS = [0.6, 1]

export default function Optics() {
  const active = useInSection('lens')
  const beat = useBeat('lens', STOPS)
  const macro = beat === 1

  return (
    <Section id="lens" className="lens">
      <div className="sticky lens__stick">
        <Scrim side="left" reach={macro ? 34 : 62} strength={macro ? 0.72 : 0.94} />

        <div className="shell grid12 lens__grid" data-macro={macro}>
          <div className="lens__col">
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

            <div data-reveal="" style={{ '--reveal-delay': '220ms' }}>
              <Schematic />
            </div>

            <div className="lens__stats" data-reveal="" style={{ '--reveal-delay': '300ms' }}>
              {c.stats.map(([k, v]) => (
                <div className="lens__row" key={k}>
                  <span className="lens__k">{k}</span>
                  <span className="lens__v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What is left once the copy clears: one line, against the glass. */}
        <div className="lens__coda" data-on={macro}>
          <span className="label">{c.coda.label}</span>
          <p className="display t-md">{c.coda.line}</p>
        </div>
      </div>

      <Callout
        anchor="focus"
        side="left"
        leader={70}
        title="Focus ring"
        detail="0.28 m to infinity, 140 degrees"
        show={active && !macro}
      />
      <Callout
        anchor="glass"
        side="right"
        leader={58}
        title="Front element"
        detail="Ground to a quarter wave"
        show={active}
      />
    </Section>
  )
}
