/* =============================================================================
   Page furniture: backdrop, navigation, loader, sticky purchase bar, cart
   drawer and footer. Grouped in one module because they are all thin and all
   read the same store.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { BRAND, COPY, FINISHES, FOOTER, KITS, NAV, price } from '../data/product.js'
import { cartTotals, unitPrice, useStore } from '../lib/useStore.js'
import { scrollTo } from '../lib/scroll.js'
import { sectionTop } from '../lib/timeline.js'
import { useTicker } from '../lib/ticker.js'
import { scrollState } from '../lib/scroll.js'

/* --- Backdrop ------------------------------------------------------------- */

export function Backdrop() {
  const quality = useStore((s) => s.quality)
  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__layer backdrop__dark" />
        <div className="backdrop__layer backdrop__light" />
      </div>
      <div className="vignette" aria-hidden="true" />
      {quality === 'high' ? <div className="grain" aria-hidden="true" /> : null}
    </>
  )
}

/* --- Navigation ----------------------------------------------------------- */

export function Nav() {
  const cart = useStore((s) => s.cart)
  const openCart = useStore((s) => s.openCart)
  const motion = useStore((s) => s.motion)
  const toggleMotion = useStore((s) => s.toggleMotion)
  const { units } = cartTotals(cart)

  return (
    <header className="nav">
      <a
        className="nav__mark"
        href="#top"
        onClick={(e) => {
          e.preventDefault()
          scrollTo(0)
        }}
      >
        <i />
        <b>{BRAND.name}</b>
        <span>/ {BRAND.unit}</span>
      </a>

      <nav className="nav__links" aria-label="Sections">
        {NAV.map((item) => (
          <a
            key={item.id}
            className="nav__link"
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              scrollTo(sectionTop(item.id) + 2)
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        <button
          type="button"
          className="nav__link"
          onClick={toggleMotion}
          aria-pressed={motion === 'reduced'}
          title="Reduce the amount of motion on this page"
        >
          Motion {motion === 'reduced' ? 'off' : 'on'}
        </button>
        <button type="button" className="nav__cart" onClick={openCart}>
          Cart <span className="nav__count">{units}</span>
        </button>
      </div>
    </header>
  )
}

/* --- Loader --------------------------------------------------------------- */

export function Loader() {
  const { progress } = useProgress()
  const loaded = useStore((s) => s.loaded)
  const [held, setHeld] = useState(0)

  // Never let the bar run backwards, and never let it finish before the scene
  // has actually painted a frame.
  useEffect(() => {
    setHeld((p) => Math.max(p, progress))
  }, [progress])

  const shown = loaded ? 100 : Math.min(held, 96)

  return (
    <div className="loader" data-done={loaded}>
      <div className="loader__inner">
        <div className="loader__mark">{BRAND.wordmark}</div>
        <div className="loader__track">
          <div className="loader__fill" style={{ '--p': shown / 100 }} />
        </div>
        <div className="loader__meta">
          <span className="label label-sm">Loading</span>
          <span className="label label-sm num">{String(Math.round(shown)).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  )
}

/* --- Sticky purchase bar --------------------------------------------------
   Appears once the hero is behind you and hides again on the order section, so
   it never competes with the real buy module.
   ------------------------------------------------------------------------ */

export function BuyBar() {
  const ref = useRef(null)
  const on = useRef(false)
  const kit = useStore((s) => s.kit)
  const finish = useStore((s) => s.finish)
  const addToCart = useStore((s) => s.addToCart)

  const kitName = KITS.find((k) => k.id === kit)?.name ?? ''
  const finishName = FINISHES.find((f) => f.id === finish)?.name ?? ''

  useTicker(() => {
    const el = ref.current
    if (!el) return
    const hidden = ['hero', 'purchase', 'close']
    const should = !hidden.includes(scrollState.section)
    if (should === on.current) return
    on.current = should
    el.dataset.on = String(should)
  }, [])

  return (
    <div className="buybar" ref={ref} data-on="false">
      <div className="buybar__l">
        <span className="buybar__name">{BRAND.wordmark}</span>
        <span className="buybar__meta">
          {finishName} / {kitName}
        </span>
      </div>
      <div className="buybar__r">
        <span className="buybar__price">{price(unitPrice(kit))}</span>
        <button
          type="button"
          className="btn btn--solid buybar__configure"
          onClick={() => scrollTo(sectionTop('purchase') + 2)}
        >
          Configure
        </button>
        <button type="button" className="btn" onClick={addToCart}>
          Add to cart
        </button>
      </div>
    </div>
  )
}

/* --- Cart drawer ---------------------------------------------------------- */

export function Qty({ value, onChange, label }) {
  return (
    <div className="qty">
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Remove one ${label}`}>
        &minus;
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`Add one ${label}`}>
        +
      </button>
    </div>
  )
}

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen)
  const close = useStore((s) => s.closeCart)
  const cart = useStore((s) => s.cart)
  const setLineQty = useStore((s) => s.setLineQty)
  const { units, total } = cartTotals(cart)

  useEffect(() => {
    document.body.dataset.locked = String(open)
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <div className="scrim" data-on={open} onClick={close} />
      <aside className="drawer" data-on={open} aria-hidden={!open} aria-label="Cart">
        <div className="drawer__head">
          <span className="label">Cart / {String(units).padStart(2, '0')}</span>
          <button type="button" className="label" onClick={close}>
            Close
          </button>
        </div>

        <div className="drawer__body">
          {cart.length === 0 ? (
            <p className="drawer__empty">
              Your cart is empty. Choose a finish and a configuration in the order section.
            </p>
          ) : (
            cart.map((line) => {
              const kit = KITS.find((k) => k.id === line.kit)
              const finish = FINISHES.find((f) => f.id === line.finish)
              return (
                <div className="line" key={line.key}>
                  <div>
                    <div className="line__name">
                      {BRAND.wordmark} / {kit?.name}
                    </div>
                    <div className="label label-sm">{finish?.name}</div>
                  </div>
                  <div className="line__price">{price(unitPrice(line.kit) * line.qty)}</div>
                  <div className="line__meta">
                    <Qty
                      value={line.qty}
                      label={kit?.name ?? 'item'}
                      onChange={(q) => setLineQty(line.key, q)}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="drawer__foot">
          <div className="total">
            <span className="label">Total, incl. VAT</span>
            <span className="total__v">{price(total)}</span>
          </div>
          <button type="button" className="btn btn--solid btn--wide" disabled={!cart.length}>
            Checkout
          </button>
        </div>
      </aside>
    </>
  )
}


/* --- Footer --------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell grid12 footer__grid">
        <div className="footer__brand">
          <div className="label">{BRAND.wordmark}</div>
          <p className="prose" style={{ marginTop: '1rem', maxWidth: '26ch' }}>
            {COPY.close.lede}
          </p>
        </div>
        {FOOTER.columns.map((col) => (
          <div className="footer__col" key={col.t}>
            <div className="label label-sm">{col.t}</div>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#top" onClick={(e) => e.preventDefault()}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="shell">
        <div className="footer__base">
          <span className="label label-sm">{FOOTER.legal}</span>
          <span className="label label-sm">{FOOTER.note}</span>
        </div>
      </div>
    </footer>
  )
}
