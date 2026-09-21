/* =============================================================================
   STUDIO LIGHTING — RGB rig
   -----------------------------------------------------------------------------
   Same shape as the original: one neutral key light for material readability,
   plus a small number of dynamic lights for mood. What changed is what the
   dynamic lights do — instead of crossfading a dark/paper studio, the rim and
   fill lights now carry the section's electric colour identity, and a warm
   bounce stays fixed so the underside of the body never goes dead black.

   Still only four directional lights total, still one static Environment for
   reflections (unchanged, undyed — recolouring baked lightformers per frame
   would cost far more than it is worth). The RGB story is told mostly by the
   DOM backdrop glow (see Chrome.jsx), which is nearly free; these lights exist
   so the *object itself* also visibly carries the colour, per the brief.
   ========================================================================== */

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Environment, Lightformer } from '@react-three/drei'
import { lerp } from '../lib/math.js'

const Studio = forwardRef(function Studio({ quality = 'high' }, ref) {
  const key = useRef()
  const rim = useRef()
  const fill = useRef()
  const bounce = useRef()

  const envColor = useMemo(() => new THREE.Color('#cfd6dd'), [])
  const ambient = useRef()
  // Scratch colour, reused every frame — no per-frame allocation.
  const scratch = useMemo(() => ({ keyColor: new THREE.Color() }), [])

  useImperativeHandle(ref, () => ({
    /**
     * Called once per frame from Scene.
     * @param t        0..1 intensity multiplier from the choreography
     * @param world    the section's dominant colour (background, fill, fog)
     * @param accent   the opposing colour (rim) — this is what sculpts
     */
    setMood(t, scene, world, accent) {
      // Key stays mostly neutral: it is what keeps the machined edges and the
      // knurling readable no matter how saturated the set gets. A fifth of
      // the world colour mixed in stops it reading as a foreign white light.
      if (key.current) {
        scratch.keyColor.setRGB(1, 1, 1).lerp(world, 0.2)
        key.current.color.copy(scratch.keyColor)
        key.current.intensity = lerp(8, 13, t)
      }

      // Rim carries the ACCENT at full strength. Opposed to the background,
      // it is the edge that separates a dark body from a saturated world.
      if (rim.current) {
        rim.current.color.copy(accent)
        rim.current.intensity = lerp(7, 16, t)
      }

      // Fill and ambient carry the WORLD colour, so the shadow side of the
      // body picks up the room it is standing in.
      if (fill.current) {
        fill.current.color.copy(world)
        fill.current.intensity = lerp(1.2, 3.4, t)
      }
      if (ambient.current) {
        ambient.current.color.copy(world)
        ambient.current.intensity = lerp(0.35, 0.85, t)
      }

      if (bounce.current) bounce.current.intensity = lerp(1.1, 1.7, t)
      if (scene) scene.environmentIntensity = lerp(0.85, 1.3, t)
    },
  }))

  return (
    <group>
      {/* Ambient: the world colour, low. Keeps the shadow side inside the
          colour world instead of falling to neutral black. */}
      <ambientLight ref={ambient} intensity={0.4} color="#00efff" />

      {/* Key: high and slightly camera-right, raking across the top deck. */}
      <directionalLight ref={key} position={[0.55, 0.78, 0.52]} intensity={10} color="#f4f6f8" />

      {/* Rim: low and behind, drawing the edge of the barrel and the finder.
          Colour is set every frame from the choreography's rgb field. */}
      <directionalLight ref={rim} position={[-0.62, 0.18, -0.58]} intensity={8} color="#00f5ff" />

      {/* Fill: broad and frontal, the complementary hue, always present but
          gentle so it reads as bounce rather than a second key. */}
      <directionalLight ref={fill} position={[-0.2, 0.3, 0.9]} intensity={1} color="#405bff" />

      {/* Bounce: warm, from below, so the underside is not a dead black. */}
      <directionalLight ref={bounce} position={[0.1, -0.7, 0.35]} intensity={1.4} color="#c8b59c" />

      {/*
        Reflection set — unchanged, undyed. These never light the scene
        directly; they are what you see *in* the metal and the glass.
      */}
      <Environment resolution={quality === 'low' ? 128 : 256} frames={1}>
        <color attach="background" args={['#05060a']} />

        <Lightformer
          form="rect"
          intensity={5}
          color="#ffffff"
          position={[0, 3.4, 0.6]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 2.4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={7}
          color="#dfe9f5"
          position={[3.2, 0.4, 1.4]}
          rotation={[0, -Math.PI / 2.2, 0]}
          scale={[0.7, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={4}
          color="#9fb6cf"
          position={[-3.0, 0.1, 0.8]}
          rotation={[0, Math.PI / 2.2, 0]}
          scale={[0.42, 4.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#8fa9c6"
          position={[0.4, 0.5, -3.0]}
          rotation={[0, Math.PI, 0]}
          scale={[3.2, 1.2, 1]}
        />
        <Lightformer
          form="circle"
          intensity={9}
          color="#ffffff"
          position={[0.9, 1.1, 2.6]}
          rotation={[0, 0, 0]}
          scale={0.55}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color={envColor}
          position={[0, -2.6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>
    </group>
  )
})

export default Studio
