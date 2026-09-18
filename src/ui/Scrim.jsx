/* =============================================================================
   SCRIM
   -----------------------------------------------------------------------------
   A directional falloff on the side of the frame that carries type. It sits
   between the canvas and the copy, so the instrument reads as lit from the
   opposite side rather than as an object with text dumped on top of it.

   This is doing real work: with an object this large in frame, the type side of
   every sticky chapter needs to fall to near-black (or near-paper) or nothing
   is readable. Keeping it a gradient rather than a panel means the object still
   shows through, dimmed, the way a flag works on a real set.
   ========================================================================== */

const ANGLE = { left: '90deg', right: '270deg', bottom: '0deg', top: '180deg' }

export default function Scrim({ side = 'left', tone = 'ink', reach = 62, strength = 0.94 }) {
  const base = tone === 'paper' ? '231, 232, 229' : '8, 9, 11'
  const angle = ANGLE[side] ?? ANGLE.left

  return (
    <div
      className="scrim-side"
      aria-hidden="true"
      style={{
        background: `linear-gradient(${angle},
          rgba(${base}, ${strength}) 0%,
          rgba(${base}, ${strength * 0.92}) ${reach * 0.34}%,
          rgba(${base}, ${strength * 0.55}) ${reach * 0.68}%,
          rgba(${base}, 0) ${reach}%)`,
      }}
    />
  )
}
