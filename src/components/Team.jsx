import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TEAM, initials } from '../data/team'
import { reduced } from '../store'
import { EASE } from '../lib/motion'
import TeamModal from './TeamModal'
gsap.registerPlugin(ScrollTrigger)

const COLORS = ['#2aa0b5', '#2f6fc4', '#7b5cb8', '#f0629a', '#ea7b2c', '#6b8f3a']
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function Card({ m, i, dup, onOpen }) {
  return <li className={'tm-card' + (m.leader ? ' lead' : '')} style={{ '--c': COLORS[(i * 2) % 6] }}>
    <button type="button" className="tm-btn" data-id={m.id} tabIndex={dup ? -1 : undefined} aria-haspopup="dialog"
      aria-label={`${m.name}, ${m.role}. Open profile`} onClick={e => onOpen(m, e.currentTarget)}>
      <span className="tm-photo">
        {m.photo ? <img src={m.photo} alt="" width="400" height="500" decoding="async" draggable="false" /> : <span className="tm-ph" aria-hidden="true">{initials(m.name)}</span>}
        {m.leader && <span className="tm-badge">Leadership</span>}
      </span>
      <span className="tm-name">{m.name}</span>
      <span className="tm-role">{m.role}</span>
    </button>
  </li>
}

// Continuously moving member showcase (right to left). The list is rendered in several identical "sets"; the track is
// shifted by exactly one set's width when it wraps, so the loop has no visible seam. Movement is driven by the shared
// gsap ticker: hover / keyboard focus / an open profile ease it to a stop, and it eases back up when released.
// Dragging (mouse or touch) moves the track directly and keeps its momentum on release.
export default function Team() {
  const root = useRef(), view = useRef(), track = useRef()
  const [reps, setReps] = useState(reduced ? 1 : 2), [open, setOpen] = useState(null)
  const S = useRef({ x: 0, f: 1, v: 0, vi: 0, hover: false, focus: false, drag: false, pressed: false, moved: false, modal: false, vis: true, setW: 0, speed: 46, sx: 0, lx: 0, lt: 0, x0: 0, pid: -1, openId: '' }).current

  useLayoutEffect(() => {
    if (reduced) return // reduced motion: a plain scrollable, snap-aligned strip (see .tm-view.static)
    const vw = view.current, tr = track.current
    S.x = parseFloat(getComputedStyle(root.current).paddingLeft) || 0 // first card starts at the page margin
    tr.style.transform = `translate3d(${S.x}px,0,0)`

    const measure = () => { // the distance between two identical sets is the loop length
      const sets = tr.querySelectorAll('.tm-set'); if (sets.length < 2) return
      const w = sets[1].getBoundingClientRect().left - sets[0].getBoundingClientRect().left
      if (!(w > 10)) return
      S.setW = w; tr.style.marginLeft = -w + 'px'; S.speed = innerWidth < 768 ? 34 : 46
      const need = Math.max(2, Math.ceil(vw.clientWidth / w) + 1) // enough sets that the viewport is always covered
      setReps(r => (r === need ? r : need))
    }
    measure()

    const tick = (_t, ms) => {
      const w = S.setW; if (!w) return
      const dt = Math.min(.05, ms / 1000), paused = S.hover || S.focus || S.drag || S.modal || !S.vis
      if (!S.vis && S.f < .001 && !S.v) return
      S.f += ((paused ? 0 : 1) - S.f) * (1 - Math.exp(-dt * 5)) // eases to a stop and back up, never snaps
      if (!S.drag) { S.x += (-S.speed * S.f + S.v) * dt; S.v *= Math.exp(-dt * 2.8); if (Math.abs(S.v) < .5) S.v = 0 }
      S.x = ((S.x % w) + w) % w // wrap inside one set length: seamless
      tr.style.transform = `translate3d(${S.x.toFixed(2)}px,0,0)`
    }
    gsap.ticker.add(tick)

    const down = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      S.pid = e.pointerId; S.pressed = true; S.moved = false; S.sx = S.lx = e.clientX; S.lt = performance.now(); S.x0 = S.x; S.v = 0; S.vi = 0
    }
    const move = e => {
      if (!S.pressed || e.pointerId !== S.pid) return
      const dx = e.clientX - S.sx
      if (!S.drag) { // a few pixels of travel separates a click from a drag
        if (Math.abs(dx) < 6) return
        S.drag = true; S.moved = true; vw.classList.add('is-drag'); try { vw.setPointerCapture(e.pointerId) } catch {}
      }
      const now = performance.now(), dt = Math.max(.008, (now - S.lt) / 1000)
      S.x = S.x0 + dx; S.vi += ((e.clientX - S.lx) / dt - S.vi) * .35; S.lx = e.clientX; S.lt = now
    }
    const up = e => {
      if (e.pointerId !== S.pid) return
      if (S.drag) S.v = performance.now() - S.lt > 90 ? 0 : clamp(S.vi, -2200, 2200) // flick keeps its momentum
      S.drag = S.pressed = false; S.pid = -1; vw.classList.remove('is-drag'); try { vw.releasePointerCapture(e.pointerId) } catch {}
    }
    const click = e => { if (S.moved) { e.stopPropagation(); e.preventDefault(); S.moved = false } } // a drag must not open a profile
    const enter = e => { if (e.pointerType !== 'touch') S.hover = true }
    const leave = e => { if (e.pointerType !== 'touch') S.hover = false }
    const focusin = e => { // keyboard focus pauses the loop and brings the focused card into view
      vw.scrollLeft = 0
      if (!e.target.matches(':focus-visible')) return
      S.focus = true
      const r = e.target.getBoundingClientRect(), v = vw.getBoundingClientRect(), pad = 24
      if (r.left < v.left + pad) S.x += v.left + pad - r.left; else if (r.right > v.right - pad) S.x -= r.right - (v.right - pad)
    }
    const focusout = e => { if (!vw.contains(e.relatedTarget)) S.focus = false }
    const keep = () => { vw.scrollLeft = 0 }

    const io = new IntersectionObserver(([e]) => { S.vis = e.isIntersecting }, { rootMargin: '80px' }); io.observe(vw) // idle while off screen
    const ro = new ResizeObserver(measure); ro.observe(vw)
    vw.addEventListener('pointerdown', down); vw.addEventListener('pointermove', move); vw.addEventListener('pointerup', up); vw.addEventListener('pointercancel', up)
    vw.addEventListener('click', click, true); vw.addEventListener('pointerenter', enter); vw.addEventListener('pointerleave', leave)
    vw.addEventListener('focusin', focusin); vw.addEventListener('focusout', focusout); vw.addEventListener('scroll', keep)
    return () => {
      gsap.ticker.remove(tick); io.disconnect(); ro.disconnect()
      vw.removeEventListener('pointerdown', down); vw.removeEventListener('pointermove', move); vw.removeEventListener('pointerup', up); vw.removeEventListener('pointercancel', up)
      vw.removeEventListener('click', click, true); vw.removeEventListener('pointerenter', enter); vw.removeEventListener('pointerleave', leave)
      vw.removeEventListener('focusin', focusin); vw.removeEventListener('focusout', focusout); vw.removeEventListener('scroll', keep)
      tr.style.marginLeft = ''; tr.style.transform = ''
    }
  }, [S])

  useEffect(() => { S.modal = !!open }, [open, S]) // an open profile holds the loop still

  useEffect(() => { // the showcase eases in once as it scrolls into view
    if (reduced) return
    const ctx = gsap.context(() => gsap.from(view.current, { y: 40, opacity: 0, duration: .9, ease: EASE.out, scrollTrigger: { trigger: view.current, start: 'top 88%', once: true } }), root)
    return () => ctx.revert()
  }, [])

  const onOpen = useCallback((m) => { S.openId = m.id; setOpen(m) }, [S])
  const onClose = useCallback(() => { // hand focus back to the card that opened the profile (its original, focusable copy)
    setOpen(null)
    const b = track.current?.querySelector(`.tm-set[data-set="0"] [data-id="${S.openId}"]`)
    if (b) requestAnimationFrame(() => b.focus({ preventScroll: true }))
  }, [S])

  return <section id="team" className="sec peach tm-sec" ref={root}>
    <div className="reveal"><p className="eyebrow">Our Team</p><h2 className="display sm">The people behind the colour.</h2></div>
    <div ref={view} className={'tm-view' + (reduced ? ' static' : '')} role="region" aria-label="Spectrum team members">
      <div ref={track} className="tm-track">
        {Array.from({ length: reps }, (_, k) =>
          <ul key={k} className="tm-set" data-set={k} aria-hidden={k ? 'true' : undefined} aria-label={k ? undefined : 'Team members'}>
            {TEAM.map((m, i) => <Card key={m.id} m={m} i={i} dup={k > 0} onOpen={onOpen} />)}
          </ul>)}
      </div>
    </div>
    {open && <TeamModal member={open} onClose={onClose} />}
  </section>
}
