/* =============================================================================
   09 CLOSE
   One long pull back, the studio dimming to almost nothing, and the argument
   the whole page has been making stated plainly.
   ========================================================================== */

import { COPY } from '../data/product.js'
import { scrollTo } from '../lib/scroll.js'
import { sectionTop } from '../lib/timeline.js'
import Scrim from '../ui/Scrim.jsx'
import Section from './Section.jsx'

/* The sequence is short enough to be worth watching twice — the secondary CTA
   scrolls back to the top rather than to a since-removed spec sheet. */

const c = COPY.close

export default function Close() {
  return (
    <Section id="close" className="close">
      <div className="sticky close__stick">
        <Scrim side="bottom" reach={52} strength={0.92} />
        <div className="shell grid12 close__grid">
          <div className="close__statement">
            <h2 className="display" data-reveal="">
              {c.statement.map((line, i) => (
                <span
                  className="mask-line"
                  key={line}
                  style={{ '--reveal-delay': `${i * 130}ms` }}
                >
                  <span>{line}</span>
                </span>
              ))}
            </h2>
          </div>

          <div className="close__aside">
            <p className="lede" data-reveal="" style={{ '--reveal-delay': '320ms' }}>
              {c.lede}
            </p>
            <div className="close__cta" data-reveal="" style={{ '--reveal-delay': '420ms' }}>
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => scrollTo(sectionTop('purchase') + 2)}
              >
                {c.ctaPrimary}
              </button>
              <button type="button" className="btn" onClick={() => scrollTo(0)}>
                {c.ctaSecondary}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
