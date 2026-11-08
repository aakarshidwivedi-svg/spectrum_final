import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { FORM } from '../data/links'
import { bot, fx } from '../mascotFx'
import { eggTap } from '../lib/egg'
import logo from '../assets/logo.jpeg'
const links = [['About', '#about'], ['Perspectives', '#perspectives'], ['Events', '#events'], ['Team', '#team']]
export default function Navbar() {
  const [open, setOpen] = useState(false), [active, setActive] = useState(''), nav = useRef(), ind = useRef()
  useEffect(() => { // active section follows scroll
    const ids = ['home', 'about', 'perspectives', 'events', 'team', 'join'], els = ids.map(i => document.getElementById(i)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id === 'home' ? '' : '#' + e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el)); return () => io.disconnect()
  }, [])
  useLayoutEffect(() => { // one yellow indicator glides between links
    const a = nav.current?.querySelector('a[aria-current="true"]'), i = ind.current; if (!i) return
    if (!a || innerWidth <= 860) { i.style.opacity = 0; return }
    i.style.opacity = 1; i.style.transform = `translateX(${a.offsetLeft}px)`; i.style.width = a.offsetWidth + 'px'
  }, [active, open])
  const hello = () => { bot.play('greet'); bot.say('Spectrum is all about different perspectives!', 3600, 3); fx.play('wave'); eggTap('logo') } // navigation still happens normally
  return <header className="nav">
    <a href="#home" className="brand" aria-label="Spectrum Club home" onClick={hello}><img src={logo} alt="" width="44" height="44" /><b>SPECTRUM</b></a>
    <nav ref={nav} className={open ? 'open' : ''} aria-label="Primary">
      {links.map(([t, h]) => <a key={t} href={h} aria-current={active === h ? 'true' : undefined} onClick={() => setOpen(false)}>{t}</a>)}
      <a className="btn primary sm" href={FORM} target="_blank" rel="noopener noreferrer" aria-label="Join: open the registration form in a new tab" onClick={() => setOpen(false)}>Join</a>
      <span ref={ind} className="nav-ind" aria-hidden="true" />
    </nav>
    <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </header>
}
