// Hidden Easter egg: logo x3 then mascot within 6 seconds. Lightweight canvas burst, dismissible.
import { bot } from '../mascotFx'
import { reduced } from '../store'
const COLORS = ['#2aa0b5', '#2f6fc4', '#7b5cb8', '#f0629a', '#ea7b2c', '#6b8f3a', '#ffcf1a']
const seq = []
let stop = null
function burst(x, y) {
  if (reduced) return
  stop && stop()
  const c = document.createElement('canvas'); c.width = innerWidth; c.height = innerHeight
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:9998;pointer-events:none'
  document.body.appendChild(c)
  const g = c.getContext('2d'), t0 = performance.now()
  const ps = Array.from({ length: 40 }, (_, i) => { const a = Math.random() * 6.283, v = 120 + Math.random() * 260; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: 2 + Math.random() * 2.5, c: COLORS[i % COLORS.length] } })
  let raf = 0
  const end = () => { cancelAnimationFrame(raf); c.remove(); removeEventListener('pointerdown', end); removeEventListener('keydown', end); stop = null }
  const tick = now => {
    const t = (now - t0) / 1000; if (t > 1.4) return end()
    g.clearRect(0, 0, c.width, c.height)
    for (const p of ps) { g.globalAlpha = 1 - t / 1.4; g.fillStyle = p.c; g.beginPath(); g.arc(x + p.vx * t, y + p.vy * t + 380 * t * t, p.r, 0, 6.283); g.fill() }
    raf = requestAnimationFrame(tick)
  }
  stop = end; raf = requestAnimationFrame(tick)
  setTimeout(() => { addEventListener('pointerdown', end, { once: true }); addEventListener('keydown', end, { once: true }) }, 300) // any tap or key dismisses it
}
// returns true when the secret sequence completes
export function eggTap(kind) {
  const n = performance.now(); seq.push([kind, n])
  while (seq.length && n - seq[0][1] > 6000) seq.shift()
  while (seq.length > 4) seq.shift()
  if (seq.map(s => s[0]).join() !== 'logo,logo,logo,mascot') return false
  seq.length = 0; trigger(); return true
}
function trigger() {
  bot.play('dance'); bot.say('You discovered the Spectrum secret!', 5000, 4)
  const r = document.querySelector('.buddy-mascot')?.getBoundingClientRect()
  burst(r ? r.left + r.width / 2 : innerWidth - 80, r ? r.top + r.height / 2 : innerHeight - 120)
}
const pokes = []
// eight reactions within 12 seconds also unlock the secret
export function eggPoke() {
  const n = performance.now(); pokes.push(n); while (pokes.length && n - pokes[0] > 12000) pokes.shift()
  if (pokes.length < 8) return false
  pokes.length = 0; trigger(); return true
}
