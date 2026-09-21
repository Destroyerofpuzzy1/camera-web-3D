/* =============================================================================
   CHOREOGRAPHY — RGB SHOWCASE CUT
   -----------------------------------------------------------------------------
   Five sections, ~1140vh, built to be screen-recorded:

     hero      120vh   reveal
     push      150vh   exterior
     teardown  600vh   the centrepiece — 53 % of the whole scroll
     purchase  150vh   order
     close     120vh   final frame

   The teardown is deliberately the longest chapter on the page. It opens the
   instrument as a cascade rather than all at once, holds on each group long
   enough to read it, orbits the fully exploded fan, and only then begins to
   close. Eight label beats, eight colour states.

   Coordinate frame (metres, after rigRepair):
     body centre .......... 0, 0, 0          body spans x ±0.077, y -0.040..0.042
     optical axis ......... x +0.010, y +0.004
     bayonet face ......... z +0.024
     front element ........ z +0.145
     sensor plane ......... z +0.009
     rear display ......... z -0.025
   Fully exploded the assembly spans roughly z -0.18 .. +0.60, so the wide
   teardown shots sit about 1.1 m out.

   Fields
     pos, target, fov, frame   camera
     spin        extra Y rotation of the whole model, radians
     explode     0..1, drives EXPLODE_OFFSETS through EXPLODE_STAGES
     detach      metres the lens slides forward off the mount
     tilt        0..1, rear display swing
     light       0..1, intensity multiplier the studio lights ride on
     emit        0..1, how hot the sensor surface glows
     rgb         the section's WORLD colour: background, fog, fill, ambient
     rgb2        the ACCENT: rim light and UI accents. Deliberately contrasting
                 with `rgb` — a magenta world takes a cyan rim, an acid-green
                 world takes a deep blue one. Tinting everything the same hue
                 flattens the object; opposing them sculpts it.
     ease        easing applied on the way *into* this keyframe
   ========================================================================== */

/** Section scroll lengths, in viewport heights. */
export const SECTIONS = [
  { id: 'hero', length: 120 },
  { id: 'push', length: 150 },
  { id: 'teardown', length: 600 },
  { id: 'purchase', length: 150 },
  { id: 'close', length: 120 },
]

/** Chapter labels for the progress indicator. */
export const CHAPTER_INDEX = [
  { id: 'hero', n: '00', label: 'Reveal' },
  { id: 'push', n: '01', label: 'Exterior' },
  { id: 'teardown', n: '02', label: 'Teardown' },
  { id: 'purchase', n: '03', label: 'Order' },
  { id: 'close', n: '04', label: 'Close' },
]

const DEFAULTS = {
  fov: 30,
  frame: [0, 0],
  spin: 0,
  explode: 0,
  detach: 0,
  tilt: 0,
  light: 0.35,
  emit: 0,
  rgb: [0, 0.937, 1],
  rgb2: [0.478, 0.173, 1],
  ease: 'inOut',
}

/* --- RGB palette ------------------------------------------------------------
   Saturated on purpose. These are the colours the whole screen takes, not an
   accent on top of black, so they are the full-strength values and the CSS
   decides how deep to run them.

   #00EFFF cyan · #0066FF blue · #7A2CFF violet · #FF00B8 magenta
   #FF3BC8 pink · #B7FF00 lime · #FF3A00 orange-red · #FF004D red
   ------------------------------------------------------------------------ */
const CYAN = [0, 0.937, 1]
const BLUE = [0, 0.4, 1]
const VIOLET = [0.478, 0.173, 1]
const MAGENTA = [1, 0, 0.722]
const PINK = [1, 0.231, 0.784]
const LIME = [0.718, 1, 0]
const ORANGE = [1, 0.227, 0]
const RED = [1, 0, 0.302]
const mix = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t)

/**
 * Keyframes in document order. Consecutive rows are interpolated; the last row
 * of a section and the first of the next are the handoff, so they agree on
 * every field exactly — no pop at a section boundary.
 */
export const KEYFRAMES = [
  /* == 00 REVEAL — cyan world ============================================== */
  {
    at: ['hero', 0],
    pos: [0.282, 0.138, 0.442], target: [0.006, 0.004, 0.052],
    fov: 30, frame: [0.12, 0.28], ease: 'linear',
    rgb: CYAN, rgb2: VIOLET,
  },
  {
    at: ['hero', 1],
    pos: [0.186, 0.196, 0.508], target: [0.006, 0.004, 0.050],
    fov: 29, frame: [0.12, 0.30], spin: 0.24,
    rgb: BLUE, rgb2: CYAN,
  },

  /* == 01 EXTERIOR — blue into magenta =====================================
     Short. One push and a quarter turn, ending on a readable front 3/4 that
     the teardown opens from.                                                */
  {
    at: ['push', 0],
    pos: [0.186, 0.196, 0.508], target: [0.006, 0.004, 0.050],
    fov: 29, frame: [0.12, 0.30], spin: 0.24,
    rgb: BLUE, rgb2: CYAN,
  },
  {
    at: ['push', 0.5],
    pos: [0.302, 0.058, 0.522], target: [0.010, 0.004, 0.100],
    fov: 28, frame: [0.30, 0], spin: 0.10,
    rgb: mix(BLUE, MAGENTA, 0.5), rgb2: CYAN,
  },
  {
    at: ['push', 1],
    pos: [0.352, 0.118, 0.472], target: [0.010, 0.004, 0.085],
    fov: 28, frame: [0.26, 0.02], spin: 0, ease: 'out',
    rgb: MAGENTA, rgb2: CYAN,
  },

  /* == 02 TEARDOWN — the centrepiece =======================================
     Ten shots. The cascade in EXPLODE_STAGES means `explode` rising steadily
     across the section opens one group at a time: housing, optics, mount,
     sensor, shell, rear cluster. The camera works the fan the way a product
     film would — push, travel beside it, close on the sensor, orbit wide,
     then settle and begin closing.                                          */

  // PHASE 1 — closed. Hand-off from the exterior shot, nothing moved yet.
  {
    at: ['teardown', 0],
    pos: [0.352, 0.118, 0.472], target: [0.010, 0.004, 0.085],
    fov: 28, frame: [0.26, 0.02], explode: 0,
    rgb: MAGENTA, rgb2: CYAN,
  },

  // PHASE 2 — front housing separates. Small push toward the lens.
  {
    at: ['teardown', 0.08],
    pos: [0.232, 0.072, 0.418], target: [0.010, 0.004, 0.120],
    fov: 27, frame: [0.22, 0], explode: 0.12, light: 0.45,
    rgb: mix(MAGENTA, VIOLET, 0.35), rgb2: CYAN,
  },

  // PHASE 3 — optics open. Camera travels beside the barrel, along the axis.
  {
    at: ['teardown', 0.19],
    pos: [0.118, 0.062, 0.492], target: [0.010, 0.004, 0.185],
    fov: 28, frame: [0.16, 0], explode: 0.30, light: 0.5,
    rgb: VIOLET, rgb2: PINK,
  },

  // PHASE 4 — the whole optical stack, read side on.
  {
    at: ['teardown', 0.30],
    pos: [0.492, 0.152, 0.548], target: [0.010, 0.004, 0.225],
    fov: 29, frame: [0.08, 0], explode: 0.44, light: 0.5,
    rgb: mix(VIOLET, BLUE, 0.55), rgb2: PINK,
  },

  // PHASE 5 — past the optics, onto the bayonet and the front chassis.
  {
    at: ['teardown', 0.41],
    pos: [0.322, 0.088, 0.288], target: [0.010, 0.004, 0.042],
    fov: 30, frame: [0.06, 0], explode: 0.56, light: 0.55,
    rgb: BLUE, rgb2: MAGENTA,
  },

  // PHASE 6 — sensor reveal. Closest shot in the chapter; the silicon lights.
  {
    at: ['teardown', 0.52],
    pos: [0.372, 0.152, 0.312], target: [0.010, 0.004, 0.005],
    fov: 30, frame: [0.04, 0], explode: 0.68, light: 0.75, emit: 1,
    rgb: LIME, rgb2: BLUE,
  },

  // PHASE 7 — structure. Pull back and start the orbit as the shell opens.
  {
    at: ['teardown', 0.63],
    pos: [0.652, 0.182, 0.322], target: [0.010, 0.000, 0.062],
    fov: 30, frame: [0, 0], explode: 0.80, light: 0.6, emit: 0.35,
    rgb: mix(LIME, ORANGE, 0.4), rgb2: BLUE,
  },

  // PHASE 8 — rear cluster, seen from behind the open body.
  {
    at: ['teardown', 0.74],
    pos: [0.402, 0.252, -0.352], target: [0.010, 0.000, 0.020],
    fov: 30, frame: [0, 0], explode: 0.92, light: 0.6,
    rgb: mix(LIME, ORANGE, 0.75), rgb2: CYAN,
  },

  // PHASE 9 — the full exploded hero shot. Everything out, everything visible.
  {
    at: ['teardown', 0.85],
    pos: [0.902, 0.362, 0.782], target: [0.010, 0.010, 0.150],
    fov: 30, frame: [0.05, 0.10], explode: 1, light: 1, spin: 0.08,
    rgb: ORANGE, rgb2: CYAN,
  },

  // PHASE 9b — orbit across to the other side of the fan. Camera moves, not
  // the model: the parts hold their positions so the fan stays readable.
  {
    at: ['teardown', 0.93],
    pos: [-0.502, 0.312, 1.002], target: [0.010, 0.010, 0.150],
    fov: 30, frame: [0.05, 0.10], explode: 1, light: 0.85, spin: 0.02,
    rgb: mix(ORANGE, MAGENTA, 0.5), rgb2: BLUE,
  },

  // PHASE 10 — detail close-up on the internals, parts already closing.
  {
    at: ['teardown', 1],
    pos: [0.222, 0.112, 0.372], target: [0.010, 0.004, 0.085],
    fov: 27, frame: [-0.12, 0], explode: 0.58, light: 0.55,
    rgb: RED, rgb2: VIOLET,
  },

  /* == 03 ORDER — red world ================================================ */
  {
    at: ['purchase', 0],
    pos: [0.222, 0.112, 0.372], target: [0.010, 0.004, 0.085],
    fov: 27, frame: [-0.12, 0], explode: 0.58, light: 0.55,
    rgb: RED, rgb2: VIOLET,
  },
  {
    at: ['purchase', 0.5],
    pos: [0.358, 0.122, 0.552], target: [0.005, 0.000, 0.050],
    fov: 30, frame: [-0.32, 0.02], spin: 0.10, explode: 0,
    light: 0.45, rgb: mix(RED, ORANGE, 0.6), rgb2: VIOLET,
  },
  {
    at: ['purchase', 1],
    pos: [0.298, 0.142, 0.586], target: [0.005, 0.000, 0.050],
    fov: 30, frame: [-0.32, 0.02], spin: -0.04, tilt: 0.4,
    light: 0.4, rgb: ORANGE, rgb2: VIOLET,
  },

  /* == 04 CLOSE — violet / blue / magenta finale =========================== */
  {
    at: ['close', 0],
    pos: [0.298, 0.142, 0.586], target: [0.005, 0.000, 0.050],
    fov: 30, frame: [-0.32, 0.02], spin: -0.04, tilt: 0.4,
    light: 0.4, rgb: ORANGE, rgb2: VIOLET,
  },
  {
    at: ['close', 0.5],
    pos: [0.222, 0.118, 0.602], target: [0.008, 0.000, 0.058],
    fov: 27, frame: [0.08, 0.26], spin: -0.16, tilt: 0,
    light: 0.4, ease: 'inOut', rgb: VIOLET, rgb2: MAGENTA,
  },
  {
    at: ['close', 1],
    pos: [0.102, 0.062, 0.782], target: [0.008, 0.000, 0.060],
    fov: 25, frame: [0.06, 0.24], spin: -0.34, tilt: 0,
    light: 0.35, ease: 'linear',
    rgb: mix(VIOLET, BLUE, 0.45), rgb2: MAGENTA,
  },
]

/* --- Instrument read-out --------------------------------------------------- */

export const READOUT = {
  hero:     { f: '1.2', s: '1/250',  iso: '64',  d: '2.4', mode: 'A' },
  push:     { f: '2.8', s: '1/500',  iso: '100', d: '0.6', mode: 'A' },
  teardown: { f: '8.0', s: '1/125',  iso: '64',  d: '0.2', mode: 'M' },
  purchase: { f: '5.6', s: '1/125',  iso: '100', d: '1.0', mode: 'M' },
  close:    { f: '1.2', s: '1/60',   iso: '3200', d: '8.0', mode: 'A' },
}

/** Applied by the runtime to fill in anything a keyframe leaves out. */
export const KEYFRAME_DEFAULTS = DEFAULTS
