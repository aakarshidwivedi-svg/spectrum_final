import { useState } from 'react'
import { Lightbulb, Users, Cpu, Rocket, ArrowUpRight } from 'lucide-react'
import { FORM, SOCIALS } from '../data/links'
import { ICON } from './SocialIcons'
import Footer from './Footer'
import Team from './Team'
import poster from '../assets/auditions-poster.jpg'
const COLORS = ['#2aa0b5', '#2f6fc4', '#7b5cb8', '#f0629a', '#ea7b2c', '#6b8f3a']
const TAG = 'Different Perspectives. Limitless Impact. '
const VALUES = [['Create', '#ea7b2c'], ['Collaborate', '#7b5cb8'], ['Explore', '#2aa0b5'], ['Belong', '#f0629a']]
const P = [
  [Lightbulb, 'Think Differently', '#ea7b2c', 'Curiosity comes first. We make room for fresh ideas and the unconventional questions that lead somewhere new.'],
  [Users, 'Build Together', '#7b5cb8', 'Learn, collaborate and create as a community, where every member adds a different piece of the picture.'],
  [Cpu, 'Explore Technology', '#2aa0b5', 'Experiment with emerging technologies and turn practical innovation into things that really work.'],
  [Rocket, 'Create Impact', '#f0629a', 'Turn ideas and skills into meaningful real-world outcomes that reach beyond the club.'],
]

function Perspectives() {
  const [on, setOn] = useState(0)
  return <div className="panels">{P.map(([I, t, c, d], i) =>
    <button key={t} className={'panel' + (on === i ? ' on' : '')} style={{ '--c': c }} aria-expanded={on === i}
      onPointerEnter={e => e.pointerType === 'mouse' && setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)}>
      <span className="idx">0{i + 1}</span><I size={30} className="pi"/>
      <h3>{t}</h3><p>{d}</p>
    </button>)}</div>
}

export default function Sections() {
  return <>
    <section id="about" className="sec about">
      <div className="reveal"><p className="eyebrow">About Spectrum</p>
        <h2 className="display sm">One club. Every <span className="grad">perspective</span>.</h2>
        <p className="lead">Spectrum is a creative technology club that brings together people with different perspectives, technical interests and ideas.</p>
        <ul className="values" aria-label="What Spectrum stands for">{VALUES.map(([v, c]) => <li key={v} style={{ '--c': c }}>{v}</li>)}</ul></div>
      <div className="reveal"><p className="vision-label">Our vision</p>
        <blockquote className="vision">To build a community where diverse perspectives meet technology, creativity and collaboration — empowering individuals to explore new possibilities, turn ideas into meaningful innovations and create an impact beyond boundaries.</blockquote>
        <div className="band" aria-hidden="true">{COLORS.map(c => <i key={c} style={{ background: c }}/>)}</div></div>
    </section>

    <section id="perspectives" className="sec tint"><div className="reveal"><p className="eyebrow">Our Perspectives</p>
      <h2 className="display sm">Four ways of <span className="grad">seeing it</span>.</h2></div><Perspectives/></section>

    <section id="events" className="sec"><div className="reveal"><p className="eyebrow">Events</p><h2 className="display sm">What we gather for.</h2></div>
      <article className="aud-card reveal" aria-label="Spectrum auditions">
        <figure className="aud-poster"><img src={poster} alt="Spectrum auditions poster: Something different is here. Auditions are open and begin 17 November. Scan the QR code to register." width="1059" height="1600" loading="lazy" /></figure>
        <div className="aud-info">
          <p className="aud-date">Auditions Begin: 17 November</p>
          <h3 className="display">Auditions are <span className="grad">open</span>.</h3>
          <p className="lead">Auditions for the Spectrum founding crew and junior core begin on 17 November. Register through the official form.</p>
          <a className="btn primary magnetic" href={FORM} target="_blank" rel="noopener noreferrer">Register for auditions <ArrowUpRight size={18} /><span className="sr"> (opens the Google Form in a new tab)</span></a>
        </div>
      </article></section>

    <Team />

    <section id="join" className="join">
      <div className="marquee" aria-hidden="true"><div>{Array(8).fill(TAG).join('')}</div></div>
      <div className="sec reveal aud">
        <div>
          <p className="aud-date">Auditions Begin: 17 November</p>
          <h2 className="display">Join <span className="grad">Spectrum</span></h2>
          <p className="lead">Ready to be part of something different? Register now for the SPECTRUM founding crew and junior core auditions!</p>
          <a className="btn primary light magnetic" href={FORM} target="_blank" rel="noopener noreferrer">REGISTER FOR AUDITIONS <ArrowUpRight size={18} /><span className="sr"> (opens the Google Form in a new tab)</span></a>
          <div className="follow"><span>Follow us</span>{SOCIALS.map(s => { const I = ICON[s.id]; return <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit Spectrum on ${s.name}`}><I size={18} />{s.name}</a> })}</div>
        </div>
      </div>
    </section>
    <Footer />
  </>
}
