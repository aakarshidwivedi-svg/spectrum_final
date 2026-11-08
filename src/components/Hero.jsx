import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { scene, reduced, hasWebGL, intro } from '../store'
import Navbar from './Navbar'
import DotField from './DotField'
import charImg from '../assets/spectrum-character.png'
import logo from '../assets/logo.jpeg'
const Hero3D = lazy(() => import('./Hero3D'))
const hover = v => ({ onPointerEnter: () => (scene.hover = v), onPointerLeave: () => (scene.hover = 0), onFocus: () => (scene.hover = v), onBlur: () => (scene.hover = 0) })

export default function Hero() {
  const ref = useRef(), [gl] = useState(() => hasWebGL())
  const lowPower = innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } }); intro.done.then(() => tl.play())
      tl
        .from('.hl', { yPercent: 110, duration: 1.2, stagger: .12 })
        .from('.hero-fade', { y: 24, opacity: 0, duration: .9, stagger: .1 }, '-=.7')
        .from('.stage', { scale: .7, opacity: 0, duration: 1.6 }, 0)
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="home" className="hero" ref={ref}>
      <DotField spacing={innerWidth < 768 ? 20 : 16} />
      <Navbar />
      <div className="stage" data-cursor aria-hidden="true">
        <img className="char-fallback" src={charImg} alt="Spectrum mascot" />
        {gl && <Suspense fallback={null}><Hero3D lowPower={lowPower}/></Suspense>}
      </div>
      <div className="hero-copy">
        <p className="hero-brand hero-fade"><img src={logo} alt="" width="52" height="52" /><span>Spectrum Club</span></p>
        <h1 className="display" aria-label="Different Perspectives. Limitless Impact.">
          <span className="line"><span className="hl">Different</span></span>
          <span className="line"><span className="hl grad">Perspectives.</span></span>
          <span className="line"><span className="hl">Limitless</span></span>
          <span className="line"><span className="hl">Impact.</span></span>
        </h1>
        <p className="lead hero-fade">A community where technology, creativity and collaboration meet — and every viewpoint adds a new colour to what we build together.</p>
        <div className="cta hero-fade">
          <a className="btn primary magnetic" href="#about" {...hover(1)}>Explore Spectrum <ArrowUpRight size={18}/></a>
          <a className="btn ghost magnetic" href="#perspectives" {...hover(.6)}>Discover Our Story</a>
        </div>
      </div>
    </section>
  )
}
