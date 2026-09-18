/* =============================================================================
   SCENE
   -----------------------------------------------------------------------------
   The only place that runs per frame. Each tick it:

     1. samples the choreography at the current scroll position
     2. damps toward that sample, so the rig always reads as a heavy crane
        rather than a value bound directly to the scroll wheel
     3. places the camera, including the in-frame offset that lets the 2D
        column and the 3D object share the screen
     4. applies model state: spin, explode, lens detach, display tilt
     5. projects the anchor markers to screen pixels for the DOM overlay

   No React state is written here.
   ========================================================================== */

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { createSample, sample as sampleTimeline } from '../lib/timeline.js'
import { scrollState } from '../lib/scroll.js'
import { useStore } from '../lib/useStore.js'
import { FINISHES } from '../data/product.js'
import { clamp, damp, lerp } from '../lib/math.js'
import { anchorScreen, ANCHOR_SPECS } from './anchors.js'
import { DISPLAY_TILT_MAX } from './rigRepair.js'
import { useCameraModel } from './useCameraModel.js'
import Studio from './Studio.jsx'

const DEG = Math.PI / 180
const WORLD_UP = new THREE.Vector3(0, 1, 0)
/** The aspect the choreography is composed for. */
const REFERENCE_ASPECT = 1.7
/** Below this, the layout stacks and the object moves out of the copy's way. */
const PORTRAIT_ASPECT = 1.05
/** Where the subject sits in NDC on a stacked layout: upper third. */
const PORTRAIT_LIFT = 0.44

/** How hard the rig resists the scroll wheel. Higher is tighter. */
const DAMPING = {
  position: 5.2,
  target: 6.0,
  fov: 5.0,
  model: 6.5,
  light: 3.2,
}

export default function Scene({ lowPower, onReady }) {
  const model = useCameraModel(lowPower)
  const studio = useRef()
  const spinGroup = useRef()
  const { camera, scene, size } = useThree()

  /* --- Scratch objects, allocated once ---------------------------------- */
  const S = useMemo(() => createSample(), [])
  const cur = useMemo(
    () => ({
      pos: new THREE.Vector3(0.255, 0.112, 0.402),
      target: new THREE.Vector3(0.006, 0.004, 0.052),
      frame: new THREE.Vector2(0, 0),
      fov: 30,
      spin: 0,
      explode: 0,
      detach: 0,
      tilt: 0,
      light: 0,
    }),
    []
  )
  const tmp = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      target: new THREE.Vector3(),
      world: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      offset: new THREE.Vector3(),
    }),
    []
  )
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  /* --- Anchors: invisible markers the DOM overlay draws leaders to ------- */
  const anchors = useMemo(() => {
    const made = []
    const point = new THREE.Vector3()
    const box = new THREE.Box3()
    model.root.updateMatrixWorld(true)

    for (const spec of ANCHOR_SPECS) {
      const parent = spec.rig ? model.rigs[spec.rig] : model.root
      if (!parent) continue

      if (spec.at === 'centroid') box.setFromObject(parent).getCenter(point)
      else point.set(...spec.at)

      const marker = new THREE.Object3D()
      marker.name = 'ANCHOR_' + spec.id
      // Points are authored in model space. Converting through the parent's
      // own matrix keeps this correct even for the display, which hangs off a
      // hinge pivot rather than directly off the root.
      parent.worldToLocal(marker.position.copy(point))
      parent.add(marker)
      made.push({ id: spec.id, marker })
    }
    return made
  }, [model])

  /* --- Pointer parallax --------------------------------------------------- */
  useEffect(() => {
    if (lowPower) return undefined
    const onMove = (e) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [lowPower])

  useEffect(() => {
    onReady?.()
  }, [onReady])

  /* --- Finish: a real material swap on the deck and the dials ------------- */
  const finish = useStore((s) => s.finish)
  useEffect(() => {
    const spec = FINISHES.find((f) => f.id === finish)
    if (!spec) return
    for (const node of model.finishParts) {
      node.material.color.set(spec.deck.color)
      node.material.metalness = spec.deck.metalness
      node.material.roughness = spec.deck.roughness
      node.material.needsUpdate = true
    }
  }, [finish, model])

  useFrame((state, rawDelta) => {
    // Clamp delta so a dropped frame or a backgrounded tab cannot fling the rig.
    const dt = Math.min(rawDelta, 1 / 30)
    const reduced = document.documentElement.dataset.motion === 'reduced'
    const k = reduced ? 1 : 0

    sampleTimeline(scrollState.y, S)

    /* -- 1. Damp toward the sample ------------------------------------- */
    const snap = (lambda) => (reduced ? 40 : lambda)
    cur.pos.x = damp(cur.pos.x, S.pos[0], snap(DAMPING.position), dt)
    cur.pos.y = damp(cur.pos.y, S.pos[1], snap(DAMPING.position), dt)
    cur.pos.z = damp(cur.pos.z, S.pos[2], snap(DAMPING.position), dt)
    cur.target.x = damp(cur.target.x, S.target[0], snap(DAMPING.target), dt)
    cur.target.y = damp(cur.target.y, S.target[1], snap(DAMPING.target), dt)
    cur.target.z = damp(cur.target.z, S.target[2], snap(DAMPING.target), dt)
    cur.frame.x = damp(cur.frame.x, S.frame[0], snap(DAMPING.target), dt)
    cur.frame.y = damp(cur.frame.y, S.frame[1], snap(DAMPING.target), dt)
    cur.fov = damp(cur.fov, S.fov, snap(DAMPING.fov), dt)
    cur.spin = damp(cur.spin, S.spin, snap(DAMPING.model), dt)
    cur.explode = damp(cur.explode, S.explode, snap(DAMPING.model), dt)
    cur.detach = damp(cur.detach, S.detach, snap(DAMPING.model), dt)
    cur.tilt = damp(cur.tilt, S.tilt, snap(DAMPING.model), dt)
    cur.light = damp(cur.light, S.light, snap(DAMPING.light), dt)

    /* -- 2. Model state -------------------------------------------------- */
    const t = state.clock.elapsedTime

    // Idle: a slow breath so the object never looks frozen. Tiny on purpose.
    const idleSpin = k ? 0 : Math.sin(t * 0.21) * 0.011
    const idleRise = k ? 0 : Math.sin(t * 0.17 + 1.1) * 0.0013

    if (spinGroup.current) {
      spinGroup.current.rotation.y = cur.spin + idleSpin
      spinGroup.current.position.y = idleRise
    }

    for (const item of model.explodeTargets) {
      item.object.position.copy(item.rest).addScaledVector(item.offset, cur.explode)
    }
    if (model.lens) {
      // Explode already moves the lens sub-rigs; detach moves the whole barrel.
      model.lens.position.copy(model.lensRest)
      model.lens.position.z += cur.detach
    }
    if (model.displayPivot) {
      model.displayPivot.rotation.x = cur.tilt * DISPLAY_TILT_MAX
    }

    /* -- 3. Camera ------------------------------------------------------- */
    // The model turns about its own centroid, so the authored target has to
    // turn with it to stay locked on the same physical feature.
    tmp.quat.setFromAxisAngle(WORLD_UP, cur.spin + idleSpin)
    tmp.target
      .copy(cur.target)
      .sub(model.pivot)
      .applyQuaternion(tmp.quat)
      .add(model.pivot)
    tmp.target.y += idleRise

    const aspect = size.width / Math.max(1, size.height)
    const portrait = aspect < PORTRAIT_ASPECT

    // Narrow viewports need a wider frame. Take most of it by moving the camera
    // back rather than opening the lens, so the product keeps the long-lens
    // compression it was composed with; widen the fov only a little.
    const fovV = Math.min(
      42,
      aspect >= REFERENCE_ASPECT
        ? cur.fov
        : 2 * Math.atan(Math.tan(cur.fov * 0.5 * DEG) * Math.sqrt(REFERENCE_ASPECT / aspect)) / DEG
    )
    const reach = clamp(REFERENCE_ASPECT / aspect, 1, 2.3)

    if (Math.abs(camera.fov - fovV) > 0.001 || camera.aspect !== aspect) {
      camera.fov = fovV
      camera.aspect = aspect
      camera.updateProjectionMatrix()
    }

    // Pull back along the authored view axis.
    tmp.offset.subVectors(cur.pos, tmp.target).multiplyScalar(reach)
    camera.position.copy(tmp.target).add(tmp.offset)
    camera.up.copy(WORLD_UP)
    camera.lookAt(tmp.target)

    // In-frame offset. Translating the camera perpendicular to its own view
    // axis slides the subject across the screen without rotating it, which is
    // what lets a column of type sit beside the object without a cut.
    const dist = tmp.offset.length()
    const halfH = Math.tan(fovV * 0.5 * DEG) * dist
    const halfW = halfH * aspect

    // Side-by-side framing collapses on portrait screens: the layout stacks, so
    // the object lifts into the upper third and the copy takes the floor.
    const frameScale = clamp((aspect - 0.62) / 0.72)
    const frameX = cur.frame.x * frameScale
    const frameY = portrait ? lerp(PORTRAIT_LIFT, cur.frame.y, frameScale) : cur.frame.y

    tmp.dir.subVectors(tmp.target, camera.position).normalize()
    tmp.right.crossVectors(tmp.dir, WORLD_UP).normalize()
    tmp.up.crossVectors(tmp.right, tmp.dir).normalize()

    camera.position
      .addScaledVector(tmp.right, -frameX * halfW)
      .addScaledVector(tmp.up, -frameY * halfH)

    // Pointer parallax: a shallow, heavily damped drift. Enough to feel alive,
    // never enough to fight the choreography.
    if (!reduced) {
      pointer.current.x = damp(pointer.current.x, pointer.current.tx, 2.4, dt)
      pointer.current.y = damp(pointer.current.y, pointer.current.ty, 2.4, dt)
      const amount = dist * 0.018
      camera.position
        .addScaledVector(tmp.right, pointer.current.x * amount)
        .addScaledVector(tmp.up, -pointer.current.y * amount * 0.6)
    }

    camera.updateMatrixWorld()

    /* -- 4. Lighting ----------------------------------------------------- */
    studio.current?.setMood(cur.light, scene)
    document.documentElement.style.setProperty('--stage-light', cur.light.toFixed(3))

    /* -- 5. Project anchors for the DOM overlay -------------------------- */
    for (const { id, marker } of anchors) {
      marker.getWorldPosition(tmp.world)
      const depth = tmp.world.distanceTo(camera.position)
      tmp.world.project(camera)
      const entry = anchorScreen[id] || (anchorScreen[id] = { x: 0, y: 0, on: false, z: 0 })
      entry.x = (tmp.world.x * 0.5 + 0.5) * size.width
      entry.y = (-tmp.world.y * 0.5 + 0.5) * size.height
      entry.z = depth
      entry.on =
        tmp.world.z < 1 &&
        tmp.world.x > -1.25 &&
        tmp.world.x < 1.25 &&
        tmp.world.y > -1.25 &&
        tmp.world.y < 1.25
    }
  })

  return (
    <>
      <Studio ref={studio} quality={lowPower ? 'low' : 'high'} />
      {/* Outer group holds the centroid; inner group counter-translates, so
          rotation.y on the outer group spins the instrument about itself. */}
      <group position={model.pivot}>
        <group ref={spinGroup}>
          <group position={model.pivot.clone().multiplyScalar(-1)}>
            <primitive object={model.root} />
          </group>
        </group>
      </group>
    </>
  )
}
