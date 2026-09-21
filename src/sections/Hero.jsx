/* =============================================================================
   00 HERO
   The instrument sits high in frame; the statement takes the floor. Lines mask
   up one after another once the scene has actually painted, so the first thing
   you see is a composed image rather than type arriving over an empty canvas.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { scrollTo } from '../lib/scroll.js'
import { sectionTop } from '../lib/timeline.js'
import { useStore } from '../lib/useStore.js'
import Scrim from '../ui/Scrim.jsx'
import Section from './Section.jsx'

const c = COPY.hero

/** Renders *italic fragments* inside a statement line. */
function line(text) {
  return text.split('*').map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>
  )
}

export default function Hero() {
  const loaded = useStore((s) => s.loaded)
  const state = loaded ? 'in' : ''

  return (
    <Section id="hero" className="hero">
      <div className="sticky hero__stick">
        <Scrim side="bottom" reach={56} strength={0.9} />

        {/* Top band: the product label, and the instruction to scroll. */}
        <div className="shell hero__top">
          <div className="eyebrow" data-reveal={state} style={{ '--reveal-delay': '120ms' }}>
            <span className="label">{c.label}</span>
            <span className="label label-sm">Full frame / 61 MP</span>
          </div>
          <div className="hero__scroll" data-reveal={state} style={{ '--reveal-delay': '1000ms' }}>
            <span className="hero__scrollline" />
            <span>{c.scrollHint}</span>
          </div>
        </div>

        {/* Floor: the statement, a rule, then the argument and the actions. */}
        <div className="shell hero__floor">
          <h1 className="display hero__statement" data-reveal={state}>
            {c.statement.map((text, i) => (
              <span
                className="mask-line"
                key={text}
                style={{ '--reveal-delay': `${280 + i * 130}ms` }}
              >
                <span>{line(text)}</span>
              </span>
            ))}
          </h1>

          <hr className="rule hero__rule" data-reveal={state} style={{ '--reveal-delay': '620ms' }} />

          <div className="grid12 hero__row">
            <p
              className="lede hero__lede"
              data-reveal={state}
              style={{ '--reveal-delay': '700ms' }}
            >
              {c.lede}
            </p>
            <div className="hero__cta" data-reveal={state} style={{ '--reveal-delay': '820ms' }}>
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => scrollTo(sectionTop('purchase') + 2)}
              >
                {c.ctaPrimary}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => scrollTo(sectionTop('push') + 2)}
              >
                {c.ctaSecondary}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
