let ctx = null
export const sound = { on: false } // off by default
export function blip(f = 660) {
  if (!sound.on) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime
    o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .12)
    o.connect(g).connect(ctx.destination); o.start(); o.stop(t + .13)
  } catch {}
}
