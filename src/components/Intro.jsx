import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { intro, finishIntro } from '../store'
import { EASE, DUR } from '../lib/motion'
import logo from '../assets/logo.jpeg'
const TAG = 'Different Perspectives. Limitless Impact.'
// Short branded intro (about 2.3s), once per session; any click or key fast-forwards it.
export default function Intro() {
  const [done, setDone] = useState(!intro.active), root = useRef(), tlRef = useRef()
  useEffect(() => {
    if (done) return
    const html = document.documentElement; html.style.overflow = 'hidden'
    const tl = gsap.timeline({ defaults: { ease: EASE.out }, onComplete: () => { html.style.overflow = ''; finishIntro(); setDone(true) } })
    tl.fromTo('.intro-logo', { clipPath: 'circle(0% at 50% 50%)', scale: .94 }, { clipPath: 'circle(50% at 50% 50%)', scale: 1, duration: .8 })
      .fromTo('.intro-stroke path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: EASE.inOut }, .35)
      .fromTo('.intro-tag i', { yPercent: 110 }, { yPercent: 0, duration: DUR.base, stagger: .08 }, .8)
      .to({}, { duration: .35 })
      .to(root.current, { opacity: 0, duration: DUR.base, ease: EASE.inOut })
    tlRef.current = tl
    const skip = () => tl.timeScale(5)
    addEventListener('keydown', skip)
    return () => { removeEventListener('keydown', skip); tl.kill(); html.style.overflow = '' }
  }, [done])
  if (done) return null
  return <div ref={root} className="intro" role="presentation" onClick={() => tlRef.current && tlRef.current.timeScale(5)}>
    <div className="intro-inner">
      <img className="intro-logo" src={logo} alt="Spectrum Club" width="168" height="168" />
      <svg className="intro-stroke" viewBox="0 0 220 24" aria-hidden="true"><path d="M6 14C50 4 110 22 214 8" pathLength="1" stroke="#ffcf1a" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="1" /></svg>
      <p className="intro-tag" aria-label={TAG}>{TAG.split(' ').map((w, i) => <span key={i} aria-hidden="true"><i>{w}</i></span>)}</p>
    </div></div>
}
