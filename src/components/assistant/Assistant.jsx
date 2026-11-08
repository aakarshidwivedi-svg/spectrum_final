import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { bot, ctx, poke, regionOf } from '../../mascotFx'
import { hasWebGL, botScene } from '../../store'
import { eggTap, eggPoke } from '../../lib/egg'
import MascotBubble from '../MascotBubble'
import charImg from '../../assets/spectrum-character.png'
import logo from '../../assets/logo.jpeg'
const Mini = lazy(() => import('../Hero3D').then(m => ({ default: m.MiniMascot })))
const Chat = lazy(() => import('./ChatPanel'))
const KEY = 'spectrum-buddy-pos'

// The Spectrum logo opens the chat. The 3D mascot is a separate, freely draggable companion.
export default function Assistant() {
  const [open, setOpen] = useState(false), [closing, setClosing] = useState(false), [moved, setMoved] = useState(false), [gl] = useState(() => hasWebGL())
  const wrap = useRef(), btn = useRef(), api = useRef({})
  const lowPower = innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4

  useEffect(() => {
    const el = wrap.current; if (!el) return
    let saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY)) } catch {}
    const mob = () => innerWidth <= 640
    const def = () => { const m = mob() ? 10 : 16, lh = mob() ? 52 : 56; return { r: m, b: m + lh + 8 } } // default: just above the logo, bottom-right
    const dims = () => ({ w: el.offsetWidth, h: el.offsetHeight, vw: innerWidth, vh: innerHeight })
    const clamp = p => { const { w, h, vw, vh } = dims(); return { r: Math.min(Math.max(8, p.r), Math.max(8, vw - w - 8)), b: Math.min(Math.max(8, p.b), Math.max(8, vh - h - 76)) } } // stays on screen, below the nav
    let cur = clamp(saved || def()), tgt = cur, start = cur, drag = false, id = -1, sx = 0, sy = 0, raf = 0, clicks = [], lastClick = 0, lastT = 0
    const place = (p, settle) => {
      const { w, h, vw, vh } = dims(), x = vw - w - p.r, y = vh - h - p.b
      el.classList.toggle('settle', !!settle)
      el.style.transform = `translate3d(${x}px,${y}px,0)`
      el.dataset.h = x < 100 ? 'l' : x + w > vw - 100 ? 'r' : 'c'; el.dataset.v = y < 130 ? 'down' : 'up' // keeps the speech bubble on screen
    }
    const persist = () => { try { saved ? sessionStorage.setItem(KEY, JSON.stringify(saved)) : sessionStorage.removeItem(KEY) } catch {} }
    const refresh = () => { const d = def(); setMoved(!!saved && (Math.abs(saved.r - d.r) > 3 || Math.abs(saved.b - d.b) > 3)) }
    const applyChat = () => { // while the chat is open, step the mascot aside if it would sit under the panel
      const base = clamp(saved || def()), { w, h, vw, vh } = dims()
      if (!api.current.chatOpen) { cur = base; el.classList.remove('away'); place(cur, true); return }
      const m = mob() ? 10 : 16, lh = mob() ? 52 : 56, pw = Math.min(380, vw - (mob() ? 20 : 32)), ph = Math.min(560, vh - (mob() ? 150 : 200))
      const x = vw - w - base.r, y = vh - h - base.b, bot_ = vh - (m + lh + 12)
      const hit = x < vw - m && x + w > vw - m - pw && y < bot_ && y + h > bot_ - ph
      if (!hit) { cur = base; el.classList.remove('away'); place(cur, true); return }
      const r = m + pw + 12
      if (vw - w - r >= 8) { cur = clamp({ r, b: m }); el.classList.remove('away'); place(cur, true) } else el.classList.add('away') // no room: hide until the chat closes
    }
    const reset = () => { saved = null; persist(); refresh(); applyChat() }
    const regionAt = e => { // which body part was touched (image is square and fills the box)
      if (!e || e.clientX == null) return 'body'
      const r = el.getBoundingClientRect(), s = Math.min(r.width, r.height)
      return regionOf(((e.clientX - r.left - (r.width - s) / 2) / s) * 800 + 90, ((e.clientY - r.top - (r.height - s) / 2) / s) * 800 + 7)
    }
    const click = e => {
      const n = performance.now()
      if (n - lastClick < 320) { lastClick = 0; bot.play('dance'); return } // double-click: special animation
      lastClick = n
      if (eggTap('mascot') || eggPoke()) return // secret sequence, or many quick interactions
      if (bot.hint && !api.current.chatOpen) { setOpen(true); return } // chat opens from the mascot only when its bubble just invited it
      poke(bot, regionAt(e)) // head = pat, tail = wag, body = random reaction
    }
    const loop = () => { if (!drag) return; const prev = cur, now = performance.now(); cur = { r: cur.r + (tgt.r - cur.r) * .35, b: cur.b + (tgt.b - cur.b) * .35 }; botScene.mv = Math.max(-2, Math.min(2, (prev.r - cur.r) / Math.max(.008, (now - lastT) / 1000) / 700)); lastT = now; place(cur); dispatchEvent(new CustomEvent('dotfield-stir', { detail: { x: innerWidth - cur.r - el.offsetWidth / 2, y: innerHeight - cur.b - el.offsetHeight / 2 } })); raf = requestAnimationFrame(loop) }
    const down = e => {
      if (e.button > 0 || e.target.closest('.bubble')) return // let the bubble's dismiss button work
      id = e.pointerId; el.setPointerCapture(id); sx = e.clientX; sy = e.clientY; start = cur; tgt = cur; drag = false
    }
    const move = e => {
      if (e.pointerId !== id) return
      const dx = e.clientX - sx, dy = e.clientY - sy
      if (!drag) { // movement threshold separates a click from a drag
        if (Math.hypot(dx, dy) < (e.pointerType === 'touch' ? 10 : 6)) return
        drag = true; bot.play('surprised'); el.classList.add('dragging'); el.classList.remove('settle'); document.body.style.userSelect = 'none'; raf = requestAnimationFrame(loop)
      }
      tgt = clamp({ r: start.r - dx, b: start.b - dy })
    }
    const end = (e, cancelled) => {
      if (e.pointerId !== id) return; id = -1
      if (drag) {
        drag = false; cancelAnimationFrame(raf); el.classList.remove('dragging'); document.body.style.userSelect = ''; botScene.mv = 0; dispatchEvent(new CustomEvent('dotfield-stir', { detail: { end: true } }))
        cur = tgt; saved = { ...cur }; persist(); place(cur, true); refresh(); bot.play('settle') // glides to rest; chat is never triggered by a drag
      } else if (!cancelled) click(e)
    }
    const up = e => end(e, false), cancel = e => end(e, true)
    const key = e => {
      const s = e.shiftKey ? 80 : 24, d = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key]
      if (d) { e.preventDefault(); cur = clamp({ r: cur.r + d[0], b: cur.b + d[1] }); saved = { ...cur }; persist(); place(cur, true); refresh() }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click() } else if (e.key === 'Home') { e.preventDefault(); reset() }
    }
    const enter = e => { if (e.pointerType !== 'mouse') return; bot.hov = 1; if (!api.current.chatOpen) bot.sayCool('hover', 30, 'Want to explore with me?', 3000, 1, 'Tap the Spectrum logo to chat') }
    const leave = () => (bot.hov = 0), noMenu = e => e.preventDefault(), rs = () => applyChat()
    api.current = Object.assign(api.current, { reset, applyChat })
    place(cur); refresh()
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', cancel)
    el.addEventListener('keydown', key); el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave); el.addEventListener('contextmenu', noMenu)
    addEventListener('resize', rs); addEventListener('orientationchange', rs)
    return () => {
      cancelAnimationFrame(raf); document.body.style.userSelect = ''
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', cancel)
      el.removeEventListener('keydown', key); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); el.removeEventListener('contextmenu', noMenu)
      removeEventListener('resize', rs); removeEventListener('orientationchange', rs)
    }
  }, [])
  useEffect(() => {
    bot.chatOpen = open; api.current.chatOpen = open; api.current.applyChat?.()
    document.documentElement.classList.toggle('chat-open', open) // dot field calms down so the chat stays readable
    if (open) bot.play('greet', .6) // welcoming expression
    return () => { bot.chatOpen = false; document.documentElement.classList.remove('chat-open') }
  }, [open])
  const ct = useRef()
  const close = useCallback(() => { setOpen(false); setClosing(true); clearTimeout(ct.current); ct.current = setTimeout(() => setClosing(false), 240); btn.current?.focus() }, [])
  useEffect(() => () => clearTimeout(ct.current), [])
  const reset = () => api.current.reset?.()

  return <>
    <div ref={wrap} className="buddy-mascot" style={{ transform: 'translate3d(-999px,-999px,0)' }} role="button" tabIndex={0}
      aria-label="Spectrum mascot. Press Enter for a playful reaction, arrow keys to move it, Home to reset its position." onDragStart={e => e.preventDefault()}>
      <div className="buddy-inner">{gl ? <Suspense fallback={null}><Mini lowPower={lowPower} /></Suspense> : <img src={charImg} alt="" draggable="false" />}</div>
      <MascotBubble />
    </div>
    <div className="launcher-wrap">
      {moved && <button type="button" className="buddy-reset" onClick={reset}><RotateCcw size={13} /> Reset mascot</button>}
      <button ref={btn} type="button" className={'launcher' + (open ? ' open' : '')} aria-label="Talk to Spectrum" aria-expanded={open} aria-controls="ask-spectrum" aria-describedby="launcher-tip" onClick={() => (open ? close() : setOpen(true))}>
        <img src={logo} alt="" width="56" height="56" draggable="false" />
      </button>
      <span id="launcher-tip" role="tooltip" className="tip">Talk to Spectrum</span>
    </div>
    {(open || closing) && <Suspense fallback={<div className="chat chat-loading" role="status">Loading…</div>}><Chat closing={closing} onClose={close} onReset={reset} moved={moved} section={ctx.section} /></Suspense>}
  </>
}
