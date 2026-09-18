/* =============================================================================
   STAGE
   -----------------------------------------------------------------------------
   The fixed canvas the whole page scrolls over. Transparent on purpose: the
   backdrop, the grain and the vignette are DOM, so the 3D object composites
   into the layout rather than sitting in a window on top of it.
   ========================================================================== */

import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './Scene.jsx'
import { useStore } from '../lib/useStore.js'

export default function Stage() {
  const quality = useStore((s) => s.quality)
  const setLoaded = useStore((s) => s.setLoaded)
  const lowPower = quality === 'low'

  const handleReady = useCallback(() => {
    // One frame of grace so the first paint is a composed image, not a pop.
    requestAnimationFrame(() => requestAnimationFrame(() => setLoaded(true)))
  }, [setLoaded])

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        className="stage__canvas"
        dpr={lowPower ? [1, 1.35] : [1, 2]}
        gl={{
          antialias: !lowPower,
          alpha: true,
          powerPreference: 'high-performance',
          // Transmissive glass needs the scene rendered into a target; keeping
          // the default framebuffer clean avoids a second copy.
          preserveDrawingBuffer: false,
        }}
        camera={{ fov: 30, near: 0.01, far: 40, position: [0.255, 0.112, 0.402] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <Scene lowPower={lowPower} onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
