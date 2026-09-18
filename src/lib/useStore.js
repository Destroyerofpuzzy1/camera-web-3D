/* =============================================================================
   Application state.
   Deliberately small. Per-frame values (scroll position, camera pose) never
   come through here; they live in lib/scroll.js as plain mutable state so the
   render loop can read them without causing React work.
   ========================================================================== */

import { create } from 'zustand'
import { FINISHES, KITS } from '../data/product.js'

export const useStore = create((set, get) => ({
  /* --- Scene readiness --------------------------------------------------- */
  loaded: false,
  loadProgress: 0,
  setLoaded: (loaded) => set({ loaded }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),

  /* --- Chapter (changes a handful of times per page, safe for React) ------ */
  chapter: 'hero',
  setChapter: (chapter) => {
    if (get().chapter !== chapter) set({ chapter })
  },

  /* --- Preferences ------------------------------------------------------- */
  /** 'full' | 'reduced'. Seeded from the OS, overridable by the page toggle. */
  motion: 'full',
  setMotion: (motion) => {
    document.documentElement.dataset.motion = motion === 'reduced' ? 'reduced' : 'full'
    set({ motion })
  },
  toggleMotion: () => get().setMotion(get().motion === 'full' ? 'reduced' : 'full'),

  /** 'high' | 'low'. Drops transmission, shadows and pixel ratio when low. */
  quality: 'high',
  setQuality: (quality) => set({ quality }),

  /* --- Configurator ------------------------------------------------------ */
  finish: FINISHES[0].id,
  kit: KITS[0].id,
  qty: 1,
  setFinish: (finish) => set({ finish }),
  setKit: (kit) => set({ kit }),
  setQty: (qty) => set({ qty: Math.min(5, Math.max(1, qty)) }),

  /* --- Cart -------------------------------------------------------------- */
  cart: [],
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  addToCart: () => {
    const { finish, kit, qty, cart } = get()
    const key = finish + ':' + kit
    const existing = cart.find((line) => line.key === key)
    const next = existing
      ? cart.map((line) =>
          line.key === key ? { ...line, qty: Math.min(5, line.qty + qty) } : line
        )
      : [...cart, { key, finish, kit, qty }]
    set({ cart: next, cartOpen: true })
  },

  setLineQty: (key, qty) =>
    set({
      cart:
        qty <= 0
          ? get().cart.filter((line) => line.key !== key)
          : get().cart.map((line) => (line.key === key ? { ...line, qty } : line)),
    }),

  removeLine: (key) => set({ cart: get().cart.filter((line) => line.key !== key) }),
}))

/** Unit price for a kit id. */
export const unitPrice = (kitId) =>
  KITS.find((k) => k.id === kitId)?.price ?? KITS[0].price

/** Cart totals. */
export const cartTotals = (cart) => {
  const units = cart.reduce((n, l) => n + l.qty, 0)
  const total = cart.reduce((n, l) => n + unitPrice(l.kit) * l.qty, 0)
  return { units, total }
}
