/* =============================================================================
   FRAME / 01 — RGB SHOWCASE CUT
   -----------------------------------------------------------------------------
   Layer order, back to front:

     backdrop   fixed DOM gradient — near-black base + two colour glows,
                both driven live by the choreography's `rgb` field
     stage      fixed transparent WebGL canvas
     vignette   fixed DOM
     grain      fixed DOM
     sections   scrolling DOM: hero, push, teardown, purchase, close
     instrument the graticule overlay
     nav / cart fixed furniture

   Five sections, ~1140vh total, over half of it the teardown — see
   data/chapters.js for why. The 3D scene,
   the smooth scroller, the commerce store and the film-gate/callout system are
   all unchanged from the original build; only the choreography, the lighting,
   the backdrop and the section list were touched.
   ========================================================================== */

import { Backdrop, BuyBar, CartDrawer, Footer, Loader, Nav } from './ui/Chrome.jsx'
import Instrument from './ui/Instrument.jsx'
import Stage from './three/Stage.jsx'

import Hero from './sections/Hero.jsx'
import Push from './sections/Push.jsx'
import Teardown from './sections/Teardown.jsx'
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

      <a className="skip" href="#purchase">
        Skip to order
      </a>

      <Nav />
      <Instrument />

      <main id="top">
        <Hero />
        <Push />
        <Teardown />
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
