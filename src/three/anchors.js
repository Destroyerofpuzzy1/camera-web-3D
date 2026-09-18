/* =============================================================================
   ANCHORS
   -----------------------------------------------------------------------------
   Points on the instrument that the 2D overlay can draw to. An invisible marker
   is parented into the relevant rig, so an anchor keeps tracking its part
   through explode, lens detach, display tilt and spin without any extra maths.

   Scene projects them once per frame into `anchorScreen`, in CSS pixels. DOM
   components read that object from their own rAF loop; it is never React state.
   ========================================================================== */

import { COPY } from '../data/product.js'

/** id -> { x, y, z, on }. Mutated in place every frame by Scene. */
export const anchorScreen = {}

/**
 * `at` is a point in model space, or the string 'centroid' to use the rig's
 * own bounding-box centre (used by the exploded diagram, where every part
 * needs a label and hand-picking twenty points would be busywork).
 */
export const ANCHOR_SPECS = [
  /* Silhouette callouts, in the order the section reveals them. */
  { id: 'shell', rig: 'BODY_SHELL_RIG', at: [-0.058, 0.031, 0.015] },
  { id: 'dials', rig: 'CONTROL_DIAL_01_RIG', at: [-0.038, 0.048, -0.007] },
  { id: 'mount', rig: 'BODY_MOUNT_RIG', at: [0.01, 0.004, 0.024] },
  { id: 'display', rig: 'DISPLAY_RIG', at: [0.014, -0.018, -0.025] },
  { id: 'grip', rig: 'GRIP_RIG', at: [-0.056, -0.004, 0.026] },

  /* Optics and sensor. */
  { id: 'glass', rig: 'FRONT_HOUSING_RIG', at: [0.01, 0.004, 0.1452] },
  { id: 'focus', rig: 'FOCUS_RING_RIG', at: [0.01, 0.043, 0.102] },
  { id: 'iris', rig: 'IRIS_MECHANISM_RIG', at: [0.01, 0.004, 0.096] },
  { id: 'sensor', rig: 'SENSOR_RIG', at: [0.01, 0.004, 0.0095] },

  /* Handling. */
  { id: 'shutter', rig: 'SHUTTER_RIG', at: [-0.042, 0.0435, 0.0105] },
  { id: 'wheel', rig: 'REAR_CHASSIS_RIG', at: [0.046, -0.008, -0.023] },
  { id: 'finder', rig: 'VIEWFINDER_RIG', at: [0.012, 0.058, -0.016] },

  /* One per exploded layer, keyed 'x:<rig>' so the section can look them up. */
  ...COPY.exploded.layers.map((layer) => ({
    id: 'x:' + layer.rig,
    rig: layer.rig,
    at: 'centroid',
  })),
]

/** Reads an anchor without risking undefined at first paint. */
export function readAnchor(id) {
  return anchorScreen[id] || { x: 0, y: 0, z: 0, on: false }
}
