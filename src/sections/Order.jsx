/* =============================================================================
   08 ORDER
   A single-product buy module. Finish and kit are real choices: picking a
   finish swaps the material on the top deck and the command dials of the model
   on the left, so the configurator is showing you the object, not a swatch.
   ========================================================================== */

import { useEffect } from 'react'
import {
  AVAILABILITY,
  BRAND,
  COPY,
  FINISHES,
  KITS,
  VALUE_POINTS,
  price,
} from '../data/product.js'
import { unitPrice, useStore } from '../lib/useStore.js'
import { Qty } from '../ui/Chrome.jsx'
import Scrim from '../ui/Scrim.jsx'
import Section from './Section.jsx'

const c = COPY.purchase

export default function Order() {
  const finish = useStore((s) => s.finish)
  const kit = useStore((s) => s.kit)
  const qty = useStore((s) => s.qty)
  const setFinish = useStore((s) => s.setFinish)
  const setKit = useStore((s) => s.setKit)
  const setQty = useStore((s) => s.setQty)
  const addToCart = useStore((s) => s.addToCart)
  const openCart = useStore((s) => s.openCart)

  const total = unitPrice(kit) * qty

  // The chosen finish is published as a CSS variable too, so the swatch outline
  // and the 3D material never disagree.
  useEffect(() => {
    const f = FINISHES.find((x) => x.id === finish)
    if (f) document.documentElement.style.setProperty('--finish-swatch', f.swatch)
  }, [finish])

  return (
    <Section id="purchase" className="buy">
      <div className="sticky buy__stick">
        <Scrim side="right" reach={66} />
        <div className="shell grid12 buy__grid" style={{ width: '100%' }}>
          <div className="buy__col">
            <div className="buy__box" data-reveal="">
              <div className="buy__head">
                <div className="eyebrow buy__eyebrow">
                  <span className="label num">{c.index}</span>
                  <span className="label">{c.eyebrow}</span>
                </div>
                <h2 className="buy__name">{BRAND.wordmark}</h2>
                <p className="buy__pos">{c.positioning}</p>
              </div>

              <div className="buy__body">
                <fieldset className="buy__field" style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="label">Finish</legend>
                  <div className="buy__opts">
                    {FINISHES.map((f) => (
                      <button
                        type="button"
                        key={f.id}
                        className="buy__opt"
                        data-on={finish === f.id}
                        aria-pressed={finish === f.id}
                        onClick={() => setFinish(f.id)}
                      >
                        <span className="buy__swatch" style={{ background: f.swatch }} />
                        <span>
                          <span className="buy__optname">{f.name}</span>
                          <span className="buy__optnote">{f.note}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="buy__field" style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="label">Configuration</legend>
                  <div className="buy__opts">
                    {KITS.map((k) => (
                      <button
                        type="button"
                        key={k.id}
                        className="buy__opt"
                        data-on={kit === k.id}
                        aria-pressed={kit === k.id}
                        onClick={() => setKit(k.id)}
                      >
                        <span>
                          <span className="buy__optname">{k.name}</span>
                          <span className="buy__optnote">{k.note}</span>
                          <span className="buy__optprice">{price(k.price)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="buy__line">
                  <div>
                    <div className="buy__price">{price(total)}</div>
                    <div className="buy__vat">Incl. VAT / {AVAILABILITY.note}</div>
                  </div>
                  <Qty value={qty} onChange={setQty} label="body" />
                </div>

                <div className="buy__actions">
                  <button type="button" className="btn btn--solid btn--wide" onClick={addToCart}>
                    Add to cart
                  </button>
                  <button
                    type="button"
                    className="btn btn--wide"
                    onClick={() => {
                      addToCart()
                      openCart()
                    }}
                  >
                    Buy now
                  </button>
                </div>

                <div className="buy__stock">
                  <i />
                  <span className="label label-sm">{AVAILABILITY.state}</span>
                </div>
              </div>

              <div className="buy__points">
                {VALUE_POINTS.map((p) => (
                  <div className="buy__point" key={p.k}>
                    <span className="label label-sm">{p.k}</span>
                    <span className="label label-sm" style={{ color: 'var(--ash)' }}>
                      {p.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
