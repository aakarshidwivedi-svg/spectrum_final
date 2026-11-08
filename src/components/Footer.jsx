import { FORM, SOCIALS } from '../data/links'
import { ICON } from './SocialIcons'
import logo from '../assets/logo.jpeg'
const NAV = [['About', '#about'], ['Perspectives', '#perspectives'], ['Events', '#events'], ['Team', '#team'], ['Join', '#join']]

export default function Footer() {
  return <footer className="site-foot">
    <div className="sf-top">
      <div className="sf-brand">
        <img src={logo} alt="Spectrum Club logo" width="72" height="72" />
        <p className="sf-tag">Different Perspectives. Limitless Impact.</p>
        <div className="sf-social">{SOCIALS.map(s => { const I = ICON[s.id]; return <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit Spectrum on ${s.name}`} data-name={s.name}><I size={20} /></a> })}</div>
      </div>
      <nav className="sf-nav" aria-label="Footer"><ul>
        {NAV.map(([t, h]) => <li key={h}><a className="u-link" href={h}>{t}</a></li>)}
        <li><a className="u-link" href={FORM} target="_blank" rel="noopener noreferrer">Register for auditions</a></li>
      </ul></nav>
    </div>
    <p className="sf-copy">© {new Date().getFullYear()} Spectrum Club</p>
  </footer>
}
