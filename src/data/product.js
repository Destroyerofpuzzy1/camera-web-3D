/* =============================================================================
   Product copy, specification sheet and commerce model.
   Everything a copywriter or merchandiser would touch lives here. No strings of
   consequence are hard-coded into components.

   Voice: direct product language. State the feature, then the number that backs
   it. No metaphors, no narrative, no abstraction.

   Write copy with ordinary spaces. `bind()` at the bottom of this file walks the
   exported strings once at load and glues every figure to its unit with a
   non-breaking space, so "658 g" can never break across a line.
   ========================================================================== */

export const BRAND = {
  name: 'FRAME',
  unit: '01',
  wordmark: 'FRAME / 01',
}

/** Locale-aware formatter used by every price on the page. */
export const price = (n) => '€' + n.toLocaleString('en-GB')

const FINISHES_RAW = [
  {
    id: 'graphite',
    name: 'Graphite',
    note: 'Anodised black, matte',
    swatch: '#1a1d21',
    /** Drives a real material swap on the 3D model's top deck and dials. */
    deck: { color: '#0f1216', metalness: 0.92, roughness: 0.44 },
  },
  {
    id: 'silver',
    name: 'Silver',
    note: 'Bead-blasted top plate',
    swatch: '#a8adb3',
    deck: { color: '#9aa0a7', metalness: 0.96, roughness: 0.31 },
  },
]

const KITS_RAW = [
  {
    id: 'body',
    name: 'Body only',
    note: 'Body, FR-B2 battery, strap, charger',
    price: 5890,
  },
  {
    id: 'creator',
    name: 'Creator kit',
    note: 'Body, FR 35 mm f/1.2 ASPH, second battery, 512 GB card',
    price: 7340,
  },
]

const VALUE_POINTS_RAW = [
  { k: 'Shipping', v: 'Free, insured, signature on delivery' },
  { k: 'Returns', v: '30 days' },
  { k: 'Warranty', v: '2 years, extendable to 5' },
]

const AVAILABILITY_RAW = {
  state: 'In stock',
  note: 'Ships in 3 working days.',
}

/* --- Specification sheet ---------------------------------------------------
   Grouped the way a photographer reads a spec sheet. Figures are plausible for
   a 2026 flagship full-frame body.
   ------------------------------------------------------------------------ */

const SPECS_RAW = [
  {
    group: 'Sensor',
    ref: 'S',
    rows: [
      ['Type', '61.0 MP full-frame BSI CMOS'],
      ['Size', '35.9 × 24.0 mm'],
      ['Processor', 'FRAME X2, dual 16-bit readout'],
      ['ISO range', '64 to 25 600, extendable 32 to 102 400'],
      ['Dynamic range', '15.3 stops at base ISO'],
      ['Colour depth', '16-bit raw'],
    ],
  },
  {
    group: 'Optics',
    ref: 'O',
    rows: [
      ['Mount', 'FR bayonet, 10-pin, 54 mm throat'],
      ['Flange distance', '20.0 mm, ±8 µm'],
      ['Stabilisation', '5-axis in-body, 8.0 stops CIPA'],
      ['Shutter', '1/8000 mechanical, 1/32000 electronic'],
      ['Continuous shooting', '30 fps raw, 1 100-frame buffer'],
      ['Autofocus', '759-point phase detect, full coverage, to −6 EV'],
    ],
  },
  {
    group: 'Viewing',
    ref: 'V',
    rows: [
      ['Viewfinder', '5.76 M-dot OLED, 0.90×, 120 Hz'],
      ['Display', '3.2 in, 2.1 M-dot, two-axis tilt'],
      ['Brightness', '1 600 nits, DCI-P3'],
      ['Viewfinder lag', '4.8 ms'],
    ],
  },
  {
    group: 'Video',
    ref: 'R',
    rows: [
      ['Recording', '8K 30p, 4K 120p, 10-bit 4:2:2 internal'],
      ['Log profile', 'FR-Log3, 14 stops'],
      ['Storage', 'Dual CFexpress Type B'],
      ['Connectivity', 'USB-C 40 Gb/s, full-size HDMI, 2.5 GbE'],
    ],
  },
  {
    group: 'Body',
    ref: 'B',
    rows: [
      ['Construction', 'Machined magnesium alloy, four sections'],
      ['Weather sealing', 'IP53, −10 °C to 40 °C'],
      ['Battery', 'FR-B2, 580 frames CIPA'],
      ['Dimensions', '153 × 100 × 60 mm'],
      ['Weight', '658 g with battery and card'],
    ],
  },
]

/* --- Section copy ---------------------------------------------------------- */

const COPY_RAW = {
  hero: {
    label: 'FRAME / 01',
    statement: ['The camera', '*as an* instrument.'],
    lede:
      '61 megapixel full-frame sensor. Machined magnesium body. 8 stops of in-body stabilisation.',
    ctaPrimary: 'Buy now',
    ctaSecondary: 'See the build',
    scrollHint: 'Scroll',
  },

  silhouette: {
    index: '01',
    eyebrow: 'Body',
    statement: 'Machined metal body.',
    /** Callouts revealed one at a time as the body turns. */
    callouts: [
      {
        n: 'A',
        t: 'Magnesium shell',
        d: 'One billet, 0.8 mm wall',
        p: 'The shell is milled from a single magnesium billet in four passes. Wall thickness is even throughout and the chassis mounts land on machined faces.',
      },
      {
        n: 'B',
        t: 'Control dials',
        d: '12 detents, 1.4 N·cm',
        p: 'Three dials with twelve detents each. One click is a third of a stop, three clicks is a full stop. The knurling is cut, not pressed.',
      },
      {
        n: 'C',
        t: 'FR bayonet mount',
        d: '54 mm throat, 10 gold contacts',
        p: 'A 54 mm throat and a 20 mm flange distance. Stainless steel ring, gold-plated contacts, shimmed against the sensor carrier at assembly.',
      },
      {
        n: 'D',
        t: 'Tilting display',
        d: 'Two-axis hinge, 180 000 cycles',
        p: 'The display swings on a steel axle that runs the full width of the recess. It holds any angle and closes flush with the body.',
      },
      {
        n: 'E',
        t: 'Textured grip',
        d: '22 mm depth',
        p: 'Moulded elastomer over the battery bay, 22 mm deep at the first knuckle. The weight sits over the mount rather than behind the lens.',
      },
    ],
  },

  lens: {
    index: '02',
    eyebrow: 'Optics',
    statement: 'Fast prime optics.',
    prose: [
      'The FR 35 mm f/1.2 ASPH uses fourteen elements in ten groups. Three are ultra-low dispersion and two are aspherical, polished rather than moulded.',
      'Multilayer coating holds reflectance to 0.18 %. Minimum focus is 0.28 m and the iris stays circular to f/2.8.',
    ],
    stats: [
      ['Elements / groups', '14 / 10'],
      ['Maximum aperture', 'f/1.2'],
      ['Iris', '11 blades'],
      ['Coating', 'MgF₂ multilayer, 0.18 %'],
      ['Minimum focus', '0.28 m'],
      ['Filter thread', '82 mm'],
    ],
    coda: {
      label: 'FR 35 mm f/1.2 ASPH',
      line: '14 elements. 11 blades. 0.18 % reflectance.',
    },
  },

  /* --- Uses an editorial plate rather than the live 3D ---------------------- */
  sensor: {
    index: '03',
    eyebrow: 'Sensor',
    statement: 'High resolution sensor.',
    prose: [
      '61 megapixels on a back-illuminated full-frame sensor, read out at up to 60 frames per second. Dual 16-bit readout paths run in parallel for 15.3 stops of dynamic range.',
      '759 phase-detect points cover the full frame and focus down to −6 EV. Continuous shooting runs at 30 fps in raw.',
    ],
    figures: [
      ['61.0', 'MP', 'Resolution'],
      ['15.3', 'stops', 'Dynamic range'],
      ['30', 'fps', 'Raw burst'],
      ['−6', 'EV', 'Autofocus floor'],
    ],
    plate: {
      src: '/plates/plate-sensor.webp',
      alt: 'FRAME / 01 body with the lens removed, showing the full-frame sensor inside the bayonet mount',
      position: '50% 48%',
    },
  },

  exploded: {
    index: '04',
    eyebrow: 'Construction',
    statement: 'Built from 211 parts.',
    prose: [
      'The sensor carrier is the reference plane. The mount, the chassis rails, the shutter box and the display hinge are all located from it, which holds the flange distance to ±8 µm.',
      '211 parts, all referenced to the same plane.',
    ],
    /** `rig` maps to a node name in the GLB, so labels track real geometry. */
    layers: [
      { rig: 'LENS_ROOT', n: '01', t: 'Optical assembly', d: '14 elements, 10 groups' },
      { rig: 'BODY_MOUNT_RIG', n: '02', t: 'Bayonet mount', d: 'Stainless steel, ±8 µm' },
      { rig: 'FRONT_CHASSIS_RIG', n: '03', t: 'Front chassis', d: 'Control cluster, light trap' },
      { rig: 'SENSOR_RIG', n: '04', t: 'Sensor module', d: '61 MP BSI CMOS' },
      { rig: 'BODY_SHELL_RIG', n: '05', t: 'Body shell', d: 'Magnesium, four sections' },
      { rig: 'GRIP_RIG', n: '06', t: 'Grip and battery', d: 'Elastomer over the FR-B2 bay' },
      { rig: 'REAR_CHASSIS_RIG', n: '07', t: 'Control cluster', d: 'Eight keys, one wheel' },
      { rig: 'DISPLAY_RIG', n: '08', t: 'Rear display', d: '3.2 in, two-axis hinge' },
      { rig: 'VIEWFINDER_RIG', n: '09', t: 'Viewfinder', d: '5.76 M-dot OLED' },
    ],
  },

  handling: {
    index: '05',
    eyebrow: 'Handling',
    statement: 'Manual control, refined ergonomics.',
    beats: [
      ['658 g', 'With battery and card'],
      ['22 mm', 'Grip depth'],
      ['1.4 N·cm', 'Dial detent torque'],
      ['4.8 ms', 'Viewfinder lag'],
    ],
    blocks: [
      {
        t: 'Two-axis tilting display',
        p: '3.2 inch, 2.1 million dots, 1 600 nits. The hinge is rated to 180 000 cycles and holds any angle it is set to.',
      },
      {
        t: 'Grip and balance',
        p: '22 mm of grip depth at the first knuckle, with the battery behind it rather than under the lens. 658 g with battery and card.',
      },
      {
        t: 'Three dials, eight keys, one wheel',
        p: 'The shutter release sits under the index finger and the rear wheel under the thumb. Exposure changes without moving your eye from the viewfinder.',
      },
    ],
  },

  /* --- Uses editorial plates rather than the live 3D ------------------------ */
  gallery: {
    index: '06',
    eyebrow: 'Features',
    panels: [
      {
        id: 'see',
        t: 'See the frame.',
        d: '5.76 million dot OLED viewfinder at 0.90× magnification, running at 120 Hz with 4.8 ms of lag. The image stays sharp and steady while you pan.',
        meta: 'Viewfinder / 5.76 M-dot OLED',
        plate: {
          src: '/plates/plate-viewfinder.webp',
          alt: 'Rear three-quarter view of FRAME / 01 showing the viewfinder, rear display and control dials',
          position: '52% 50%',
        },
      },
      {
        id: 'control',
        t: 'Control the moment.',
        d: '30 raw frames per second with a 1 100-frame buffer. Mechanical shutter to 1/8000, electronic to 1/32000, rated to 500 000 actuations.',
        meta: 'Shutter / 30 fps raw',
        plate: {
          src: '/plates/plate-deck.webp',
          alt: 'Top deck of FRAME / 01 showing three milled control dials, the shutter release and the hot shoe',
          position: '50% 50%',
        },
      },
      {
        id: 'light',
        t: 'Made for light.',
        d: 'ISO 64 to 25 600 with 15.3 stops of dynamic range. Multilayer coating holds lens reflectance to 0.18 %, so flare stays under control against the sun.',
        meta: 'Optics / FR 35 mm f/1.2 ASPH',
        plate: {
          src: '/plates/plate-mount.webp',
          alt: 'Macro detail of the FR 35 mm lens control rings meeting the stainless steel bayonet mount',
          position: '44% 50%',
        },
      },
      {
        id: 'hand',
        t: 'Precision in hand.',
        d: '8 stops of in-body stabilisation across 5 axes. 658 g with battery and card, 22 mm of grip depth, and an IP53-sealed magnesium shell.',
        meta: 'Stabilisation / 8.0 stops CIPA',
        plate: {
          src: '/plates/plate-grip.webp',
          alt: 'Front three-quarter view of FRAME / 01 from the grip side with the lens attached',
          position: '50% 52%',
        },
      },
    ],
  },

  specs: {
    index: '07',
    eyebrow: 'Specification',
    statement: 'Full specification.',
    note: 'CIPA-standard figures where a standard applies. All other figures are measured in-house on production bodies.',
  },

  purchase: {
    index: '08',
    eyebrow: 'Order',
    positioning: '61 MP full-frame sensor, machined magnesium body. Two configurations.',
  },

  close: {
    statement: ['Built for', 'professional', 'image making.'],
    lede: '61 MP full frame. 8 stops of stabilisation. Two-year warranty.',
    ctaPrimary: 'Buy now',
    ctaSecondary: 'See full specification',
  },
}

const NAV_RAW = [
  { id: 'silhouette', label: 'Body' },
  { id: 'lens', label: 'Optics' },
  { id: 'exploded', label: 'Construction' },
  { id: 'specs', label: 'Specification' },
]

const FOOTER_RAW = {
  columns: [
    { t: 'Product', links: ['FRAME / 01', 'FR lenses', 'Accessories', 'Compare bodies'] },
    { t: 'Support', links: ['Firmware', 'Manuals', 'Service centres', 'Contact'] },
    { t: 'Company', links: ['About', 'Manufacturing', 'Press', 'Careers'] },
  ],
  legal: 'FRAME Instruments',
  note: 'A design exercise. FRAME / 01 is a fictional product.',
}

/* --- Typographic binding ---------------------------------------------------
   A figure and its unit are one word to a reader and should be one word to the
   line-breaker too. Applied once, at load, to every exported string, so copy
   above can be written and edited with ordinary spaces.
   ------------------------------------------------------------------------ */

const UNIT =
  /(\d)[ ](mm|cm|m|g|kg|MP|fps|Hz|kHz|ms|µm|nits|stops?|axes|EV|in|inch|GB|Gb\/s|N·cm|°C|%)(?![a-zA-Z])/g

/** Also keeps "ISO 64" and "f/ 1.2"-style pairs together. */
/** Thousands are separated by a space in this copy; that must not break either. */
const THOUSANDS = /(\d)[ ](\d{3})(?!\d)/g

/** Sensitivity readings are one token to a photographer. */
const PAIRS = [[/ISO (\d)/g, 'ISO $1']]

function bindString(value) {
  let out = value.replace(THOUSANDS, '$1 $2').replace(UNIT, '$1 $2')
  for (const [pattern, replacement] of PAIRS) out = out.replace(pattern, replacement)
  return out
}

/** Deep-maps every string in a plain data structure. */
function bind(value) {
  if (typeof value === 'string') return bindString(value)
  if (Array.isArray(value)) return value.map(bind)
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, bind(v)]))
  }
  return value
}

export const FINISHES = bind(FINISHES_RAW)
export const KITS = bind(KITS_RAW)
export const VALUE_POINTS = bind(VALUE_POINTS_RAW)
export const AVAILABILITY = bind(AVAILABILITY_RAW)
export const SPECS = bind(SPECS_RAW)
export const COPY = bind(COPY_RAW)
export const NAV = bind(NAV_RAW)
export const FOOTER = bind(FOOTER_RAW)
