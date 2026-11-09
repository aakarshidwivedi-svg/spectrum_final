// shared mutable scene state (read each frame, no re-renders)
const mk = () => ({ hover: 0, scroll: 0, mx: 0, my: 0, px: 9, py: 9, ch: 0, reset: false, sw: 0, gx: 0, gy: 0, gt: 0 })
export const scene = mk()
export const botScene = mk()
export const ui = { lenis: null } // the smooth-scroll instance (set by App) so overlays such as the team profile can pause page scrolling
export const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }
// brand intro: plays once per browser session, never with reduced motion; other animations wait for intro.done
let doneFn
const seen = (() => { try { return sessionStorage.getItem('spectrum-intro') === '1' } catch { return true } })()
export const intro = { active: !reduced && !seen, done: new Promise(r => (doneFn = r)) }
export const finishIntro = () => { intro.active = false; try { sessionStorage.setItem('spectrum-intro', '1') } catch {} doneFn() }
if (!intro.active) doneFn()
