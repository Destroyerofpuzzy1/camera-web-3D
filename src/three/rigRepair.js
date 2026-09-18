/* =============================================================================
   MODEL CONFIGURATION
   -----------------------------------------------------------------------------
   Everything the page needs to know about camera-01.glb: where the display
   hinge is, how far each rig travels when the instrument fans apart, how the
   materials are graded for a real-time studio, and which parts change with the
   buyer's chosen finish.

   The GLB is loaded pre-assembled. It was repaired offline by
   scripts/repair-model.mjs, which carries the full account of what was wrong
   with the supplied file and how it was put back; read that before touching the
   asset. Nothing here moves geometry to fix the model, only to animate it.
   ========================================================================== */

import * as THREE from 'three'

/** Rigs that make up the lens. Kept separate so the barrel can detach. */
export const LENS_RIG = 'LENS_ROOT'

/* --- Display hinge ---------------------------------------------------------
   After repair, DISPLAY_TILT_AXLE (which lives in REAR_CHASSIS_RIG) sits exactly
   along the top edge of the repaired display panel. That gives us a real hinge
   to rotate about rather than a guessed one.
   ------------------------------------------------------------------------ */

export const DISPLAY_HINGE = new THREE.Vector3(0.014, 0.031, -0.021)

/** Maximum tilt of the rear screen, in radians. Swings the bottom edge back. */
export const DISPLAY_TILT_MAX = 0.92

/**
 * Reparents DISPLAY_RIG under a pivot at the hinge so it can be rotated about
 * the real axle. Returns the pivot.
 */
export function buildDisplayPivot(root, displayRig) {
  const pivot = new THREE.Group()
  pivot.name = 'DISPLAY_PIVOT'
  pivot.position.copy(DISPLAY_HINGE)
  root.add(pivot)

  displayRig.position.sub(DISPLAY_HINGE)
  pivot.add(displayRig)
  return pivot
}

/* --- Exploded architecture -------------------------------------------------
   The reference exploded photograph fans the camera along its optical axis, so
   the explode does the same: every rig slides along Z by a signed multiple of
   `unit`, with small lateral offsets for the parts that would otherwise overlap
   in silhouette (the grip, the doors, the finder).

   Offsets are in metres at explode = 1. Order runs front (lens hood) to back
   (rear display) so the fan reads left to right at the section's camera angle.
   ------------------------------------------------------------------------ */

export const EXPLODE_OFFSETS = {
  // Lens sub-assemblies fan forward, spaced by optical order.
  FRONT_HOUSING_RIG: [0, 0, 0.30],
  OPTICAL_CELL_01_RIG: [0, 0, 0.26],
  OPTICAL_CELL_02_RIG: [0, 0, 0.235],
  OPTICAL_CELL_03_RIG: [0, 0, 0.21],
  FOCUS_RING_RIG: [0, 0.055, 0.20],
  OPTICAL_CELL_04_RIG: [0, 0, 0.185],
  IRIS_MECHANISM_RIG: [0, 0, 0.16],
  OPTICAL_CELL_05_RIG: [0, 0, 0.14],
  ZOOM_RING_RIG: [0, 0.055, 0.13],
  OPTICAL_CELL_06_RIG: [0, 0, 0.12],
  OPTICAL_CELL_07_RIG: [0, 0, 0.10],
  MAIN_BARREL_RIG: [0, -0.055, 0.095],
  OPTICAL_CELL_08_RIG: [0, 0, 0.08],
  OPTICAL_CELL_09_RIG: [0, 0, 0.062],
  APERTURE_RING_RIG: [0, 0.055, 0.055],
  OPTICAL_CELL_10_RIG: [0, 0, 0.044],
  REAR_BARREL_RIG: [0, -0.055, 0.036],
  LENS_MOUNT_RIG: [0, 0, 0.026],

  // Body, back from the mount.
  BODY_MOUNT_RIG: [0, 0, 0.006],
  FRONT_CHASSIS_RIG: [0, 0, -0.012],
  SENSOR_RIG: [0, 0, -0.030],
  SHUTTER_RIG: [0, 0.062, -0.036],
  BODY_SHELL_RIG: [0, 0, -0.052],
  CONTROL_DIAL_01_RIG: [0, 0.058, -0.058],
  CONTROL_DIAL_02_RIG: [0, 0.058, -0.062],
  CONTROL_DIAL_03_RIG: [0, 0.058, -0.054],
  GRIP_RIG: [-0.062, -0.03, -0.052],
  BATTERY_DOOR_RIG: [-0.062, -0.075, -0.052],
  BATTERY_RIG: [-0.062, -0.052, -0.052],
  IO_DOOR_RIG: [0.058, 0, -0.052],
  VIEWFINDER_RIG: [0, 0.056, -0.086],
  REAR_CHASSIS_RIG: [0, 0, -0.082],
  DISPLAY_RIG: [0, -0.028, -0.104],
}

/* --- Material grading ------------------------------------------------------
   The GLB's materials are named descriptively and are already sensible, but
   they are authored for an offline renderer. These overrides push them toward
   what reads well under a real-time studio: tighter roughness on machined
   metal, anisotropy on the turned rings, iridescence on coated glass.
   Keyed by a substring of the material name.
   ------------------------------------------------------------------------ */

export const MATERIAL_GRADE = [
  {
    match: 'Optics',
    apply: {
      roughness: 0.02,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      // Multilayer coatings are literally thin-film interference.
      iridescence: 1,
      iridescenceIOR: 1.38,
      iridescenceThicknessRange: [180, 520],
      envMapIntensity: 2.4,
      transmission: 0.82,
      thickness: 0.006,
      attenuationDistance: 0.09,
      attenuationColor: '#cfe4da',
      transparent: true,
    },
    /** Transmission needs a scene render per frame; drop it on weak hardware. */
    lowPower: { transmission: 0, opacity: 0.62, envMapIntensity: 1.9 },
  },
  {
    match: 'Mount | brushed',
    apply: {
      roughness: 0.28,
      metalness: 1,
      anisotropy: 0.75,
      anisotropyRotation: Math.PI / 2,
      envMapIntensity: 1.5,
    },
  },
  {
    match: 'Lens | milled control rings',
    apply: { roughness: 0.36, metalness: 0.9, anisotropy: 0.5, envMapIntensity: 1.15 },
  },
  {
    match: 'Graphite | machined edges',
    apply: { roughness: 0.24, metalness: 0.95, envMapIntensity: 1.35 },
  },
  {
    match: 'Graphite | satin',
    apply: { roughness: 0.42, metalness: 0.9, envMapIntensity: 1.05 },
  },
  {
    match: 'Lens | black anodized',
    apply: { roughness: 0.46, metalness: 0.82, envMapIntensity: 0.95 },
  },
  {
    match: 'Contacts | gold',
    apply: { roughness: 0.2, metalness: 1, envMapIntensity: 1.9 },
  },
  {
    match: 'Grip |',
    apply: { roughness: 0.86, metalness: 0, envMapIntensity: 0.5 },
  },
  {
    match: 'Interior | flocked',
    apply: { roughness: 0.96, metalness: 0, envMapIntensity: 0.12 },
  },
  {
    match: 'Display | inactive',
    apply: { roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6 },
  },
  {
    match: 'Sensor | silicon',
    apply: {
      roughness: 0.13,
      metalness: 0.7,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 1,
      iridescenceIOR: 1.9,
      iridescenceThicknessRange: [260, 780],
      envMapIntensity: 2.0,
    },
  },
  {
    match: 'Alignment |',
    apply: { roughness: 0.34, metalness: 0.1, envMapIntensity: 0.8 },
  },
  {
    match: 'Iris |',
    apply: { roughness: 0.38, metalness: 0.85, envMapIntensity: 0.9 },
  },
]

/** Nodes whose material is swapped when the buyer picks a finish. */
export const FINISH_TARGETS = [
  'TOP_DECK',
  'CONTROL_DIAL_01',
  'CONTROL_DIAL_01_TOP',
  'CONTROL_DIAL_02',
  'CONTROL_DIAL_02_TOP',
  'CONTROL_DIAL_03',
  'CONTROL_DIAL_03_TOP',
  'SHUTTER_COLLAR',
  'STRAP_LUG_72.5',
  'STRAP_LUG_-72.5',
]
