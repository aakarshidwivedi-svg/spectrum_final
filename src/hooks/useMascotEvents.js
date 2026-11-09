import { useEffect } from 'react'
import { bot, ctx } from '../mascotFx'
import { scene, intro } from '../store'
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
// Section -> reaction (always) and a speech bubble (first visit only, and never closer than 18s apart)
const CTX = {
  home: { anim: 'greet', amp: .5 }, about: { anim: 'curious' },
  perspectives: { anim: 'ponder', msg: 'Four ways of seeing. Have a look!' },
  events: { anim: 'happy', msg: 'Auditions are open. Ready to join?' },
  team: { anim: 'greet', amp: .6, msg: 'Meet the people behind the colour.' },
  join: { anim: 'cheer', msg: 'Come be part of our story!' }, footer: { anim: 'goodbye', msg: 'Thanks for visiting. See you soon!' },
}
const TIPS = ['Want to know what Spectrum is about?', 'Curious about the auditions?', 'Come explore what Spectrum is about!', 'Ready to become part of Spectrum?']
export default function useMascotEvents() {
  useEffect(() => {
    const timers = []; let seen = false, dead = false, lastBubble = 0
    try { seen = localStorage.getItem('spectrum-buddy-seen') === '1' } catch {}
    if (!seen) { // first visit only; returning visitors are not interrupted
      intro.done.then(() => { if (!dead) timers.push(setTimeout(() => { bot.play('greet'); bot.say('Hey there! Welcome to Spectrum!', 4200, 3); lastBubble = performance.now() }, 1200)) })
      intro.done.then(() => { if (!dead) timers.push(setTimeout(() => bot.say("I'm your Spectrum buddy. Need help exploring?", 6000, 3, 'Tap the Spectrum logo to chat'), 5600)) })
      try { localStorage.setItem('spectrum-buddy-seen', '1') } catch {}
    }
    let i = 0; const iv = setInterval(() => { if (!document.hidden && !bot.chatOpen) bot.say(TIPS[i++ % TIPS.length], 4200, 1) }, 50000)
    const said = new Set(), reacted = {}
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      const key = e.target.id || 'footer', c = CTX[key]; if (!c) return
      ctx.section = key; const n = performance.now()
      if (n - (reacted[key] || 0) > 8000) { reacted[key] = n; bot.play(c.anim, c.amp || 1) }
      if (c.msg && !said.has(key) && n - lastBubble > 18000) { said.add(key); lastBubble = n; bot.say(c.msg, 3200, 2) }
    }), { threshold: .35 })
    Object.keys(CTX).forEach(k => { const el = k === 'footer' ? document.querySelector('.site-foot') : document.getElementById(k); el && io.observe(el) })
    const wake = () => bot.wake() // any activity wakes a sleepy mascot
    ;['pointermove', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, wake, { passive: true }))
    const over = e => { // hero mascot glances at hovered primary buttons
      const b = e.target.closest && e.target.closest('.hero .btn, .nav .btn, .join .btn'), s = document.querySelector('.stage')
      if (b && s) { const r = s.getBoundingClientRect(), q = b.getBoundingClientRect(); scene.gx = clamp(((q.left + q.width / 2 - r.left) / r.width) * 2 - 1, -1, 1); scene.gy = clamp(-(((q.top + q.height / 2 - r.top) / r.height) * 2 - 1), -1, 1); scene.gt = 1 } else scene.gt = 0
    }
    const leave = () => { scene.px = scene.py = 9; scene.gt = 0 }
    document.addEventListener('pointerover', over, { passive: true }); document.documentElement.addEventListener('mouseleave', leave)
    return () => { dead = true; timers.forEach(clearTimeout); clearInterval(iv); io.disconnect(); ;['pointermove', 'keydown', 'scroll', 'touchstart'].forEach(ev => removeEventListener(ev, wake)); document.removeEventListener('pointerover', over); document.documentElement.removeEventListener('mouseleave', leave) }
  }, [])
}
