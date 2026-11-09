import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { ui } from '../store'
import { initials } from '../data/team'

const FOCUSABLE = 'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'

// Larger profile view for one team member. Only what exists in src/data/team.js is shown: photo, name, role,
// and (when provided) a short bio and links. Closes with Esc, the close button, or a click outside the card.
export default function TeamModal({ member: m, onClose }) {
  const dlg = useRef(), closeBtn = useRef(), [out, setOut] = useState(false), timer = useRef()
  const close = useCallback(() => { if (timer.current) return; setOut(true); timer.current = setTimeout(onClose, 220) }, [onClose])

  useEffect(() => { // page scroll is held still behind the profile
    const html = document.documentElement, prev = html.style.overflow
    ui.lenis?.stop(); html.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => { html.style.overflow = prev; ui.lenis?.start(); clearTimeout(timer.current) }
  }, [])

  useEffect(() => {
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab') return
      const f = [...dlg.current.querySelectorAll(FOCUSABLE)]; if (!f.length) return
      const a = f[0], z = f[f.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key)
  }, [close])

  return createPortal(
    <div className={'tm-modal' + (out ? ' out' : '')} onPointerDown={e => e.target === e.currentTarget && close()}>
      <div ref={dlg} className="tm-dialog" role="dialog" aria-modal="true" aria-labelledby="tm-dname" data-lenis-prevent>
        <button ref={closeBtn} type="button" className="tm-close" aria-label="Close profile" onClick={close}><X size={20} /></button>
        <div className="tm-dphoto">
          {m.photo ? <img src={m.photo} alt={`${m.name}, ${m.role}`} width="400" height="500" draggable="false" /> : <span className="tm-ph" aria-hidden="true">{initials(m.name)}</span>}
        </div>
        <div className="tm-dinfo">
          {m.leader && <p className="tm-badge in">Leadership</p>}
          <h3 id="tm-dname" className="tm-dname">{m.name}</h3>
          <p className="tm-drole">{m.role}</p>
          {m.bio && <p className="tm-bio">{m.bio}</p>}
          {m.links?.length > 0 && <ul className="tm-links">{m.links.map(l => <li key={l.href}><a className="u-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}<span className="sr"> (opens in a new tab)</span></a></li>)}</ul>}
        </div>
      </div>
    </div>, document.body)
}
