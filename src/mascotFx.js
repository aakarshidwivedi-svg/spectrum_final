// Event-driven mascot behaviour shared by the 3D scene and the DOM (no React state per frame)
import { reduced } from './store'
const rnd = (a, b) => a + Math.random() * (b - a), L = (a, b, k) => a + (b - a) * k, pick = a => a[Math.floor(Math.random() * a.length)]
const makeFx = () => ({
  cur: { tail: 0, lx: 0, ly: 0, hop: 0, sq: 0, rz: 0, exc: 0, bright: 0, squint: 0, tilt: 0, wide: 0, blink: 0 },
  pulse: 0, lastActive: 0, canSleep: false, hint: false, kind: '', t0: 0, amp: 1, last: '', hov: 0, pending: '', nextIdle: 0, nextBlink: 0, blinkAt: -9, dbl: 0, lastReact: 0, cool: {}, lis: new Set(),
  say(text, ms = 3200, prio = 1, hint = '') { this.lis.forEach(f => f({ text, ms, prio, hint })) },
  sayCool(key, secs, text, ms, prio, hint) { const n = performance.now() / 1000; if (n < (this.cool[key] || 0)) return; this.cool[key] = n + secs; this.say(text, ms, prio, hint) },
  play(kind, amp = 1, passive = false) { const n = performance.now() / 1000; this.kind = kind; this.t0 = n; this.amp = amp; if (!passive) this.lastActive = n },
  wake() { this.lastActive = performance.now() / 1000; if (this.kind === 'sleepy') this.kind = '' },
  release() { if (this.kind === 'thinking' || this.kind === 'listening') this.kind = '' },
  react() { // random click reaction, never the same twice in a row
    const n = performance.now() / 1000; if (n - this.lastReact < .35) return; this.lastReact = n; this.pulse = 1
    const k = pick(['bounce', 'excited', 'tilt', 'wave'].filter(x => x !== this.last)); this.last = k; this.play(k)
  },
  step(dt) {
    const n = performance.now() / 1000, a = n - this.t0, A = this.amp, m = reduced ? 0 : 1, S = Math.sin, E = x => Math.exp(-a * x)
    if (!this.nextBlink) { this.nextBlink = n + 1.5; this.nextIdle = n + 9; this.lastActive = n }
    this.pulse *= Math.exp(-dt * 2.5) // light pulse fades after a click
    const o = { tail: 0, lx: 0, ly: 0, hop: 0, sq: 0, rz: 0, exc: 0, bright: 0, squint: 0, tilt: 0, wide: 0 }
    switch (this.kind) {
      case 'bounce': if (a < 1.1) { const e = E(2); o.hop = Math.abs(S(a * 6.9)) * .4 * e * A * m; o.sq = Math.cos(a * 6.9) * .04 * e * A * m; o.exc = .6 * e * A * m; o.squint = .3 * e * A } else this.kind = ''; break
      case 'excited': if (a < 1.7) { const e = E(1.3); o.hop = Math.abs(S(a * 9.4)) * .3 * e * A * m; o.exc = 2 * e * A * m; o.rz = S(a * 20) * .04 * e * A * m; o.bright = e * A; o.wide = .5 * e * A } else this.kind = ''; break
      case 'tilt': if (a < 1.9) { const e = a < 1.2 ? 1 : Math.exp(-(a - 1.2) * 5); o.tilt = .14 * S(Math.min(a / .35, 1) * 1.571) * e * A * m; o.wide = .5 * e * A } else this.kind = ''; break
      case 'wave': if (a < 1.7) { const e = E(1.5); o.rz = S(a * 11) * .06 * e * A * m; o.tilt = S(a * 5) * .05 * e * A * m; o.exc = 1.2 * e * A * m; o.squint = .3 * e * A } else this.kind = ''; break
      case 'cheer': if (a < 2.6) { const e = E(.8); o.hop = Math.abs(S(a * 10.5)) * .45 * e * m; o.exc = 2.5 * e * m; o.squint = .35 * e; o.rz = S(a * 14) * .04 * e * m; o.bright = .8 * e } else this.kind = ''; break
      case 'thinking': o.tilt = .1 * m; o.lx = .6; o.ly = .5; o.wide = .2; o.rz = S(n * 1.5) * .01 * m; break // holds until released
      case 'listening': o.wide = .7; o.bright = .4; o.tilt = -.04 * m; break
      case 'confused': if (a < 1.8) { const e = E(1.1); o.tilt = S(a * 6) * .12 * e * m; o.rz = S(a * 6 + 1) * .03 * e * m; o.wide = .5 * e; o.ly = .3 * e } else this.kind = ''; break
      case 'happy': if (a < 1.6) { const e = E(1.4); o.hop = Math.abs(S(a * 6)) * .2 * e * m; o.squint = .4 * e; o.exc = e * m; o.bright = .6 * e } else this.kind = ''; break
      case 'curious': if (a < 2.4) { const e = a < 1.8 ? 1 : Math.exp(-(a - 1.8) * 5); o.tilt = .12 * Math.min(a / .4, 1) * e * m; o.wide = .7 * e; o.bright = .3 * e; o.ly = .15 * e } else this.kind = ''; break
      case 'ponder': if (a < 3.2) { const e = Math.min(a / .5, 1) * (a < 2.6 ? 1 : Math.exp(-(a - 2.6) * 6)); o.tilt = .1 * e * m; o.lx = .6 * e; o.ly = .5 * e; o.wide = .2 * e } else this.kind = ''; break
      case 'surprised': if (a < 1.3) { const e = E(2.2); o.hop = Math.abs(S(a * 8)) * .25 * e * m; o.sq = -.05 * e * m; o.wide = e; o.bright = e; o.exc = 1.5 * e * m; o.tilt = -.05 * e * m } else this.kind = ''; break
      case 'settle': if (a < .7) { const e = E(5); o.hop = Math.abs(S(a * 12)) * .08 * e * m; o.sq = Math.cos(a * 12) * .05 * e * m } else this.kind = ''; break
      case 'sleepy': { const y = Math.pow(Math.max(0, S(n * 1.0)), 12); o.squint = .5 + .4 * y; o.tilt = -.07 * m; o.sq = (S(n * .9) * .02 + .05 * y) * m; break } // holds until woken; "yawn" = slow big breath + eyes squeezing shut
      case 'goodbye': if (a < 2.6) { const e = E(.7); o.rz = S(a * 9) * .07 * e * m; o.tilt = S(a * 4) * .07 * e * m; o.exc = .8 * e * m; o.squint = .3 * e; o.hop = Math.abs(S(a * 4)) * .1 * e * m } else this.kind = ''; break
      case 'dance': if (a < 2.2) { const e = a < 1.6 ? 1 : Math.exp(-(a - 1.6) * 6); o.hop = Math.abs(S(a * 12)) * .35 * e * m; o.rz = S(a * 12) * .08 * e * m; o.exc = 2.2 * e * m; o.squint = .3 * e; o.bright = e } else this.kind = ''; break
      case 'pat': if (a < 1.4) { const e = E(1.8); o.tilt = .1 * e * m; o.squint = .6 * e; o.hop = .06 * Math.abs(S(a * 7)) * e * m; o.exc = .5 * e * m } else this.kind = ''; break // head touched: happy closed eyes
      case 'tailwag': if (a < 1.8) { const e = E(1.2); o.tail = 3 * e * m; o.exc = .3 * e * m; o.squint = .2 * e } else this.kind = ''; break // tail touched
      case 'greet': if (a < 2.4) { const e = E(.9); o.tilt = S(a * 3) * .08 * e * m; o.rz = S(a * 8) * .05 * e * m; o.hop = Math.abs(S(a * 5)) * .15 * e * m; o.exc = e * m; o.squint = .3 * e } else this.kind = ''; break
    }
    if (this.canSleep && !this.kind && !reduced && n - this.lastActive > 45) this.play('sleepy', 1, true) // dozes off after 45s untouched
    if (!this.kind && !reduced && n > this.nextIdle) { this.nextIdle = n + rnd(7, 14); this.play(['tilt', 'tilt', 'wave', 'curious'][Math.floor(Math.random() * 4)], .5, true) } // small idle gestures
    o.bright += this.hov; o.wide += this.hov * .5; o.tilt += this.hov * .05 * m // curious on hover
    const k = 1 - Math.exp(-dt * 14), c = this.cur
    for (const key in o) c[key] = L(c[key], o[key], k) // blend between reactions, no snapping
    if (!reduced) { // varied blink intervals, occasional double blink
      if (n > this.nextBlink) { this.blinkAt = n; this.nextBlink = n + rnd(2.2, 5.5); if (Math.random() < .22) this.dbl = n + .26 }
      if (this.dbl && n > this.dbl) { this.blinkAt = n; this.dbl = 0 }
    }
    const ba = n - this.blinkAt; c.blink = !reduced && ba < .16 ? 1 - Math.abs(ba / .08 - 1) : 0
  },
})
export const fx = makeFx()   // hero mascot
export const bot = makeFx()  // floating assistant
bot.canSleep = true
export const ctx = { section: 'home' } // active website section, read by the assistant for suggestions
// Touch regions in reference-image pixels (same space as the shader): the tail sweeps up the left side, the head is everything above the chin.
export const regionOf = (x, y) => (x < 345 && y > 330 ? 'tail' : y < 425 && x > 285 && x < 765 ? 'head' : 'body')
export function poke(F, region) {
  F.pulse = 1
  const el = document.querySelector(F === fx ? '.stage' : '.buddy-mascot') // localized ripple in the dot field around the touched mascot
  if (el) { const r = el.getBoundingClientRect(); dispatchEvent(new CustomEvent('dotfield-shock', { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, power: .6 } })) }
  if (region === 'head') { F.play('pat'); F.sayCool('pat', 8, 'Aww, thanks!', 1800, 2) }
  else if (region === 'tail') F.play('tailwag')
  else F.react()
}
