import { FORM, SOCIALS } from '../data/links'
import { ICON } from './SocialIcons'
import { bot } from '../mascotFx'
import logo from '../assets/logo.jpeg'
const NAV = [['About', '#about'], ['Perspectives', '#perspectives'], ['Events', '#events'], ['Team', '#team'], ['Join', '#join']]

export default function Footer() {
  // The logo scrolls back to the top (handled globally for #links) and the floating mascot waves goodbye: no extra mascot is added here.
  const bye = () => { bot.play('goodbye'); bot.say('See you soon! Thanks for visiting Spectrum.', 3600, 3) }
  return <footer className="site-foot">
    <div className="sf-stripe" aria-hidden="true" />
    <div className="sf-top">
      <div className="sf-brand">
        <a className="sf-logo" href="#home" aria-label="Spectrum Club logo, back to top" onClick={bye}><img src={logo} alt="" width="72" height="72" /></a>
        <p className="sf-tag">Different Perspectives. <em>Limitless Impact.</em></p>
      </div>
      <nav className="sf-nav" aria-label="Footer">
        <h2 className="sf-h">Explore</h2>
        <ul>{NAV.map(([t, h]) => <li key={h}><a className="u-link" href={h}>{t}</a></li>)}</ul>
      </nav>
      <div className="sf-conn">
        <h2 className="sf-h">Connect</h2>
        <ul>
          {SOCIALS.map(s => { const I = ICON[s.id]; return <li key={s.id}><a className="u-link" href={s.href} target="_blank" rel="noopener noreferrer"><I size={18} />{s.name}<span className="sr"> (opens in a new tab)</span></a></li> })}
          <li><a className="u-link sf-reg" href={FORM} target="_blank" rel="noopener noreferrer">Register for auditions<span className="sr"> (opens the Google Form in a new tab)</span></a></li>
        </ul>
      </div>
    </div>
    <p className="sf-word" aria-hidden="true">Spectrum</p>
    <div className="sf-bottom">
      <p className="sf-copy">© {new Date().getFullYear()} Spectrum Club</p>
      <a className="u-link sf-top-link" href="#home">Back to top</a>
    </div>
  </footer>
}
