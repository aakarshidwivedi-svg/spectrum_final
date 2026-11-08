import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Intro from './components/Intro'
import { EASE } from './lib/motion'
import Hero from './components/Hero'
import Sections from './components/Sections'
import Assistant from './components/assistant/Assistant'
import useMascotEvents from './hooks/useMascotEvents'
import CustomCursor from './components/CustomCursor'
import useMagnetic from './hooks/useMagnetic'
import { scene, reduced } from './store'
gsap.registerPlugin(ScrollTrigger)
export default function App() {
  useMagnetic(); useMascotEvents()
  useEffect(() => {
    const root = document.documentElement, nav = document.querySelector('.nav')
    let lenis, tick
    const onScroll = () => {
      scene.scroll = Math.min(scrollY / innerHeight, 1)
      root.style.setProperty('--progress', scrollY / Math.max(1, root.scrollHeight - innerHeight))
    }
    const onMove = e => { root.style.setProperty('--mx', e.clientX + 'px'); root.style.setProperty('--my', e.clientY + 'px') }
    const onClick = e => {
      const a = e.target.closest('a[href^="#"]'); const id = a && a.getAttribute('href')
      if (!id || id.length < 2) return
      const t = document.querySelector(id); if (!t) return
      e.preventDefault(); if (location.hash !== id) history.pushState(null, '', id); lenis ? lenis.scrollTo(t, { offset: -60, duration: 1.4 }) : t.scrollIntoView()
    }
    const onPop = () => { const t = location.hash && document.querySelector(location.hash); lenis ? lenis.scrollTo(t || 0, { offset: t ? -60 : 0 }) : t ? t.scrollIntoView() : scrollTo(0, 0) } // back/forward keep working
    if (!reduced) {
      lenis = new Lenis({ lerp: .09 })
      lenis.on('scroll', e => { ScrollTrigger.update(); nav && nav.classList.toggle('hide', e.direction === 1 && scrollY > 240) })
      tick = t => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    }
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('click', onClick); addEventListener('popstate', onPop)
    if (location.hash) setTimeout(onPop, 150)
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.utils.toArray('.reveal').forEach(el => gsap.from(el.children, { y: 50, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }))
      gsap.from('.band i', { scaleX: 0, transformOrigin: 'left', stagger: .1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.band', start: 'top 85%' } })
      gsap.utils.toArray('.sec .display.sm').forEach(h => gsap.from(h, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: EASE.out, clearProps: 'clipPath', scrollTrigger: { trigger: h, start: 'top 85%' } }))
      gsap.to('.marquee div', { xPercent: -50, ease: 'none', repeat: -1, duration: 28 })
      gsap.to('.hero-copy', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
      document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh())
    })
    return () => { removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); document.removeEventListener('click', onClick); removeEventListener('popstate', onPop); ctx.revert(); if (lenis) { gsap.ticker.remove(tick); lenis.destroy() } }
  }, [])
  return <><Intro /><CustomCursor /><Assistant /><div className="progress" aria-hidden="true"/><main><Hero /><Sections /></main></>
}
