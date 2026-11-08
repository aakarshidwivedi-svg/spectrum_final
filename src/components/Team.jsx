import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TEAM } from '../data/team'
import { reduced } from '../store'
gsap.registerPlugin(ScrollTrigger)

const COLORS = ['#2aa0b5', '#2f6fc4', '#7b5cb8', '#f0629a', '#ea7b2c', '#6b8f3a']

export default function Team() {
  const root = useRef()
  useEffect(() => { // staggered entrance
    if (reduced) return
    const ctx = gsap.context(() => gsap.from('.tm-card', { y: 48, opacity: 0, duration: .9, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.tm-grid', start: 'top 82%', once: true } }), root)
    return () => ctx.revert()
  }, [])
  return <section id="team" className="sec peach tm-sec" ref={root}>
    <div className="reveal"><p className="eyebrow">Our Team</p><h2 className="display sm">The people behind the colour.</h2></div>
    <ul className="tm-grid">
      {TEAM.map((m, i) => <li key={m.id} className="tm-card" style={{ '--c': COLORS[(i * 2) % 6] }}>
        <div className="tm-photo">
          {m.photo ? <img src={m.photo} alt={`${m.name}, ${m.role}`} width="640" height="800" loading="lazy" draggable="false" /> : <span className="tm-ph" aria-hidden="true" />}
        </div>
        <h3 className="tm-name">{m.name}</h3>
        <p className="tm-role">{m.role}</p>
      </li>)}
    </ul>
  </section>
}
