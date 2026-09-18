/* =============================================================================
   BUILD STEP — repair camera_master.glb
   -----------------------------------------------------------------------------
   Run:  npm run model

   Reads  assets/camera_master.glb             the file as supplied
   Writes assets/camera_master.repaired.glb    intermediate, not served
   Then   public/models/camera-01.glb          compressed; what the page loads

   Source art lives in assets/ rather than public/ so the 7.6 MB original and
   the reference photography never reach the bundle.

   ---------------------------------------------------------------------------
   WHY THIS EXISTS

   The supplied camera_master.glb does not assemble. Loaded as-is you get a body
   with its grip, all three command dials, the battery, the shutter release and
   the entire 123 mm lens barrel collapsed onto the world origin, the finder
   sunk into the middle of the body, and the rear screen hanging below the base
   plate.

   The cause is two mixed node conventions:

     Type A  geometry is local (bounding box centred on the node origin) and the
             node's translation carries the real placement. Internally correct.
     Type B  geometry is baked in world space AND the node carries a translation
             that drags it somewhere else. The rig parent that should have
             cancelled that translation was exported with an identity transform,
             so the part collapses toward the origin.

   The conventions are consistent *within* each rig, so every rig can be put
   back by translating the rig group as a whole. Reading the Type B translation
   (Tb) off any world-baked descendant gives the correction directly:

       correction = REFERENCE_TB - Tb

   REFERENCE_TB is the Tb of BODY_SHELL_RIG, the one rig that was exported
   correctly and therefore defines the frame everything else has to join.

   Four rigs contain no world-baked geometry at all, so their placement is not
   recoverable from the file; those are set by hand against the reference
   photographs and marked MANUAL below.

   ---------------------------------------------------------------------------
   WHY OFFLINE RATHER THAN AT RUNTIME

   Because the repair reads geometry bounding boxes against node translations,
   it only works on the uncompressed file. Mesh quantisation (which takes the
   asset from 7.6 MB to 1.7 MB) rewrites every node transform and re-centres
   every bounding box, which erases exactly the signal the repair depends on.

   So: repair first, compress second, and ship a model that is simply correct.
   The runtime then does no geometry surgery at all.

   Verified output: a 153 x 100 x 60 mm body carrying a 123 mm barrel whose ten
   optical cells, iris, zoom ring, focus ring and hood all sit on one optical
   axis with the bayonet and the sensor, at x = +0.010, y = +0.004.
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const IN = resolve(HERE, '../assets/camera_master.glb')
const OUT = resolve(HERE, '../assets/camera_master.repaired.glb')

/** The frame BODY_SHELL_RIG was exported in. Everything joins this. */
const REFERENCE_TB = [0, -0.039, 0]

/** A geometry centre further than this from its node origin is world-baked. */
const BAKED_EPSILON = 0.005

/** MANUAL: rigs with no world-baked geometry, set against the photography. */
const MANUAL = {
  BATTERY_DOOR_RIG: [0, -0.0395, 0.008], // bottom hatch, in the base plate
  BATTERY_RIG: [-0.051, -0.0205, 0.007], // cell stack in the grip cavity
  IO_DOOR_RIG: [0.0045, -0.0255, 0], //     port door on the right flank
  SHUTTER_RIG: [-0.042, 0.0405, 0.0105], // release on the top deck
}

/** IRIS_MECHANISM_RIG mixes origin-modelled blades with a baked housing, so
 *  the automatic read finds two candidates. Pin the housing's. */
const FORCED_TB = { IRIS_MECHANISM_RIG: [-0.01, -0.043, -0.096] }

/* --- GLB container --------------------------------------------------------- */

function readGLB(path) {
  const buf = readFileSync(path)
  const total = buf.readUInt32LE(8)
  let off = 12
  let json = null
  let jsonRange = null
  const rest = []
  while (off < total) {
    const length = buf.readUInt32LE(off)
    const type = buf.readUInt32LE(off + 4)
    if (type === 0x4e4f534a) {
      json = JSON.parse(buf.subarray(off + 8, off + 8 + length).toString('utf8'))
      jsonRange = [off, off + 8 + length]
    } else {
      rest.push(buf.subarray(off, off + 8 + length))
    }
    off += 8 + length
  }
  if (!json) throw new Error('no JSON chunk in ' + path)
  return { json, rest, jsonRange }
}

function writeGLB(path, json, rest) {
  let text = Buffer.from(JSON.stringify(json), 'utf8')
  while (text.length % 4) text = Buffer.concat([text, Buffer.from(' ')])

  const head = Buffer.alloc(8)
  head.writeUInt32LE(text.length, 0)
  head.writeUInt32LE(0x4e4f534a, 4)

  const body = Buffer.concat([head, text, ...rest])
  const file = Buffer.alloc(12 + body.length)
  file.writeUInt32LE(0x46546c67, 0)
  file.writeUInt32LE(2, 4)
  file.writeUInt32LE(file.length, 8)
  body.copy(file, 12)
  writeFileSync(path, file)
  return file.length
}

/* --- Repair ---------------------------------------------------------------- */

const { json, rest } = readGLB(IN)
const nodes = json.nodes
const byName = new Map(nodes.map((n, i) => [n.name, i]))

const geomCentre = (nodeIndex) => {
  const node = nodes[nodeIndex]
  if (node.mesh == null) return null
  const accessor = json.accessors[json.meshes[node.mesh].primitives[0].attributes.POSITION]
  return accessor.min.map((v, i) => (v + accessor.max[i]) / 2)
}

/** Accumulated translation from `rig` down to the first world-baked mesh. */
function readBakedTranslation(rigIndex) {
  const forced = FORCED_TB[nodes[rigIndex].name]
  if (forced) return forced

  let found = null
  const walk = (index, acc) => {
    if (found) return
    const node = nodes[index]
    const t = node.translation ?? [0, 0, 0]
    const next = [acc[0] + t[0], acc[1] + t[1], acc[2] + t[2]]
    const centre = geomCentre(index)
    if (centre && Math.hypot(...centre) > BAKED_EPSILON) {
      found = next
      return
    }
    for (const child of node.children ?? []) walk(child, next)
  }
  walk(rigIndex, [0, 0, 0])
  return found
}

function correctRig(rigIndex) {
  const node = nodes[rigIndex]
  const manual = MANUAL[node.name]
  const correction = manual
    ? manual
    : (() => {
        const tb = readBakedTranslation(rigIndex)
        return tb ? REFERENCE_TB.map((v, i) => v - tb[i]) : null
      })()

  if (!correction) return null

  const t = node.translation ?? [0, 0, 0]
  node.translation = t.map((v, i) => v + correction[i])
  return { rig: node.name, source: manual ? 'manual' : 'derived', correction }
}

const root = nodes[byName.get('CAMERA_ROOT')]
const report = []

for (const rigIndex of root.children) {
  if (nodes[rigIndex].name === 'LENS_ROOT') continue // handled one level deeper
  const entry = correctRig(rigIndex)
  if (entry) report.push(entry)
}

// The lens is a rig of rigs: each barrel section carries its own Tb, and that
// is what spreads the ten optical cells back along the 123 mm barrel.
const lens = nodes[byName.get('LENS_ROOT')]
for (const subIndex of lens.children) {
  const entry = correctRig(subIndex)
  if (entry) report.push(entry)
}

/* --- Strip what the page does not use -------------------------------------- */

// The GLB ships an unlit backdrop plane and three empty reference nodes. The
// page provides its own backdrop in the DOM.
const drop = new Set(['STUDIO_CYCLORAMA'])
for (const [name, index] of byName) if (name.startsWith('REF_')) drop.add(name, index)

const scene = json.scenes[json.scene ?? 0]
scene.nodes = scene.nodes.filter((i) => !drop.has(nodes[i].name))

json.asset.extras = { ...(json.asset.extras ?? {}), frameRepaired: true }

/* --- Verify ---------------------------------------------------------------- */

/** World bounding box of a rig after correction, for the sanity check below. */
function worldBox(rigIndex) {
  const box = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }
  const walk = (index, acc) => {
    const node = nodes[index]
    const t = node.translation ?? [0, 0, 0]
    const next = [acc[0] + t[0], acc[1] + t[1], acc[2] + t[2]]
    if (node.mesh != null) {
      const a = json.accessors[json.meshes[node.mesh].primitives[0].attributes.POSITION]
      for (let k = 0; k < 3; k++) {
        box.min[k] = Math.min(box.min[k], a.min[k] + next[k])
        box.max[k] = Math.max(box.max[k], a.max[k] + next[k])
      }
    }
    for (const child of node.children ?? []) walk(child, next)
  }
  walk(rigIndex, [0, 0, 0])
  return box
}

const r3 = (v) => v.map((x) => +x.toFixed(4))
const checks = []
for (const name of ['BODY_SHELL_RIG', 'LENS_ROOT', 'SENSOR_RIG', 'BODY_MOUNT_RIG', 'GRIP_RIG']) {
  const box = worldBox(byName.get(name))
  checks.push(`${name.padEnd(16)} ${JSON.stringify(r3(box.min))} -> ${JSON.stringify(r3(box.max))}`)
}

const whole = worldBox(byName.get('CAMERA_ROOT'))
const size = whole.max.map((v, i) => v - whole.min[i])

console.log('Corrections applied: %d', report.length)
for (const entry of report) {
  console.log('  %s %s %j', entry.rig.padEnd(22), entry.source.padEnd(8), r3(entry.correction))
}
console.log('\nAssembled extents:')
for (const line of checks) console.log('  ' + line)
console.log('\n  WHOLE            %j  size %j', r3(whole.min), r3(size))

// A correctly assembled instrument measures 153 mm across the body, 101 mm from
// the base plate to the top of the finder, and 176 mm from the back of the
// eyecup to the front of the hood. Fail loudly if the repair drifts off that.
const expected = [0.153, 0.101, 0.176]
const off = size.map((v, i) => Math.abs(v - expected[i]))
if (off.some((v) => v > 0.006)) {
  console.error('\nFAILED: assembled size %j is not within 6 mm of %j', r3(size), expected)
  process.exit(1)
}

const bytes = writeGLB(OUT, json, rest)
console.log('\nWrote %s (%s MB)', OUT, (bytes / 1e6).toFixed(2))
