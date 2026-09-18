# FRAME / 01

A scroll-driven product page for a fictional full-frame camera. The 3D model is
the page, not an illustration on it: a fixed transparent WebGL canvas sits behind
the document, and every chapter composes type against the instrument by moving
the camera rather than by moving the object.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build
npm run preview

npm run model    # rebuild the 3D asset from the supplied GLB (see below)
npm run plates   # rebuild the editorial stills from their raw renders
```

---

## Read this first: the model was broken

`camera_master.glb` as supplied **does not assemble**. Loaded straight into
three.js you get a body with its grip, all three command dials, the battery, the
shutter release and the entire 123 mm lens barrel collapsed onto the world
origin, the finder sunk into the middle of the body, and the rear screen hanging
below the base plate.

The cause is two mixed node conventions in the export. Roughly half the nodes
carry local geometry and a correct translation; the other half carry geometry
baked in world space *plus* a translation that drags them somewhere else,
because the rig parent that should have cancelled it was exported with an
identity transform.

The conventions are consistent within each rig, so each rig can be put back by
translating the group as a whole. `scripts/repair-model.mjs` derives those
corrections from the file itself, hand-places the four rigs whose geometry
carries no recoverable signal, verifies the assembled extents, and writes a
corrected asset. **That script carries the full forensics — read it before
touching the model.**

```bash
node scripts/repair-model.mjs
npx gltf-transform meshopt \
  public/models/camera_master.repaired.glb \
  public/models/camera-01.glb --level medium
```

The repair has to happen *before* compression: mesh quantisation rewrites every
node transform and re-centres every bounding box, which erases exactly the signal
the repair reads. Runtime does no geometry surgery at all — it loads a model that
is simply correct.

`camera-01.glb` is the shipped asset: **1.7 MB**, down from 7.6 MB.

### What the repaired model gives us

34 separable rigs, which is why the page can do things that are usually faked:

| Behaviour | How real it is |
| --- | --- |
| Exploded architecture | Genuine. Every rig is a separate node; the fan in §04 moves real parts. |
| Lens detach (§03) | Genuine. `LENS_ROOT` is its own rig and slides off the bayonet along the optical axis. |
| Tilting display (§05) | Genuine. `DISPLAY_TILT_AXLE` sits exactly along the top edge of the repaired panel, so the screen rotates about the real hinge. |
| Finish swap | Genuine. Choosing Silver replaces the material on the top deck, the three dials, the shutter collar and the strap lugs. |

Assembled extents, asserted by the build script: 153 × 101 × 176 mm, with the ten
optical cells, the iris, both rings, the bayonet and the sensor all on one
optical axis at x = +0.010, y = +0.004.

---

## Where to change things

| I want to change… | Open |
| --- | --- |
| Any camera move, or the pacing of a chapter | `src/data/chapters.js` |
| Any headline, spec, price or product option | `src/data/product.js` |
| Which still fills a gate window | `src/data/product.js` → the `plate` on that section |
| How a still is graded | `scripts/build-plates.mjs`, then `npm run plates` |
| How far a part travels when the instrument explodes | `src/three/rigRepair.js` → `EXPLODE_OFFSETS` |
| How a material reads | `src/three/rigRepair.js` → `MATERIAL_GRADE` |
| The lighting, or the dark → bright crossfade | `src/three/Studio.jsx` → `MOODS` |
| Colour, type scale, spacing, easing curves | `src/styles/tokens.css` |
| How heavy the camera rig feels | `src/three/Scene.jsx` → `DAMPING` |

### The choreography

`data/chapters.js` is the single source of truth for motion. Each keyframe is
anchored to a section id and a 0–1 position *within* that section, so changing a
section's `length` retunes pacing without touching a single camera number.

```js
{
  at: ['lens', 0.62],                     // section, progress within it
  pos: [0.132, 0.036, 0.442],             // camera position, metres
  target: [0.010, 0.004, 0.134],          // look-at
  fov: 26,
  frame: [0.26, 0],                       // where the target lands in NDC
  explode: 0, detach: 0, tilt: 0,         // model state
  light: 0,                               // 0 dark studio, 1 bright
}
```

`frame` is the piece that makes the hybrid layout work. Translating the camera
perpendicular to its own view axis slides the subject across the screen without
rotating it, so a column of type can sit beside the object with no cut and no
second render. `[-0.34, 0]` puts the instrument in the left third; `[0.42, 0]`
centres it inside a film gate on the right.

`light` drives the three.js lights **and** the DOM backdrop on the same curve, so
the page and the object change mood together rather than crossfading against
each other.

---

## Architecture

```
src/
  data/
    chapters.js     choreography: keyframes, section lengths, chapter index
    product.js      all copy, specs, finishes, kits, prices
  lib/
    timeline.js     resolves keyframe anchors against the live DOM, samples them
    scroll.js       Lenis, plus `scrollState` — the mutable handoff to the 3D loop
    ticker.js       one rAF loop shared by every DOM element that follows the scene
    math.js         damping and the four easing curves the whole page moves on
    useStore.js     zustand: chapter, preferences, configurator, cart
    useReveal.js    one IntersectionObserver for the page
  three/
    Stage.jsx       the fixed transparent canvas
    Scene.jsx       the only per-frame code: sample, damp, place, project
    Studio.jsx      lights and the reflection set
    useCameraModel.js  load, grade materials, build the display pivot
    rigRepair.js    explode offsets, hinge, material grade, finish targets
    anchors.js      points on the instrument the 2D overlay draws to
  ui/
    Instrument.jsx  the graticule overlay
    Gate.jsx        the film gate that crops 3D into the layout
    Callout.jsx     labels pinned to parts of the model
    Scrim.jsx       directional falloff on the type side of a chapter
    Chrome.jsx      nav, loader, buy bar, cart drawer, footer
  sections/         one component per chapter
```

**No per-frame value goes through React.** Scroll position lives in
`lib/scroll.js` as plain mutable state; projected anchor positions live in
`three/anchors.js` the same way. React re-renders only when the *chapter* or the
*beat* changes, which is a handful of times per section.

### The design system

Three typefaces, three jobs. **Bodoni Moda** for statements, chosen because its
hairlines rhyme with the linework the page is built from. **Archivo** for body
copy. **Inter Tight** for everything that is interface: navigation, labels, spec
columns, captions, commerce, the exposure read-out. It is set at 500 weight with
around 0.1em of tracking, which is what makes 10px uppercase read as deliberate
rather than thin.

Copy is written with ordinary spaces; `bind()` in `data/product.js` walks every
exported string once at load and glues figures to their units and thousands to
their separators with non-breaking spaces, so "658 g" and "25 600" cannot break
across a line.

The palette is a graphite value ladder. The only chromatic accent is the
vermilion sampled from the camera's own mount alignment dot, so the page and the
object share one accent; lens-coating green, cyan and violet are reserved for
glass and optical graphics.

The signature element is the **instrument overlay**: corner crop marks, a live
exposure read-out and a chapter index, so the site is read the way you read
through a finder. The **film gate** is its structural counterpart: four mattes
that crop a hard-edged window out of the page.

A gate window holds one of two things. Left empty it crops the live 3D canvas,
which is what the body, optics, construction, handling and close chapters use.
Given `plates` it holds editorial stills instead, which is what the sensor
chapter and the four feature spreads use. The geometry, the crop, the hairline
frame and the corner ticks are identical either way, so a section can change its
visual source without the layout knowing.

---

## The editorial plates

Five chapters are better served by a still than by a scrubbed 3D crop: they need
close product angles that hold their framing at every viewport, which a camera
bound to scroll position does not. Those are the four feature spreads and the
sensor chapter.

The stills were generated with Higgsfield from one shared product and studio
description, so they read as frames from a single session rather than five
separate images. Raw renders live in `public/plates/raw-*.png` as masters and are
kept out of the bundle; `npm run plates` resizes, grades and writes the WebP
files the page actually loads (five files, about 350 kB in total).

The grade in `scripts/build-plates.mjs` is doing real work. The renders came back
on slightly different lighting setups and the top-deck plate in particular
arrived markedly cooler than the rest; normalising temperature and contrast is
what makes the set look like one campaign.

The live 3D still runs behind those mattes, and the lens still detaches in the
sensor chapter, so the transitions either side of each plate stay continuous.

---

## Performance and access

- 1.7 MB model, meshopt-compressed, preloaded from `<head>`.
- Five editorial stills, about 350 kB of WebP, lazily loaded.
- Transparent canvas: backdrop, vignette and grain are DOM, which keeps them out
  of the GPU budget and lets the gates composite against them.
- Grain is a generated SVG data URI. No external assets are fetched at all.
- A capability probe (`useQualityProbe`) drops transmissive glass, the grain
  layer and the pixel-ratio cap on weak or touch devices.
- Measured 139 fps median through the exploded chapter at 1440 × 900 — the
  heaviest frame on the page, with all 34 rigs animating.
- Below 1000 px the side-by-side compositions stack: the instrument lifts into
  the upper third, gates re-crop to landscape, and copy takes the floor.
- `prefers-reduced-motion` is honoured on load and can be overridden either way
  from the nav. It stops the smooth scroller, the grain drift, the idle float and
  every reveal, and snaps the camera instead of damping it.
- Keyboard focus is visible throughout; there is a skip link; the canvas is
  `aria-hidden` and every control is a real button.

---

## Notes

FRAME / 01 is a design exercise. The product does not exist, and the
specification figures are plausible fabrications for a 2026 flagship body.

The 3D is the supplied GLB throughout. The five editorial stills were generated
with Higgsfield; everything else is DOM typography, CSS gradients, and SVG drawn
from the reference photography.
