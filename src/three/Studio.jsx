/* =============================================================================
   STUDIO LIGHTING
   -----------------------------------------------------------------------------
   A product photographer's set, built out of light shapes rather than an HDRI:
   one long overhead softbox, two vertical strips that draw the edges of the
   barrel, a cool kicker behind, and a low warm bounce.

   The `light` value from the choreography (0 dark, 1 bright) crossfades the
   whole set. It drives the DOM backdrop on the same curve, so the page and the
   object change mood together.
   ========================================================================== */

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Environment, Lightformer } from '@react-three/drei'
import { lerp } from '../lib/math.js'

/** Per-light intensity at light = 0 and light = 1. */
const MOODS = {
  key: [12, 6.8],
  rim: [9.5, 2.6],
  fill: [0.5, 2.6],
  bounce: [1.6, 1.1],
  env: [0.85, 1.45],
}

const Studio = forwardRef(function Studio({ quality = 'high' }, ref) {
  const key = useRef()
  const rim = useRef()
  const fill = useRef()
  const bounce = useRef()
  const group = useRef()

  const envColor = useMemo(() => new THREE.Color('#cfd6dd'), [])

  useImperativeHandle(ref, () => ({
    /** Called once per frame from Scene with the damped `light` value. */
    setMood(t, scene) {
      if (key.current) key.current.intensity = lerp(...MOODS.key, t)
      if (rim.current) rim.current.intensity = lerp(...MOODS.rim, t)
      if (fill.current) fill.current.intensity = lerp(...MOODS.fill, t)
      if (bounce.current) bounce.current.intensity = lerp(...MOODS.bounce, t)
      if (scene) scene.environmentIntensity = lerp(...MOODS.env, t)
      // The rim cools as the set darkens; that blue edge is what separates a
      // black object from a black background.
      if (rim.current) rim.current.color.setHSL(0.56, lerp(0.34, 0.1, t), 0.62)
    },
  }))

  return (
    <group ref={group}>
      {/* Key: high and slightly camera-right, raking across the top deck. */}
      <directionalLight ref={key} position={[0.55, 0.78, 0.52]} intensity={11} color="#ffffff" />

      {/* Rim: low and behind, drawing the edge of the barrel and the finder. */}
      <directionalLight ref={rim} position={[-0.62, 0.18, -0.58]} intensity={7} color="#7fa8cc" />

      {/* Fill: broad and frontal, only present when the set goes bright. */}
      <directionalLight ref={fill} position={[-0.2, 0.3, 0.9]} intensity={0.5} color="#e8eef4" />

      {/* Bounce: warm, from below, so the underside is not a dead black. */}
      <directionalLight ref={bounce} position={[0.1, -0.7, 0.35]} intensity={1.6} color="#c8b59c" />

      {/*
        Reflection set. These never light the scene directly; they are what you
        see *in* the metal and the glass. The two vertical strips are the ones
        doing the real work on a cylindrical lens barrel.
      */}
      <Environment resolution={quality === 'low' ? 128 : 256} frames={1}>
        <color attach="background" args={['#05060a']} />

        {/* Overhead softbox */}
        <Lightformer
          form="rect"
          intensity={5}
          color="#ffffff"
          position={[0, 3.4, 0.6]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 2.4, 1]}
        />
        {/* Long vertical strip, camera right: the bright edge on the barrel */}
        <Lightformer
          form="rect"
          intensity={7}
          color="#dfe9f5"
          position={[3.2, 0.4, 1.4]}
          rotation={[0, -Math.PI / 2.2, 0]}
          scale={[0.7, 5, 1]}
        />
        {/* Narrower strip, camera left: the second, cooler edge */}
        <Lightformer
          form="rect"
          intensity={4}
          color="#9fb6cf"
          position={[-3.0, 0.1, 0.8]}
          rotation={[0, Math.PI / 2.2, 0]}
          scale={[0.42, 4.2, 1]}
        />
        {/* Behind, low: separation on the rear chassis and the eyecup */}
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#8fa9c6"
          position={[0.4, 0.5, -3.0]}
          rotation={[0, Math.PI, 0]}
          scale={[3.2, 1.2, 1]}
        />
        {/* Small hot circle: the specular pin in the front element */}
        <Lightformer
          form="circle"
          intensity={9}
          color="#ffffff"
          position={[0.9, 1.1, 2.6]}
          rotation={[0, 0, 0]}
          scale={0.55}
        />
        {/* Ground bounce */}
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
