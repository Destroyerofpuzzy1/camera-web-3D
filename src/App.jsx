/* =============================================================================
   FRAME / 01
   -----------------------------------------------------------------------------
   Layer order, back to front:

     backdrop   fixed DOM gradient, crossfaded by the choreography's `light`
     stage      fixed transparent WebGL canvas
     vignette   fixed DOM
     grain      fixed DOM
     sections   scrolling DOM, with film gates that crop the canvas
     instrument the graticule overlay
     nav / cart fixed furniture

   The canvas is transparent on purpose. Keeping the backdrop, the grain and the
   vignette in the DOM is what lets the object composite into the page rather
   than sit in a window on top of it.
   ========================================================================== */

import { Backdrop, BuyBar, CartDrawer, Footer, Loader, Nav } from './ui/Chrome.jsx'
import Instrument from './ui/Instrument.jsx'
import Stage from './three/Stage.jsx'

import Hero from './sections/Hero.jsx'
import Silhouette from './sections/Silhouette.jsx'
import Optics from './sections/Optics.jsx'
import Sensor from './sections/Sensor.jsx'
import Architecture from './sections/Architecture.jsx'
import Handling from './sections/Handling.jsx'
import Gallery from './sections/Gallery.jsx'
import Specification from './sections/Specification.jsx'
import Order from './sections/Order.jsx'
import Close from './sections/Close.jsx'

import { useMotionPreference, useQualityProbe, useSmoothScroll } from './lib/scroll.js'
import { useReveal } from './lib/useReveal.js'

export default function App() {
  useMotionPreference()
  useQualityProbe()
  useSmoothScroll()
  useReveal()

  return (
    <>
      <Backdrop />
      <Stage />

      <a className="skip" href="#specs">
        Skip to the specification
      </a>

      <Nav />
      <Instrument />

      <main id="top">
        <Hero />
        <Silhouette />
        <Optics />
        <Sensor />
        <Architecture />
        <Handling />
        <Gallery />
        <Specification />
        <Order />
        <Close />
      </main>

      <Footer />
      <BuyBar />
      <CartDrawer />
      <Loader />
    </>
  )
}
