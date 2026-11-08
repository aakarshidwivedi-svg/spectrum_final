import { useEffect, useRef, useState } from 'react'
import { reduced } from '../store'

// [size px, orbit radius px, angular speed rad/s, opacity]
const DOTS = [[5, 19, 1.5, 1], [3, 25, -1.1, .85], [4, 16, 2, .9], [2.5, 29, -.8, .7], [3.5, 22, 1.2, .8], [2, 33, -1.7, .6]]
const HOVER = 'a,button,[role="button"],summary,select,img,figure,.panel,.g,.row,[data-cursor]'
const TEXT = 'input,textarea,[contenteditable="true"]'

export default function CustomCursor() {
  const [on] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(hover:hover) and (pointer:fine)').matches)
  const root = useRef(), dot = useRef(), orbit = useRef(), dots = useRef([])

  useEffect(() => {
    if (!on) return
    const html = document.documentElement
    html.classList.add('has-cursor')
    const s = { tx: 0, ty: 0, x: 0, y: 0, r: 1, a: 0, pulse: 0, seen: false, text: false, el: null, last: performance.now() }
    const show = v => { if (root.current) root.current.style.opacity = v }
    const set = (k, v) => { if (root.current) root.current.dataset[k] = v ? '1' : '0' }

    const move = e => {
      if (e.pointerType === 'touch') return show(0)
      s.tx = e.clientX; s.ty = e.clientY
      if (!s.seen) { s.seen = true; s.x = s.tx; s.y = s.ty }
      dot.current.style.transform = `translate3d(${s.tx}px,${s.ty}px,0)` // exactly on the pointer, no lag
      show(s.text ? 0 : 1)
    }
    const over = e => {
      const t = e.target; if (!(t instanceof Element)) return
      s.text = !!t.closest(TEXT); s.el = t.closest(HOVER) || t.closest('.magnetic')
      set('hover', !!s.el); show(s.text ? 0 : 1)
    }
    const down = () => set('down', true), up = () => { set('down', false); s.pulse = 1 }
    const leave = () => show(0), enter = () => s.seen && show(s.text ? 0 : 1)

    let raf
    const tick = now => {
      const dt = Math.min(.05, (now - s.last) / 1000); s.last = now
      let ox = s.tx, oy = s.ty
      // gentle magnetic pull of the orbit (never the dot) toward buttons
      if (s.el && s.el.matches('button,.btn,.magnetic')) {
        const b = s.el.getBoundingClientRect()
        ox += (b.left + b.width / 2 - s.tx) * .25; oy += (b.top + b.height / 2 - s.ty) * .25
      }
      const k = reduced ? 1 : 1 - Math.exp(-dt * 11)
      s.x += (ox - s.x) * k; s.y += (oy - s.y) * k
      orbit.current.style.transform = `translate3d(${s.x}px,${s.y}px,0)`

      const lag = Math.hypot(s.tx - s.x, s.ty - s.y)
      const hov = root.current.dataset.hover === '1', dn = root.current.dataset.down === '1'
      s.pulse *= Math.exp(-dt * 6)
      s.r += ((hov ? 1.9 : 1) * (dn ? .75 : 1) + s.pulse * .4 - s.r) * (1 - Math.exp(-dt * 9))
      if (!reduced) s.a += dt * (hov ? 2.2 : 1) * (1 + Math.min(lag / 40, 3)) // speeds up as you move
      dots.current.forEach((d, i) => {
        const [, r, sp] = DOTS[i], ang = s.a * sp + (i * Math.PI * 2) / DOTS.length
        const rad = r * s.r + Math.min(lag * .12, 10)
        d.style.transform = `translate3d(${Math.cos(ang) * rad}px,${Math.sin(ang) * rad}px,0)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    addEventListener('pointermove', move, { passive: true }); addEventListener('pointerdown', down); addEventListener('pointerup', up)
    document.addEventListener('pointerover', over, { passive: true })
    html.addEventListener('mouseleave', leave); html.addEventListener('mouseenter', enter); addEventListener('blur', leave)
    return () => {
      cancelAnimationFrame(raf); html.classList.remove('has-cursor')
      removeEventListener('pointermove', move); removeEventListener('pointerdown', down); removeEventListener('pointerup', up)
      document.removeEventListener('pointerover', over)
      html.removeEventListener('mouseleave', leave); html.removeEventListener('mouseenter', enter); removeEventListener('blur', leave)
    }
  }, [on])

  if (!on) return null
  return <div ref={root} className="cursor" aria-hidden="true" data-hover="0" data-down="0">
    <div ref={orbit} className="cur-orbit">
      {DOTS.map(([sz, , , al], i) => <span key={i} ref={el => (dots.current[i] = el)} style={{ width: sz, height: sz, margin: -sz / 2, opacity: al }} />)}
    </div>
    <div ref={dot} className="cur-dot"><i /></div>
  </div>
}
