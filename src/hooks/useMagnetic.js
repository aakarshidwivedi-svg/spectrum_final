import { useEffect } from 'react'
import gsap from 'gsap'
import { reduced } from '../store'
// buttons with .magnetic drift toward the pointer (fine pointers only)
export default function useMagnetic() {
  useEffect(() => {
    if (reduced || !matchMedia('(pointer:fine)').matches) return
    const off = []
    document.querySelectorAll('.magnetic').forEach(el => {
      const mv = e => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' }) }
      const lv = () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' })
      el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv)
      off.push(() => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv) })
    })
    return () => off.forEach(f => f())
  }, [])
}
