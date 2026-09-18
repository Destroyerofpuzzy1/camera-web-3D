/* =============================================================================
   CHOREOGRAPHY
   -----------------------------------------------------------------------------
   The single source of truth for scroll-driven motion. Every camera move, model
   state and lighting change on the page is a row in KEYFRAMES below. Nothing
   else in the codebase decides where the camera goes.

   Coordinate frame (metres, after rigRepair):
     body centre .......... 0, 0, 0          body spans x ±0.077, y -0.040..0.042
     optical axis ......... x +0.010, y +0.004
     bayonet face ......... z +0.024
     front element ........ z +0.145
     sensor plane ......... z +0.009
     rear display ......... z -0.025
     finder top ........... y +0.061

   A keyframe is anchored to a section id and a 0..1 position within it, so
   pacing can be retuned by changing a section's `length` without touching a
   single camera number.

   Fields
     pos         camera position
     target      camera look-at
     fov         vertical field of view, degrees
     frame       where `target` should land in normalised device coords.
                 [-0.35, 0] puts the subject in the left third, leaving the right
                 for type. This is how the 2D and 3D layers share the screen.
     spin        extra Y rotation of the whole model, radians
     explode     0..1, drives EXPLODE_OFFSETS
     detach      metres the lens slides forward off the mount
     tilt        0..1, rear display swing
     light       0 dark studio, 1 bright studio. Also drives the DOM backdrop,
                 so the 2D and 3D layers change mood on the same curve.
     ease        easing applied on the way *into* this keyframe
   ========================================================================== */

/** Section scroll lengths, in viewport heights. The pacing dial. */
export const SECTIONS = [
  { id: 'hero', length: 165 },
  { id: 'silhouette', length: 460 },
  { id: 'lens', length: 340 },
  { id: 'sensor', length: 320 },
  { id: 'exploded', length: 420 },
  { id: 'handling', length: 340 },
  { id: 'gallery', length: 420 },
  { id: 'specs', length: 200 },
  { id: 'purchase', length: 180 },
  { id: 'close', length: 190 },
]

/** Chapter labels for the progress indicator. */
export const CHAPTER_INDEX = [
  { id: 'hero', n: '00', label: 'Overview' },
  { id: 'silhouette', n: '01', label: 'Body' },
  { id: 'lens', n: '02', label: 'Optics' },
  { id: 'sensor', n: '03', label: 'Sensor' },
  { id: 'exploded', n: '04', label: 'Construction' },
  { id: 'handling', n: '05', label: 'Handling' },
  { id: 'gallery', n: '06', label: 'Features' },
  { id: 'specs', n: '07', label: 'Specification' },
  { id: 'purchase', n: '08', label: 'Order' },
  { id: 'close', n: '09', label: 'Close' },
]

const DEFAULTS = {
  fov: 30,
  frame: [0, 0],
  spin: 0,
  explode: 0,
  detach: 0,
  tilt: 0,
  light: 0,
  ease: 'inOut',
}

/**
 * Keyframes in document order. Consecutive rows are interpolated; the last row
 * of a section and the first of the next are the handoff, so they should agree
 * on everything that must not jump.
 */
export const KEYFRAMES = [
  /* -- 00 Hero ------------------------------------------------------------ */
  {
    at: ['hero', 0],
    pos: [0.282, 0.138, 0.442], target: [0.006, 0.004, 0.052],
    fov: 30, frame: [0.12, 0.28], ease: 'linear',
  },
  {
    at: ['hero', 1],
    pos: [0.186, 0.196, 0.508], target: [0.006, 0.004, 0.050],
    fov: 29, frame: [0.12, 0.30], spin: 0.24,
  },

  /* -- 01 Silhouette -------------------------------------------------------
     Five beats around the body. The instrument holds the left half; callouts
     and prose take the right. Each beat lands on one physical detail.

     Distances here are set so the object fills roughly 45 % of the frame
     width. Closer than that and the type has nowhere to sit.                 */
  {
    at: ['silhouette', 0.16],
    pos: [-0.418, 0.102, 0.338], target: [-0.012, 0.002, 0.020],
    fov: 29, frame: [-0.34, 0.02], spin: 0.24,
  },
  {
    at: ['silhouette', 0.37],
    pos: [-0.042, 0.492, 0.262], target: [-0.016, 0.020, 0.004],
    fov: 30, frame: [-0.34, 0.04], spin: 0.10,
  },
  {
    at: ['silhouette', 0.57],
    pos: [0.142, 0.062, 0.548], target: [0.010, 0.004, 0.024],
    fov: 26, frame: [-0.34, 0.02], spin: 0,
  },
  {
    at: ['silhouette', 0.78],
    pos: [-0.286, 0.184, -0.462], target: [0.000, 0.000, -0.020],
    fov: 30, frame: [-0.34, 0.02], spin: 0, tilt: 0.55,
  },
  {
    at: ['silhouette', 1],
    pos: [-0.382, -0.012, 0.286], target: [-0.050, -0.006, 0.012],
    fov: 26, frame: [-0.34, 0], tilt: 0,
  },

  /* -- 02 Optics -----------------------------------------------------------
     One long push along the optical axis into the front element. The object
     crosses to the right so the section reads as a turn of the page, then the
     copy clears out and the last third goes full bleed.                      */
  {
    at: ['lens', 0.26],
    pos: [0.302, 0.058, 0.522], target: [0.010, 0.004, 0.100],
    fov: 28, frame: [0.34, 0],
  },
  {
    at: ['lens', 0.62],
    pos: [0.132, 0.036, 0.442], target: [0.010, 0.004, 0.134],
    fov: 26, frame: [0.26, 0],
  },
  {
    at: ['lens', 1],
    pos: [0.024, 0.014, 0.272], target: [0.010, 0.004, 0.145],
    fov: 26, frame: [0.10, 0], ease: 'out',
  },

  /* -- 03 Sensor -----------------------------------------------------------
     The lens genuinely detaches (it is a separate rig in the GLB) and travels
     forward, clearing the throat so the sensor can be reached. The studio
     lifts to bright here, and the DOM inverts to paper on the same curve.    */
  {
    at: ['sensor', 0.22],
    pos: [0.128, 0.052, 0.306], target: [0.010, 0.004, 0.088],
    fov: 28, frame: [0.18, 0], detach: 0.10, light: 0.45,
  },
  {
    at: ['sensor', 0.55],
    pos: [0.078, 0.030, 0.178], target: [0.010, 0.004, 0.022],
    fov: 32, frame: [0.06, 0], detach: 0.26, light: 1,
  },
  {
    at: ['sensor', 0.86],
    pos: [0.027, 0.013, 0.121], target: [0.010, 0.004, 0.009],
    fov: 28, frame: [0, 0], detach: 0.32, light: 1,
  },
  {
    at: ['sensor', 1],
    pos: [0.052, 0.026, 0.148], target: [0.010, 0.004, 0.012],
    fov: 28, frame: [0, 0], detach: 0.32, light: 0.7,
  },

  /* -- 04 Architecture -----------------------------------------------------
     The lens comes back onto the body, then the whole instrument fans along
     its own optical axis.

     The fan runs along Z, so the camera swings round to +X and views it almost
     side on. That is the only angle at which an exploded view reads as a
     sequence rather than a pile of concentric rings.                         */
  {
    at: ['exploded', 0.08],
    pos: [0.418, 0.196, 0.618], target: [0.010, 0.000, 0.076],
    fov: 29, detach: 0.06, light: 0.2,
  },
  {
    at: ['exploded', 0.42],
    pos: [0.902, 0.262, 0.402], target: [0.010, 0.000, 0.168],
    fov: 30, frame: [0, -0.04], explode: 1, light: 0.1,
  },
  {
    at: ['exploded', 0.74],
    pos: [0.746, 0.418, 0.618], target: [0.010, 0.000, 0.168],
    fov: 30, frame: [0, -0.04], explode: 1, light: 0.14,
  },
  {
    at: ['exploded', 1],
    pos: [0.402, 0.184, 0.606], target: [0.008, 0.000, 0.072],
    fov: 29, explode: 0.06, light: 0.06,
  },

  /* -- 05 Handling ---------------------------------------------------------
     Mechanical beats: the display swings on its real axle, then the grip and
     the top deck. Motion here is shorter and firmer than the rest of the page.

     Frame sign follows the copy: beats 0 and 2 put type on the right, so the
     object goes left; beat 1 is the other way round.                         */
  {
    at: ['handling', 0.08],
    pos: [0.302, 0.146, 0.548], target: [0.005, 0.000, 0.048],
    fov: 30, frame: [-0.30, 0.02],
  },
  {
    at: ['handling', 0.36],
    pos: [-0.302, 0.222, -0.458], target: [0.000, 0.002, -0.020],
    fov: 30, frame: [-0.30, 0.02], tilt: 1, ease: 'out',
  },
  {
    at: ['handling', 0.68],
    pos: [-0.402, 0.042, 0.242], target: [-0.048, -0.004, 0.008],
    fov: 28, frame: [0.30, 0], tilt: 0.35,
  },
  {
    at: ['handling', 1],
    pos: [-0.156, 0.402, 0.232], target: [-0.030, 0.030, 0.000],
    fov: 28, frame: [-0.30, 0.02], tilt: 0,
  },

  /* -- 06 Field notes ------------------------------------------------------
     Four spreads. The object alternates sides so each panel turns the page,
     and each shot is cropped into a film gate, which is what lets these stay
     genuinely macro without the copy having to fight them. The frame offsets
     put the subject at the centre of the window: see WINDOW in Gallery.jsx.  */
  {
    at: ['gallery', 0.14],
    pos: [-0.182, 0.212, -0.306], target: [0.005, 0.048, -0.020],
    fov: 26, frame: [0.42, 0.02],
  },
  {
    at: ['gallery', 0.40],
    pos: [-0.126, 0.272, 0.148], target: [-0.038, 0.045, -0.007],
    fov: 26, frame: [-0.42, 0.02],
  },
  {
    at: ['gallery', 0.66],
    pos: [0.096, 0.046, 0.372], target: [0.010, 0.004, 0.140],
    fov: 26, frame: [0.42, 0.02],
  },
  {
    at: ['gallery', 0.92],
    pos: [-0.322, -0.034, 0.238], target: [-0.050, -0.008, 0.012],
    fov: 26, frame: [-0.42, 0.02],
  },

  /* -- 07 Specification ----------------------------------------------------
     Paper. The instrument turns slowly inside a tall window on the right, so
     it has to sit further back than anywhere else on the page.               */
  {
    at: ['specs', 0.15],
    pos: [0.498, 0.204, 0.782], target: [0.010, 0.000, 0.058],
    fov: 30, frame: [0.56, 0], light: 1,
  },
  {
    at: ['specs', 1],
    pos: [0.372, 0.242, 0.836], target: [0.010, 0.000, 0.058],
    fov: 30, frame: [0.56, 0], spin: 0.18, light: 1,
  },

  /* -- 08 Order ------------------------------------------------------------ */
  {
    at: ['purchase', 0.3],
    pos: [0.358, 0.122, 0.552], target: [0.005, 0.000, 0.050],
    fov: 30, frame: [-0.32, 0.02], spin: 0.10, light: 0.28,
  },
  {
    at: ['purchase', 1],
    pos: [0.298, 0.142, 0.586], target: [0.005, 0.000, 0.050],
    fov: 30, frame: [-0.32, 0.02], spin: -0.04, light: 0.2,
  },

  /* -- 09 Close ------------------------------------------------------------
     Everything slows. One long pull back, the studio dims to almost nothing. */
  {
    at: ['close', 0.4],
    pos: [0.222, 0.118, 0.602], target: [0.008, 0.000, 0.058],
    fov: 27, frame: [0.08, 0.26], spin: -0.16, light: 0.06, ease: 'inOut',
  },
  {
    at: ['close', 1],
    pos: [0.102, 0.062, 0.782], target: [0.008, 0.000, 0.060],
    fov: 25, frame: [0.06, 0.24], spin: -0.34, light: 0, ease: 'linear',
  },
]

/* --- Instrument read-out ---------------------------------------------------
   The persistent overlay shows a plausible exposure and focus state that
   changes per chapter. It is set dressing, but it is *consistent* dressing:
   the numbers move the way they would if you were actually working the body.
   ------------------------------------------------------------------------ */

export const READOUT = {
  hero:       { f: '1.2', s: '1/250', iso: '64',   d: '2.4', mode: 'A' },
  silhouette: { f: '5.6', s: '1/125', iso: '100',  d: '0.9', mode: 'M' },
  lens:       { f: '1.2', s: '1/1000',iso: '64',   d: '0.28', mode: 'A' },
  sensor:     { f: '8.0', s: '1/60',  iso: '64',   d: '0.12', mode: 'M' },
  exploded:   { f: '11',  s: '1/30',  iso: '200',  d: '1.6', mode: 'M' },
  handling:   { f: '2.8', s: '1/500', iso: '400',  d: '0.6', mode: 'S' },
  gallery:    { f: '1.4', s: '1/2000',iso: '64',   d: '0.4', mode: 'A' },
  specs:      { f: '8.0', s: '1/125', iso: '64',   d: '1.2', mode: 'M' },
  purchase:   { f: '4.0', s: '1/250', iso: '100',  d: '1.0', mode: 'A' },
  close:      { f: '1.2', s: '1/60',  iso: '3200', d: '8.0', mode: 'A' },
}

/** Applied by the runtime to fill in anything a keyframe leaves out. */
export const KEYFRAME_DEFAULTS = DEFAULTS
