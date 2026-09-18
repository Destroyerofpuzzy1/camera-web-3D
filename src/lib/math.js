/* Small math helpers shared by the scene and the timeline. */

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)

export const lerp = (a, b, t) => a + (b - a) * t

export const invLerp = (a, b, v) => (b - a === 0 ? 0 : (v - a) / (b - a))

/**
 * Frame-rate independent exponential damping.
 * `lambda` is roughly "how many e-foldings per second"; 6-10 reads as a heavy,
 * well-damped camera crane, which is the feel we want.
 */
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

/* --- Easing --------------------------------------------------------------
   Deliberately few curves. Everything on this page moves on one of four, which
   is most of what makes a motion system read as a system.
   ---------------------------------------------------------------------- */

const EASINGS = {
  linear: (t) => t,
  /** Expo out. The house curve: fast departure, very long settle. */
  out: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  /** Cubic in-out. For moves that both start and stop on screen. */
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  /** Gentle. For light and opacity, where an expo curve reads as a flicker. */
  soft: (t) => 1 - Math.pow(1 - t, 3),
}

export const ease = (name, t) => (EASINGS[name] || EASINGS.inOut)(clamp(t))
