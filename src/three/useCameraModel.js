/* =============================================================================
   Loads the instrument, grades its materials for a real-time studio, and hands
   back the handles the choreography needs: the rigs, the display pivot, the
   explode rest positions and the centroid.

   Runs once. Everything after this is transform maths on cached objects.
   ========================================================================== */

import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import {
  buildDisplayPivot,
  EXPLODE_OFFSETS,
  EXPLODE_STAGES,
  FINISH_TARGETS,
  LENS_RIG,
  MATERIAL_GRADE,
} from './rigRepair.js'

/* Pre-assembled and mesh-quantised by scripts/repair-model.mjs, 1.7 MB. The
   raw camera_master.glb does not assemble; see that script for the forensics. */
const MODEL_URL = '/models/camera-01.glb'

useGLTF.preload(MODEL_URL)

/** Converts a standard material to physical so the grade can reach clearcoat,
 *  anisotropy and iridescence. Only 16 materials exist, so this is cheap. */
function toPhysical(material) {
  if (material.isMeshPhysicalMaterial) return material
  const next = new THREE.MeshPhysicalMaterial()
  THREE.Material.prototype.copy.call(next, material)
  next.color.copy(material.color)
  next.metalness = material.metalness ?? 1
  next.roughness = material.roughness ?? 0.5
  next.map = material.map ?? null
  next.normalMap = material.normalMap ?? null
  next.name = material.name
  return next
}

function applyGrade(material, lowPower) {
  const rule = MATERIAL_GRADE.find((r) => material.name?.includes(r.match))
  if (!rule) return material
  Object.assign(material, rule.apply)
  if (lowPower && rule.lowPower) Object.assign(material, rule.lowPower)
  material.needsUpdate = true
  return material
}

export function useCameraModel(lowPower) {
  const { scene } = useGLTF(MODEL_URL)

  return useMemo(() => {
    const root = scene.getObjectByName('CAMERA_ROOT')
    root.updateMatrixWorld(true)

    // Rig handles, one level deep for the body and two for the lens barrel.
    const rigs = {}
    for (const rig of root.children) {
      rigs[rig.name] = rig
      if (rig.name !== LENS_RIG) continue
      for (const sub of rig.children) rigs[sub.name] = sub
    }

    /* --- Materials ------------------------------------------------------- */
    const graded = new Map()
    root.traverse((node) => {
      if (!node.isMesh) return
      node.frustumCulled = true
      node.castShadow = false
      node.receiveShadow = false

      const source = node.material
      if (!graded.has(source)) {
        graded.set(source, applyGrade(toPhysical(source), lowPower))
      }
      node.material = graded.get(source)
    })

    /* --- Finish-swappable parts get their own material instance ---------- */
    const finishParts = []
    for (const name of FINISH_TARGETS) {
      const node = root.getObjectByName(name)
      if (!node?.isMesh) continue
      node.material = node.material.clone()
      finishParts.push(node)
    }

    /* --- Display hinge ---------------------------------------------------- */
    const displayRig = rigs.DISPLAY_RIG
    const displayPivot = displayRig ? buildDisplayPivot(root, displayRig) : null

    /* --- Cache rest positions so explode can be a pure offset -------------
       Each target also carries the window inside the 0..1 explode value that
       it actually moves in, which is what turns one scalar into a staged
       cascade rather than everything opening at once. */
    const explodeTargets = []
    for (const [name, offset] of Object.entries(EXPLODE_OFFSETS)) {
      const rig = rigs[name] ?? root.getObjectByName(name)
      if (!rig) continue
      const [from, to] = EXPLODE_STAGES[name] ?? [0, 1]
      explodeTargets.push({
        object: rig,
        rest: rig.position.clone(),
        offset: new THREE.Vector3(...offset),
        from,
        span: Math.max(0.0001, to - from),
      })
    }

    /* --- The sensor lights up when the teardown reaches it ---------------- */
    const sensorGlow = []
    const sensorRig = rigs.SENSOR_RIG
    if (sensorRig) {
      sensorRig.traverse((node) => {
        if (!node.isMesh) return
        if (!/Sensor \| silicon/.test(node.material.name ?? '')) return
        // Its own instance, so lighting it does not light anything else.
        node.material = node.material.clone()
        sensorGlow.push(node.material)
      })
    }

    const lens = rigs[LENS_RIG]
    const lensRest = lens ? lens.position.clone() : new THREE.Vector3()

    const bounds = new THREE.Box3().setFromObject(root)

    return {
      root,
      rigs,
      displayPivot,
      explodeTargets,
      lens,
      lensRest,
      finishParts,
      sensorGlow,
      bounds,
      /** Centroid of the assembled instrument. Used as the rotation pivot. */
      pivot: bounds.getCenter(new THREE.Vector3()),
    }
  }, [scene, lowPower])
}
