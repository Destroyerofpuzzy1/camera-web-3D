/* =============================================================================
   INSTRUMENT OVERLAY
   -----------------------------------------------------------------------------
   The page's signature element: a measuring graticule laid over everything, so
   the site is read the way you read through a finder. Corner crop marks, a live
   exposure read-out, and a chapter index that doubles as the progress
   indicator.

   The read-out numbers are set dressing, but they are consistent set dressing:
   they move the way they would if you were actually working the body.
   ========================================================================== */

import { useEffect, useState } from 'react'
import { CHAPTER_INDEX, READOUT } from '../data/chapters.js'
import { scrollTo } from '../lib/scroll.js'
import { sectionTop } from '../lib/timeline.js'
import { useStore } from '../lib/useStore.js'

function Readout({ chapter }) {
  const r = READOUT[chapter] ?? READOUT.hero
  return (
    <div className="readout">
      <span className="readout__mode">{r.mode}</span>
      <span>
        f/<b className="readout__v">{r.f}</b>
      </span>
      <span className="readout__sep">/</span>
      <span className="readout__v">{r.s}</span>
      <span className="readout__sep">/</span>
      <span>
        ISO <b className="readout__v">{r.iso}</b>
      </span>
      <span className="readout__sep">/</span>
      <span>
        <b className="readout__v">{r.d}</b> m
      </span>
    </div>
  )
}

function Chapters({ chapter }) {
  return (
    <nav className="chapters" aria-label="Chapters" data-hidden={chapter === 'purchase'}>
      {CHAPTER_INDEX.map((c) => (
        <button
          key={c.id}
          type="button"
          className="chapters__row"
          data-active={c.id === chapter}
          onClick={() => scrollTo(sectionTop(c.id) + 2)}
        >
          <span className="chapters__label">{c.label}</span>
          <span>{c.n}</span>
          <span className="chapters__tick" />
        </button>
      ))}
    </nav>
  )
}

export default function Instrument() {
  const chapter = useStore((s) => s.chapter)
  const loaded = useStore((s) => s.loaded)
  const [atFooter, setAtFooter] = useState(false)

  // The graticule is a frame around the instrument, not around the sitemap.
  // Retire it as soon as the footer arrives.
  useEffect(() => {
    const footer = document.querySelector('.footer')
    if (!footer) return undefined
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -55% 0px' }
    )
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  return (
    <div className="instrument" data-on={loaded && !atFooter}>
      <span className="crop crop--tl" />
      <span className="crop crop--tr" />
      <span className="crop crop--bl" />
      <span className="crop crop--br" />
      <Readout chapter={chapter} />
      <Chapters chapter={chapter} />
    </div>
  )
}
