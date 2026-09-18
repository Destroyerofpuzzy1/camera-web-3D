/* =============================================================================
   BUILD STEP — editorial plates
   -----------------------------------------------------------------------------
   Run:  npm run plates

   Turns the raw Higgsfield renders in assets/plates-raw/ into the web assets the
   page actually loads. Each plate is graded so the five read as one campaign and
   written as WebP into public/plates/.

   The masters live outside public/ on purpose: anything in public/ is copied
   into the bundle verbatim, and the five PNGs are 7 MB between them.

   The grade matters more than it sounds: the renders came back on slightly
   different lighting setups, and the top-deck plate in particular arrived with
   a cool blue cast that read as a different shoot. Normalising the temperature
   is what makes the four gallery spreads and the sensor plate look like frames
   from one session rather than five separate images.

   ========================================================================== */

import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(HERE, '../assets/plates-raw')
const OUT = resolve(HERE, '../public/plates')

await mkdir(OUT, { recursive: true })

/** Long edge of the delivered asset. The largest slot it fills is ~740px wide
 *  at a 2x device pixel ratio, so 1600 covers it with margin to crop into. */
const WIDTH = 1600

const PLATES = [
  {
    from: 'raw-1-viewfinder.png',
    to: 'plate-viewfinder.webp',
    grade: {},
  },
  {
    from: 'raw-2-mount.png',
    to: 'plate-mount.webp',
    grade: {},
  },
  {
    from: 'raw-3-grip.png',
    to: 'plate-grip.webp',
    grade: {},
  },
  {
    from: 'raw-4-sensor.png',
    to: 'plate-sensor.webp',
    // Came back a touch flat; a little more contrast separates the mount ring
    // from the body without crushing the blacks.
    grade: { linear: [1.06, -6] },
  },
  {
    from: 'raw-5-deck.png',
    to: 'plate-deck.webp',
    // Arrived markedly cooler than the other four. Pull the blue channel back
    // and lift red slightly so it sits in the same session.
    grade: { tint: { r: 1.06, g: 1.0, b: 0.88 }, saturation: 0.82 },
  },
]

for (const plate of PLATES) {
  let pipe = sharp(resolve(SRC, plate.from)).resize({
    width: WIDTH,
    withoutEnlargement: true,
  })

  const { tint, saturation, linear } = plate.grade
  if (tint) {
    // Per-channel multiply, done in linear light so the blacks do not shift.
    pipe = pipe.linear([tint.r, tint.g, tint.b], [0, 0, 0])
  }
  if (saturation != null) pipe = pipe.modulate({ saturation })
  if (linear) pipe = pipe.linear(linear[0], linear[1])

  const info = await pipe.webp({ quality: 82, effort: 6 }).toFile(resolve(OUT, plate.to))
  console.log(
    '%s  %s x %s  %s kB',
    plate.to.padEnd(24),
    info.width,
    info.height,
    Math.round(info.size / 1024)
  )
}
